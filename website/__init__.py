"""Application factory and extensions."""

import logging
import os
import time
from datetime import datetime
from logging.handlers import RotatingFileHandler

from flask import Flask, render_template, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from werkzeug.middleware.proxy_fix import ProxyFix


# ---------------------------------------------------------------------------
# Extensions — imported by blueprints and tests
# ---------------------------------------------------------------------------
db = SQLAlchemy()
csrf = CSRFProtect()
login_manager = LoginManager()
migrate = Migrate()

# Rate limiter — key on the real client IP.
# Swap storage_uri for redis:// in production to share limits across workers.
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["300 per day", "60 per hour"],
    storage_uri=os.environ.get("RATELIMIT_STORAGE_URI", "memory://"),
)

# Redirect unauthenticated users who hit @login_required routes
login_manager.login_view = "auth.login"
login_manager.login_message_category = "error"

# Named logger for Sage Intacct / Veloce POS integration routes.
# Usage from any integration module:
#   from website import integration_logger
#   integration_logger.error("Sage Intacct sync failed: %s", exc)
integration_logger = logging.getLogger("tekk.integrations")


@login_manager.user_loader
def load_user(user_id: str):
    from .models import User
    return User.query.get(int(user_id))


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _configure_logging(app: Flask) -> None:
    """Attach a rotating file handler to the app and integration loggers."""
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

    integration_logger.addHandler(file_handler)
    integration_logger.setLevel(logging.WARNING)
    integration_logger.propagate = False


def _configure_security(app: Flask) -> None:
    """Apply security headers via Flask-Talisman.

    CSP notes:
    - style-src allows 'unsafe-inline' because Framer Motion injects inline
      transform/opacity styles at runtime and our templates use inline style attrs.
    - script-src is strict 'self' only — no inline scripts anywhere in Flask
      templates (the 500 ref-id is now rendered server-side).
    - frame-ancestors 'none' replaces the legacy X-Frame-Options: DENY header
      in CSP-aware browsers; Talisman still sends X-Frame-Options for older ones.
    - force_https and session_cookie_secure are off in debug mode so local dev
      keeps working over plain HTTP.
    """
    from flask_talisman import Talisman

    csp = {
        "default-src": "'self'",
        "script-src":  ["'self'"],
        "style-src":   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src":    ["'self'", "https://fonts.gstatic.com", "data:"],
        "img-src":     ["'self'", "data:", "blob:"],
        "connect-src":  "'self'",
        "manifest-src": "'self'",
        "frame-ancestors": "'none'",
        "form-action": "'self'",
        "base-uri":    "'self'",
        "object-src":  "'none'",
    }

    Talisman(
        app,
        content_security_policy=csp,
        force_https=not app.debug,
        strict_transport_security=True,
        strict_transport_security_max_age=31_536_000,  # 1 year
        strict_transport_security_include_subdomains=True,
        frame_options="DENY",
        referrer_policy="strict-origin-when-cross-origin",
        session_cookie_secure=not app.debug,
        session_cookie_http_only=True,
        session_cookie_samesite="Lax",
    )


def _register_error_handlers(app: Flask) -> None:
    """Register branded error pages for 404, 429, and 500."""

    @app.errorhandler(404)
    def not_found(exc):
        app.logger.warning("404 %s %s", request.method, request.url)
        return render_template("404.html"), 404

    @app.errorhandler(429)
    def rate_limited(exc):
        app.logger.warning(
            "429 %s %s — rate limit: %s", request.method, request.url, exc.description
        )
        return render_template("429.html", retry_after=exc.retry_after), 429

    @app.errorhandler(500)
    def server_error(exc):
        # Short hex timestamp becomes the incident reference shown to users
        ref_id = hex(int(time.time()))[2:].upper()
        app.logger.error(
            "500 %s %s [ref:%s] — %s",
            request.method, request.url, ref_id, exc,
            exc_info=True,
        )
        return render_template("500.html", ref_id=ref_id), 500


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------

def create_app() -> Flask:
    """Create and configure the Flask application."""

    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev_key")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URI", "sqlite:///db.sqlite3"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # CSRF — enabled globally; time limit prevents replay after session expiry.
    # React SPA API calls must include the X-CSRFToken header (see views.csrf_token).
    app.config["WTF_CSRF_TIME_LIMIT"] = 3600
    app.config["WTF_CSRF_HEADERS"] = ["X-CSRFToken"]

    # Trust X-Forwarded-Proto / X-Forwarded-Host from a single upstream proxy
    # so that url_for(_external=True) and request.url produce https:// in prod.
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    db.init_app(app)
    csrf.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)

    # Inject `now` into every template so the footer year is always current.
    app.jinja_env.globals["now"] = datetime.utcnow()

    from .views import views as views_blueprint
    from .auth import auth as auth_blueprint
    from .client_dashboard import client as client_blueprint

    app.register_blueprint(views_blueprint)
    app.register_blueprint(auth_blueprint)
    app.register_blueprint(client_blueprint)

    _configure_logging(app)
    _configure_security(app)
    _register_error_handlers(app)

    return app
