"""Entry point — run this file to start the Flask development server."""

from website import create_app, db

app = create_app()

# Ensure all database tables exist on first run
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
