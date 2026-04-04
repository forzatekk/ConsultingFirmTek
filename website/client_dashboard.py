"""Client dashboard views."""

from flask import Blueprint, abort, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required
from werkzeug.utils import secure_filename


client = Blueprint("client", __name__)


def _is_client(user) -> bool:
    """Return True if the given user has the client role."""
    return getattr(user, "role", None) == "client"


@client.route("/client_dashboard", methods=["GET", "POST"])
@login_required
def dashboard():
    """Render the dashboard and handle file uploads for authenticated client users."""

    if not _is_client(current_user):
        abort(403)

    if request.method == "POST":
        uploaded_files = request.files.getlist("file[]")
        names = [secure_filename(f.filename) for f in uploaded_files if f.filename]
        if names:
            # TODO: save files to disk or cloud storage
            flash(f"Received: {', '.join(names)}", "success")
        else:
            flash("No files were selected.", "error")
        return redirect(url_for("client.dashboard"))

    return render_template("client_dashboard.html")

