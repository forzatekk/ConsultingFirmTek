"""Form definitions for authentication and contact views."""

from flask_wtf import FlaskForm
from flask_wtf.file import FileAllowed, FileField
from wtforms import PasswordField, StringField, SubmitField, TextAreaField
from wtforms.validators import Email, InputRequired, Length


class CredentialsForm(FlaskForm):
    """Base form providing email and password fields."""

    email = StringField("Email", validators=[InputRequired(), Email()])
    password = PasswordField("Password", validators=[InputRequired(), Length(min=6)])


class LoginForm(CredentialsForm):
    """Form for logging in existing users."""

    submit = SubmitField("Log In")


class SignupForm(CredentialsForm):
    """Form for registering new users."""

    submit = SubmitField("Sign Up")


class ContactForm(FlaskForm):
    """Form for the public contact page."""

    name = StringField("Name", validators=[InputRequired(), Length(max=100)])
    email = StringField("Email", validators=[InputRequired(), Email()])
    message = TextAreaField(
        "Message", validators=[InputRequired(), Length(min=10, max=2000)]
    )
    file = FileField(
        "Attachment",
        validators=[
            FileAllowed(
                ["pdf", "doc", "docx", "png", "jpg", "jpeg", "zip"],
                "Allowed types: pdf, doc, docx, png, jpg, jpeg, zip.",
            )
        ],
    )
    submit = SubmitField("Send Message")
