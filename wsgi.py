"""WSGI entry point for production deployment.

This module is what Gunicorn (and any other WSGI server) imports.
It calls the application factory exactly once at module level; when
preload_app = True is set in gunicorn_config.py, Gunicorn loads this
module before forking workers so all workers share the read-only memory
pages of the initialised app (OS copy-on-write).

Start the server
────────────────
    gunicorn wsgi:app -c gunicorn_config.py

Alternative WSGI servers
────────────────────────
    uWSGI  →  uwsgi --module wsgi:app --ini uwsgi.ini
    Waitress (Windows/dev) →  waitress-serve --call wsgi:app

Why not run.py in production?
──────────────────────────────
run.py calls db.create_all() when a SQLite URI is detected, which is
intentionally unsafe for production PostgreSQL (it silently skips schema
changes).  This file calls only create_app() — schema management is
handled exclusively by `flask db upgrade` in build.sh.
"""

from website import create_app

# The factory is called once here. Gunicorn workers fork from this
# already-initialised state — no worker calls create_app() again.
app = create_app()

# PEP 3333 / WSGI-spec alias. Some servers (uWSGI, mod_wsgi, Waitress)
# look for `application` by convention when no callable is specified.
application = app
