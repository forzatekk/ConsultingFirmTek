"""Public-facing page routes (views blueprint)."""

import os

from flask import Blueprint, current_app, flash, redirect, render_template, send_from_directory, url_for

from .forms import ContactForm

views = Blueprint("views", __name__)


@views.route("/")
def index():
    """Render the Home page."""
    return render_template("index.html")


@views.route("/about")
def about():
    """Render the About page."""
    return render_template("about.html")


@views.route("/services")
def services():
    """Render the Services page."""
    return render_template("services.html")


@views.route("/portfolio")
def portfolio():
    """Render the Portfolio page."""
    return render_template("portfolio.html")


@views.route("/contact", methods=["GET", "POST"])
def contact():
    """Render and process the Contact form."""
    form = ContactForm()
    if form.validate_on_submit():
        # TODO: send an email or persist the message to the database
        flash("Message sent! We'll get back to you within 24 hours.", "success")
        return redirect(url_for("views.contact"))
    return render_template("contact.html", form=form)


@views.route("/landing")
@views.route("/landing/<path:filename>")
def landing(filename="index.html"):
    """Serve the built TEKK Solutions React SPA from static/portfolio/."""
    portfolio_dir = os.path.join(current_app.root_path, "static", "portfolio")
    return send_from_directory(portfolio_dir, filename)
