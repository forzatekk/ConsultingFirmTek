"""Public-facing page routes (views blueprint)."""

import os

from flask import Blueprint, flash, jsonify, redirect, render_template, send_from_directory, url_for
from flask_wtf.csrf import generate_csrf

from . import limiter
from .forms import ContactForm

views = Blueprint("views", __name__)


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
        flash("Message sent! We'll get back to you within 24 hours.", "success")
        return redirect(url_for("views.contact"))
    return render_template("contact.html", form=form)


@views.route("/api/csrf-token", methods=["GET"])
def csrf_token():
    """Return a fresh CSRF token for React SPA API calls.

    The React app should:
      1. GET /api/csrf-token on mount (or before any mutating request).
      2. Store the returned csrfToken.
      3. Include the header  X-CSRFToken: <token>  on every POST/PUT/DELETE.

    Flask-WTF will validate it via app.config["WTF_CSRF_HEADERS"].
    """
    return jsonify({"csrfToken": generate_csrf()})


@views.route("/landing")
@views.route("/landing/<path:filename>")
def landing(filename="index.html"):
    """Serve the built TEKK Solutions React SPA from static/portfolio/."""
    portfolio_dir = os.path.join(views.root_path, "static", "portfolio")
    return send_from_directory(portfolio_dir, filename)
