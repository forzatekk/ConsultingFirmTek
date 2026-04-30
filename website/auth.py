"""Authentication routes."""

from flask import Blueprint, flash, redirect, render_template, url_for
from flask_login import login_required, login_user, logout_user
from werkzeug.security import check_password_hash, generate_password_hash

from . import db, limiter
from .forms import LoginForm, SignupForm
from .models import User


auth = Blueprint("auth", __name__)


@auth.route("/login", methods=["GET", "POST"])
@limiter.limit("10 per minute", methods=["POST"])
def login():
    """Authenticate an existing user."""
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and check_password_hash(user.password, form.password.data):
            login_user(user)
            return redirect(url_for("client.dashboard"))
        flash("Invalid email or password.", "error")
    return render_template("login.html", form=form)


@auth.route("/signup", methods=["GET", "POST"])
@limiter.limit("5 per minute", methods=["POST"])
def signup():
    """Register a new user and log them in."""
    form = SignupForm()
    if form.validate_on_submit():
        if User.query.filter_by(email=form.email.data).first():
            flash("Email address already registered.", "error")
        else:
            user = User(
                email=form.email.data,
                password=generate_password_hash(form.password.data),
                role="client",
            )
            db.session.add(user)
            db.session.commit()
            login_user(user)
            return redirect(url_for("client.dashboard"))
    return render_template("signup.html", form=form)


@auth.route("/logout")
@login_required
def logout():
    """Log out the current user."""
    logout_user()
    return redirect(url_for("auth.login"))
