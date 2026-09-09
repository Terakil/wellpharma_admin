from flask import Blueprint, render_template, request, redirect, url_for, session, flash

from app.models import Utilisateur


auth = Blueprint("auth", __name__)


@auth.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")

        user = Utilisateur.query.filter_by(email=email, motdepasse=password).first()

        if user and user.role == "admin":
            session["admin_logged_in"] = True
            session["admin_email"] = user.email
            return redirect(url_for("dashboard.home"))

        if user:
            flash("Ce compte n’a pas les droits d’administrateur.", "error")
        else:
            flash("Adresse e-mail ou mot de passe incorrect.", "error")

    return render_template("login.html")


@auth.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("auth.login"))