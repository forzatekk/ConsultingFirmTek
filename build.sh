#!/usr/bin/env bash
# =============================================================================
#  build.sh — TEKK Solutions production build & deployment script
# =============================================================================
#
#  Platform setup
#  ─────────────────────────────────────────────────────────────────────────────
#  Render   Build Command : ./build.sh
#           Start Command : gunicorn wsgi:app -c gunicorn_config.py
#
#  Railway  Build Command : ./build.sh          (dashboard → Settings → Build)
#           Start Command : gunicorn wsgi:app -c gunicorn_config.py
#
#  VPS      Run manually or hook into a CI pipeline before restarting the
#           systemd service.
#
#  Required environment variables (set on the platform, NOT in this file)
#  ─────────────────────────────────────────────────────────────────────────────
#  DATABASE_URL   postgresql://user:pass@host/dbname   (Neon or other PG host)
#  SECRET_KEY     random 32-byte hex string
#
#  Injected automatically by the platform
#  ─────────────────────────────────────────────────────────────────────────────
#  PORT           Render / Railway inject this; gunicorn_config.py reads it

set -euo pipefail

# ─── Terminal helpers ─────────────────────────────────────────────────────────
BOLD='\033[1m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
_step()  { echo -e "\n${CYAN}${BOLD}[$(date +%H:%M:%S)] $*${NC}"; }
_ok()    { echo -e "  ${GREEN}✓${NC}  $*"; }
_warn()  { echo -e "  ${YELLOW}⚠${NC}  $*" >&2; }
_abort() {
  echo -e "\n  ${RED}${BOLD}✗  FATAL: $1${NC}" >&2
  # Print any extra lines as indented context
  shift
  for line in "$@"; do echo -e "     ${line}" >&2; done
  exit 1
}

# Resolve the repo root regardless of where the script is called from
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ─── Banner ───────────────────────────────────────────────────────────────────
echo -e "${BOLD}"
echo "  ╔══════════════════════════════════════════╗"
echo "  ║      TEKK Solutions — Production Build      ║"
echo "  ╚══════════════════════════════════════════╝"
echo -e "${NC}"
echo "  Repo root : ${REPO_ROOT}"
echo "  Started   : $(date)"
echo ""

# =============================================================================
#  PRE-FLIGHT CHECKS
#  Fail loudly and early rather than midway through a 3-minute build.
# =============================================================================
_step "Pre-flight checks"

# ── Required tooling ──────────────────────────────────────────────────────────
PY_BIN=""
for candidate in python3 python; do
  if command -v "${candidate}" >/dev/null 2>&1; then
    PY_BIN="${candidate}"
    break
  fi
done
[[ -n "${PY_BIN}" ]] || _abort "Python not found in PATH"

PIP_BIN=""
for candidate in pip3 pip; do
  if command -v "${candidate}" >/dev/null 2>&1; then
    PIP_BIN="${candidate}"
    break
  fi
done
[[ -n "${PIP_BIN}" ]] || _abort "pip not found in PATH"

command -v node >/dev/null 2>&1 || _abort "Node.js not found in PATH"
command -v npm  >/dev/null 2>&1 || _abort "npm not found in PATH"

PY_VER="$(${PY_BIN} --version 2>&1)"
NODE_VER="$(node --version)"
NPM_VER="$(npm --version)"
_ok "Python : ${PY_VER}"
_ok "Node   : ${NODE_VER}"
_ok "npm    : ${NPM_VER}"

# ── Required files ────────────────────────────────────────────────────────────
[[ -f "${REPO_ROOT}/requirements.txt" ]]           || _abort "requirements.txt not found at repo root"
[[ -f "${REPO_ROOT}/tekk-portfolio/package.json" ]] || _abort "tekk-portfolio/package.json not found"
[[ -f "${REPO_ROOT}/tekk-portfolio/vite.config.js" ]] || _abort "tekk-portfolio/vite.config.js not found"

# ── Secret key sanity ─────────────────────────────────────────────────────────
if [[ "${SECRET_KEY:-dev_key}" == "dev_key" ]]; then
  _warn "SECRET_KEY is unset or still 'dev_key' — set a strong random value in production"
fi

# ── Database URL and migrations directory ─────────────────────────────────────
DB_MIGRATE=true
if [[ -z "${DATABASE_URL:-}" ]]; then
  _warn "DATABASE_URL is not set — database migration step will be skipped"
  DB_MIGRATE=false
elif [[ ! -d "${REPO_ROOT}/migrations" ]]; then
  _abort \
    "migrations/ directory not found in the repository." \
    "" \
    "You must initialise Alembic locally before the first production deploy:" \
    "" \
    "  export DATABASE_URL=<your-neon-url>" \
    "  flask db init" \
    "  flask db migrate -m \"initial schema\"" \
    "  flask db upgrade" \
    "  git add migrations/" \
    "  git commit -m \"Add initial Alembic migrations\"" \
    "  git push" \
    "" \
    "Then redeploy."
fi

_ok "Pre-flight complete"

# =============================================================================
#  STEP 1 — Python dependencies
# =============================================================================
_step "[1/4] Python dependencies"

${PIP_BIN} install --upgrade pip --quiet
${PIP_BIN} install -r "${REPO_ROOT}/requirements.txt" --quiet

_ok "Python deps installed ($(${PIP_BIN} list 2>/dev/null | wc -l | tr -d ' ') packages)"

# =============================================================================
#  STEP 2 — React SPA build
# =============================================================================
_step "[2/4] React SPA  (tekk-portfolio → website/static/portfolio)"

cd "${REPO_ROOT}/tekk-portfolio"

# ── Image asset sync ──────────────────────────────────────────────────────────
# Vite's public/ directory is copied as-is into the build output.
# Sync Flask's canonical image store so the SPA bundle can reference them.
FLASK_IMAGES="${REPO_ROOT}/website/static/images"
PUBLIC_IMAGES="${REPO_ROOT}/tekk-portfolio/public/images"

if [[ -d "${FLASK_IMAGES}" ]]; then
  mkdir -p "${PUBLIC_IMAGES}"
  # Use rsync when available (faster, --delete removes stale files).
  # Fall back to cp -r for minimal container images.
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete "${FLASK_IMAGES}/" "${PUBLIC_IMAGES}/"
  else
    cp -r "${FLASK_IMAGES}/." "${PUBLIC_IMAGES}/"
  fi
  IMG_COUNT=$(find "${PUBLIC_IMAGES}" -type f | wc -l | tr -d ' ')
  _ok "Synced ${IMG_COUNT} image(s) → tekk-portfolio/public/images/"
fi

# ── Node dependency install ───────────────────────────────────────────────────
# npm ci  →  reproducible, fast, requires package-lock.json to be committed
# npm install  →  generates / updates the lockfile; used as a fallback
if [[ -f package-lock.json ]]; then
  _ok "package-lock.json found — running npm ci"
  npm ci --no-audit --no-fund
else
  _warn "package-lock.json not committed — running npm install"
  _warn "Commit package-lock.json for reproducible builds: git add tekk-portfolio/package-lock.json"
  npm install --no-audit --no-fund
fi

# ── Vite production build ─────────────────────────────────────────────────────
# outDir in vite.config.js is  ../website/static/portfolio
# base    is                   /static/portfolio/
# No manual asset move is needed — Vite writes directly into Flask's static tree.
npm run build

# ── Build output verification ─────────────────────────────────────────────────
PORTFOLIO_DIR="${REPO_ROOT}/website/static/portfolio"
INDEX_HTML="${PORTFOLIO_DIR}/index.html"

[[ -f "${INDEX_HTML}" ]] \
  || _abort \
       "Vite build did not produce website/static/portfolio/index.html" \
       "Check the npm run build output above for errors."

ASSETS_DIR="${PORTFOLIO_DIR}/assets"
JS_COUNT=0; CSS_COUNT=0
if [[ -d "${ASSETS_DIR}" ]]; then
  JS_COUNT=$(find  "${ASSETS_DIR}" -name "*.js"  | wc -l | tr -d ' ')
  CSS_COUNT=$(find "${ASSETS_DIR}" -name "*.css" | wc -l | tr -d ' ')
fi

_ok "website/static/portfolio/index.html  ✓"
_ok "JS bundles  : ${JS_COUNT} file(s)"
_ok "CSS bundles : ${CSS_COUNT} file(s)"

cd "${REPO_ROOT}"

# =============================================================================
#  STEP 3 — Asset mapping sanity check
# =============================================================================
_step "[3/4] Asset mapping verification"

# Confirm the base path embedded in the built index.html matches the Flask route.
# Flask serves static/portfolio/* at /static/portfolio/ — the Vite base must match.
EXPECTED_BASE="/static/portfolio/"
if grep -q "${EXPECTED_BASE}" "${INDEX_HTML}"; then
  _ok "Asset base path '${EXPECTED_BASE}' confirmed in index.html"
else
  _warn "Could not confirm base path '${EXPECTED_BASE}' in index.html"
  _warn "Verify that vite.config.js has:  base: '${EXPECTED_BASE}'"
fi

# Check the /landing Flask route file exists and has send_from_directory
VIEWS_FILE="${REPO_ROOT}/website/views.py"
if grep -q "send_from_directory" "${VIEWS_FILE}" && grep -q "/landing" "${VIEWS_FILE}"; then
  _ok "/landing route with send_from_directory confirmed in views.py"
else
  _warn "Could not verify /landing route in website/views.py — check manually"
fi

# =============================================================================
#  STEP 4 — Database migrations
# =============================================================================
_step "[4/4] Database migrations"

if [[ "${DB_MIGRATE}" == "false" ]]; then
  _warn "Skipped — DATABASE_URL is not set"
else
  export FLASK_APP="${FLASK_APP:-website:create_app}"

  # Run flask db upgrade; capture output so we can show it on failure
  if flask db upgrade; then
    _ok "flask db upgrade completed successfully"
  else
    _abort \
      "flask db upgrade failed." \
      "" \
      "Common causes:" \
      "  • DATABASE_URL is set but unreachable (check firewall / IP allowlist)" \
      "  • The migration scripts in migrations/versions/ have conflicts" \
      "  • The DB user lacks CREATE TABLE / ALTER TABLE privileges" \
      "" \
      "Run  flask db current  and  flask db history  locally to debug."
  fi
fi

# =============================================================================
#  BUILD SUMMARY
# =============================================================================
echo ""
echo -e "${GREEN}${BOLD}  ══════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}    Build complete — $(date)${NC}"
echo -e "${GREEN}${BOLD}  ══════════════════════════════════════════${NC}"
echo ""
echo "  Flask static assets  →  website/static/portfolio/"
echo "  To start the server  →  gunicorn wsgi:app -c gunicorn_config.py"
echo ""
