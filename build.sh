#!/usr/bin/env bash
# build.sh — TEKK Solutions production build script
#
# Usage
#   chmod +x build.sh
#   ./build.sh
#
# Platforms
#   Render  → Build Command:  ./build.sh
#             Start Command:  gunicorn "website:create_app()" -c gunicorn_config.py
#   Railway → set Build Command to ./build.sh in railway.toml or the dashboard
#   VPS     → run manually or wire into a CI step before systemd service restart
#
# Prerequisites (set as environment variables on the platform):
#   DATABASE_URL  — postgresql://... connection string (Neon or other)
#   SECRET_KEY    — random 32-byte hex string
#   PORT          — injected automatically by Render/Railway (default: 8000)

set -euo pipefail

echo ""
echo "══════════════════════════════════════════"
echo "  TEKK Solutions — Production Build"
echo "══════════════════════════════════════════"
echo ""

# ── Step 1: Python dependencies ────────────────────────────────────────────
echo "── [1/3] Installing Python dependencies"
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
echo "    ✓ Python deps installed"

# ── Step 2: React SPA build ────────────────────────────────────────────────
# Vite's outDir is already set to ../website/static/portfolio in vite.config.js
# so the build output lands directly in Flask's static tree — no move needed.
echo ""
echo "── [2/3] Building React SPA (tekk-portfolio)"
cd tekk-portfolio

# `npm ci` is faster, reproducible, and respects package-lock.json exactly.
npm ci --prefer-offline --silent

# Copy static image assets from Flask's static dir so Vite can bundle
# any public-dir references during the build.
if [ -d "../website/static/images" ]; then
  mkdir -p public/images
  cp -r ../website/static/images/. public/images/
fi

npm run build
cd ..
echo "    ✓ React SPA built → website/static/portfolio/"

# ── Step 3: Database migrations ────────────────────────────────────────────
# Requires DATABASE_URL to be set.  On a first-ever deploy you must have
# already run `flask db init` + `flask db migrate` locally and committed
# the migrations/ directory to the repo.
echo ""
echo "── [3/3] Running database migrations"
export FLASK_APP="${FLASK_APP:-website:create_app}"
flask db upgrade
echo "    ✓ Migrations applied"

echo ""
echo "══════════════════════════════════════════"
echo "  Build complete. Start with:"
echo "  gunicorn \"website:create_app()\" -c gunicorn_config.py"
echo "══════════════════════════════════════════"
echo ""
