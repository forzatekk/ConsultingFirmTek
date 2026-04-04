"""Application factory and extensions."""

import os

from flask import Flask
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect


# Initialize extensions (shared across all modules via import)
db = SQLAlchemy()
csrf = CSRFProtect()
login_manager = LoginManager()
migrate = Migrate()

# Redirect unauthenticated users who hit @login_required routes
login_manager.login_view = "auth.login"
login_manager.login_message_category = "error"


@login_manager.user_loader
def load_user(user_id: str):
    """Return the User object for the given primary key (called by Flask-Login)."""
    from .models import User
    return User.query.get(int(user_id))


def create_app() -> Flask:
    """Create and configure the Flask application."""

    app = Flask(__name__)

    # Load config from environment
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev_key")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URI", "sqlite:///db.sqlite3"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Init extensions
    db.init_app(app)
    csrf.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints
    from .views import views as views_blueprint
    from .auth import auth as auth_blueprint
    from .client_dashboard import client as client_blueprint

    app.register_blueprint(views_blueprint)
    app.register_blueprint(auth_blueprint)
    app.register_blueprint(client_blueprint)

    return app

