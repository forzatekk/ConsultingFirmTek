"""Gunicorn configuration — TEKK Solutions production server.

Entry point
───────────
    gunicorn wsgi:app -c gunicorn_config.py

Every tunable has a matching environment variable so the server can be
re-tuned without a code change or redeploy.

Worker count reference (GUNICORN_WORKERS)
─────────────────────────────────────────
Formula: (2 × vCPU) + 1.  Set GUNICORN_WORKERS explicitly on PaaS —
multiprocessing.cpu_count() returns the HOST core count, not the
container's vCPU slice.

  ┌──────────────────────────────┬───────┬─────────┬────────────────────────┐
  │ Plan                         │ vCPU  │ Workers │ Max concurrent (×thd)  │
  ├──────────────────────────────┼───────┼─────────┼────────────────────────┤
  │ Render Starter / Railway Hob │  0.5  │    2    │  2 × 2 threads =  4    │
  │ Render Standard              │  1    │    3    │  3 × 2 threads =  6    │
  │ Render Pro / Railway Pro     │  2    │    5    │  5 × 2 threads = 10    │
  │ VPS 4-core                   │  4    │    9    │  9 × 2 threads = 18    │
  │ VPS 8-core                   │  8    │   17    │ 17 × 2 threads = 34    │
  └──────────────────────────────┴───────┴─────────┴────────────────────────┘

Worker class rationale (gthread)
─────────────────────────────────
gthread (built-in threaded sync workers) is the right choice here:
  + Handles I/O-bound Flask workloads (DB queries, file serving) well
  + No additional packages required
  + Compatible with SQLAlchemy's thread-local session model
  ✗ gevent offers higher concurrency but requires monkey-patching, which
    conflicts with SQLAlchemy's threading internals on this stack.

preload_app
───────────
Loading the app before fork lets all workers share the app's read-only
memory pages (OS copy-on-write), reducing per-worker RAM by ~30–50%.
Flask-SQLAlchemy's pool_pre_ping + NullPool-on-fork behaviour makes
this safe: stale pre-fork connections are detected and replaced.
"""

import multiprocessing
import os

# ── Workers ───────────────────────────────────────────────────────────────────
_cpu = multiprocessing.cpu_count()
# Uncapped formula — set GUNICORN_WORKERS on PaaS to match the vCPU allocation.
workers = int(os.environ.get("GUNICORN_WORKERS", (2 * _cpu) + 1))

# ── Worker class and threading ────────────────────────────────────────────────
worker_class = "gthread"
threads      = int(os.environ.get("GUNICORN_THREADS", 2))

# ── Binding ───────────────────────────────────────────────────────────────────
# Render and Railway inject $PORT; fall back to 8000 for VPS / local testing.
bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"

# ── Trusted proxy ─────────────────────────────────────────────────────────────
# Render and Railway terminate TLS at their edge and forward via a local proxy.
# Gunicorn must trust that proxy so it passes X-Forwarded-Proto/Host to Flask.
# Flask's ProxyFix(x_proto=1, x_host=1) in __init__.py then rewrites the URL
# scheme to HTTPS — required for url_for(_external=True) to produce https://.
# Set GUNICORN_FORWARDED_IPS to a comma-separated list to restrict further.
forwarded_allow_ips = os.environ.get("GUNICORN_FORWARDED_IPS", "*")

# ── Timeouts ──────────────────────────────────────────────────────────────────
timeout          = int(os.environ.get("GUNICORN_TIMEOUT", 120))
# Workers finish in-flight requests during a rolling restart (SIGTERM window).
graceful_timeout = int(os.environ.get("GUNICORN_GRACEFUL_TIMEOUT", 30))
keepalive        = 5

# ── Worker recycling ──────────────────────────────────────────────────────────
# Periodic restarts reclaim memory from long-lived worker processes.
max_requests        = int(os.environ.get("GUNICORN_MAX_REQUESTS", 1_000))
max_requests_jitter = 100   # stagger restarts so all workers don't recycle at once

# ── Temp files ────────────────────────────────────────────────────────────────
# Worker heartbeat files on the RAM-backed tmpfs instead of disk I/O.
# /dev/shm is available on Linux (Render, Railway, most VPS).  The assignment
# is skipped on macOS/Windows so local dev is unaffected.
if os.path.isdir("/dev/shm"):
    worker_tmp_dir = "/dev/shm"

# ── Logging ───────────────────────────────────────────────────────────────────
accesslog      = "-"     # stdout  →  captured by Render/Railway/systemd/Docker
errorlog       = "-"     # stderr  →  same
loglevel       = os.environ.get("GUNICORN_LOG_LEVEL", "info")
capture_output = True    # route app's print()/logging calls into Gunicorn's error log

# ── App loading ───────────────────────────────────────────────────────────────
preload_app = True


# ── Server lifecycle hooks ────────────────────────────────────────────────────

def on_starting(server):
    server.log.info(
        "Starting Gunicorn — %d worker(s) × %d thread(s) [%s]",
        workers, threads, worker_class,
    )


def on_exit(server):
    server.log.info("Gunicorn shutting down cleanly")


def worker_exit(server, worker):
    # Explicitly dispose SQLAlchemy's connection pool in the exiting worker
    # so database connections are returned cleanly rather than left open until
    # the TCP keepalive timeout.
    try:
        from website import db
        db.engine.dispose()
    except Exception:
        pass
    server.log.debug("Worker %d exited", worker.pid)
