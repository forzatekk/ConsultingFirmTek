"""Application factory and extensions."""

import logging
import os
from logging.handlers import RotatingFileHandler

from flask import Flask, render_template, request
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

# Named logger for Sage Intacct / Veloce POS integration routes.
# Import and use from any integration module:
#   from website import integration_logger
#   integration_logger.error("Sage Intacct sync failed: %s", exc)
integration_logger = logging.getLogger("tekk.integrations")


@login_manager.user_loader
def load_user(user_id: str):
    """Return the User object for the given primary key (called by Flask-Login)."""
    from .models import User
    return User.query.get(int(user_id))


def _configure_logging(app: Flask) -> None:
    """Attach a rotating file handler to both the app and integration loggers."""
    log_dir = os.path.join(app.root_path, "..", "logs")
    os.makedirs(log_dir, exist_ok=True)

    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)-8s %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # 5 MB per file, keep 3 rotations → max 15 MB on disk
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, "app.log"),
        maxBytes=5 * 1024 * 1024,
        backupCount=3,
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.WARNING)

    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.WARNING)

    # Integration logger inherits the same handler so Sage Intacct / Veloce POS
    # failures always land in app.log under the "tekk.integrations" name.
    integration_logger.addHandler(file_handler)
    integration_logger.setLevel(logging.WARNING)
    integration_logger.propagate = False


def _register_error_handlers(app: Flask) -> None:
    """Register branded error pages for 404 and 500."""

    @app.errorhandler(404)
    def not_found(exc):
        app.logger.warning("404 %s %s", request.method, request.url)
        return render_template("404.html"), 404

    @app.errorhandler(500)
    def server_error(exc):
        app.logger.error(
            "500 %s %s — %s", request.method, request.url, exc, exc_info=True
        )
        return render_template("500.html"), 500


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

    _configure_logging(app)
    _register_error_handlers(app)

    return app
