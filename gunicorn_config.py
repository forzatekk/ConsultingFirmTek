"""Gunicorn configuration for TEKK Solutions production deployment.

Start command (used by Procfile and Render/Railway start command):
    gunicorn "website:create_app()" -c gunicorn_config.py

Tuning guide
────────────
workers      (2 × CPU) + 1 is the standard formula. Most PaaS instances
             (Render Starter, Railway Hobby) have 1–2 vCPUs, giving 3–5
             workers. Override via GUNICORN_WORKERS to tune without a redeploy.

worker_class gthread (built-in threaded sync workers) handles the I/O-bound
             mix of DB queries + static-file serving without requiring extra
             packages. Each worker runs `threads` green threads concurrently.
             Max concurrent requests = workers × threads.

preload_app  Load the Flask app once before forking. Workers share the read-
             only memory pages (OS copy-on-write), reducing total RAM usage by
             ~30–50 % on multi-worker setups. Note: any code that opens file
             descriptors at import time must be fork-safe.
"""

import multiprocessing
import os

# ── Workers ────────────────────────────────────────────────────────────────
_cpu    = multiprocessing.cpu_count()
workers = int(os.environ.get("GUNICORN_WORKERS", min((2 * _cpu) + 1, 4)))
worker_class = "gthread"
threads = 2  # 2 threads × 4 workers = 8 concurrent requests max

# ── Binding ────────────────────────────────────────────────────────────────
# Render and Railway inject $PORT; fall back to 8000 for local / VPS use.
bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"

# ── Timeouts ───────────────────────────────────────────────────────────────
timeout   = 120   # kill a hung worker after 2 min; covers slow DB queries
keepalive = 5     # seconds to hold an idle keep-alive connection open

# ── Worker recycling ───────────────────────────────────────────────────────
# Restart workers periodically to reclaim memory from long-lived processes.
max_requests        = 1_000
max_requests_jitter = 100   # stagger restarts so not all workers recycle at once

# ── Logging ────────────────────────────────────────────────────────────────
# Write to stdout/stderr so Render/Railway/systemd capture them natively.
accesslog = "-"
errorlog  = "-"
loglevel  = "info"

# ── App loading ────────────────────────────────────────────────────────────
preload_app = True
