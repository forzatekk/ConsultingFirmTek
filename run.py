"""Entry point — run this file to start the Flask development server.

Production schema management
─────────────────────────────
This file calls db.create_all() **only when the SQLite dev database is in
use**.  For PostgreSQL (Neon or any other host) use Flask-Migrate instead:

  First-time setup (run once, commit the generated migrations/ directory):
    flask db init
    flask db migrate -m "initial schema"
    flask db upgrade

  Every subsequent model change:
    flask db migrate -m "<describe change>"
    flask db upgrade          # run against production DATABASE_URL

  Data migration from SQLite (if you have existing rows):
    python scripts/dump_sqlite.py   # see that file for instructions
    DATABASE_URL=<neon-url> python scripts/load_postgres.py

db.create_all() is intentionally NOT called here for PostgreSQL because it
silently skips any columns/constraints added after the initial CREATE TABLE,
making it unsafe for schema evolution.
"""

import os

from website import create_app, db

app = create_app()

# Bootstrap the SQLite dev database automatically.  In production the tables
# are managed by `flask db upgrade` (see note above).
_is_sqlite = app.config["SQLALCHEMY_DATABASE_URI"].startswith("sqlite")
if _is_sqlite:
    with app.app_context():
        db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
