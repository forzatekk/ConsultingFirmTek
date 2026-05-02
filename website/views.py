"""Public-facing page routes (views blueprint)."""

import os
from datetime import date

from urllib.parse import urlparse

from flask import (
    Blueprint, flash, jsonify, make_response, redirect,
    render_template, request, send_from_directory, session, url_for,
)
from flask_wtf.csrf import generate_csrf

from . import limiter
from .forms import ContactForm
from .i18n import get_t

views = Blueprint("views", __name__)


# ---------------------------------------------------------------------------
# Public pages
# ---------------------------------------------------------------------------

@views.route("/")
def index():
    return render_template("index.html")


@views.route("/about")
def about():
    return render_template("about.html")


@views.route("/services")
def services():
    return render_template("services.html")


@views.route("/portfolio")
def portfolio():
    return render_template("portfolio.html")


@views.route("/contact", methods=["GET", "POST"])
@limiter.limit("5 per minute", methods=["POST"])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        # TODO: send email or persist message
        flash(get_t(session.get("lang", "en"))["contact"]["flash_success"], "success")
        return redirect(url_for("views.contact"))
    return render_template("contact.html", form=form)


# ---------------------------------------------------------------------------
# Language switcher
# ---------------------------------------------------------------------------

@views.route("/set-lang/<lang>")
def set_lang(lang):
    """Persist the chosen language in the session and return to the same page.

    The navbar passes the current path as ?next= so the redirect is exact.
    Only relative paths are accepted to prevent open-redirect attacks.
    """
    if lang not in ("en", "fr"):
        lang = "en"
    session.permanent = True
    session["lang"] = lang
    next_url = request.args.get("next", "")
    # Accept only relative paths (no scheme/netloc) to block open redirects.
    if next_url and not urlparse(next_url).netloc:
        return redirect(next_url)
    return redirect(url_for("views.index"))


# ---------------------------------------------------------------------------
# React SPA
# ---------------------------------------------------------------------------

@views.route("/landing")
@views.route("/landing/<path:filename>")
def landing(filename="index.html"):
    """Serve the built TEKK Solutions React SPA from static/portfolio/."""
    portfolio_dir = os.path.join(views.root_path, "static", "portfolio")
    return send_from_directory(portfolio_dir, filename)


# ---------------------------------------------------------------------------
# CSRF token endpoint for React SPA
# ---------------------------------------------------------------------------

@views.route("/api/csrf-token", methods=["GET"])
def csrf_token():
    """Return a fresh CSRF token for React SPA API calls.

    The React app should:
      1. GET /api/csrf-token on mount (or before any mutating request).
      2. Store the returned csrfToken.
      3. Include the header  X-CSRFToken: <token>  on every POST/PUT/DELETE.
    """
    return jsonify({"csrfToken": generate_csrf()})


# ---------------------------------------------------------------------------
# SEO infrastructure
# ---------------------------------------------------------------------------

@views.route("/sitemap.xml")
def sitemap():
    """Dynamically generate sitemap.xml for all public routes."""
    pages = [
        {
            "loc":        url_for("views.index",     _external=True),
            "changefreq": "weekly",
            "priority":   "1.0",
        },
        {
            "loc":        url_for("views.about",     _external=True),
            "changefreq": "monthly",
            "priority":   "0.8",
        },
        {
            "loc":        url_for("views.services",  _external=True),
            "changefreq": "monthly",
            "priority":   "0.9",
        },
        {
            "loc":        url_for("views.portfolio", _external=True),
            "changefreq": "weekly",
            "priority":   "0.9",
        },
        {
            "loc":        url_for("views.contact",   _external=True),
            "changefreq": "monthly",
            "priority":   "0.7",
        },
        {
            "loc":        url_for("views.landing",   _external=True),
            "changefreq": "weekly",
            "priority":   "0.8",
        },
    ]

    xml = render_template("sitemap.xml", pages=pages, lastmod=date.today().isoformat())
    response = make_response(xml)
    response.headers["Content-Type"] = "application/xml; charset=utf-8"
    # Cache the sitemap for 24 hours at the CDN/proxy layer
    response.headers["Cache-Control"] = "public, max-age=86400"
    return response


@views.route("/robots.txt")
def robots():
    """Serve robots.txt pointing crawlers at the sitemap."""
    body = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /client_dashboard\n"
        "Disallow: /login\n"
        "Disallow: /signup\n"
        f"Sitemap: {url_for('views.sitemap', _external=True)}\n"
    )
    return body, 200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
    }
