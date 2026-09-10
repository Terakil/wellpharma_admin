from flask import Blueprint, render_template, request, redirect, url_for, flash
from app.models import db, AdminProfile, Parametre
from flask import jsonify
import json

parametres = Blueprint("parametres", __name__)


@parametres.route("/parametres", methods=["GET", "POST"])
def page_parametres():

    profil = AdminProfile.query.first()

    if profil is None:
        profil = AdminProfile(
            name="Administrateur",
            email="admin@wellpharma.com",
            phone="",
            role="Administrateur"
        )

        db.session.add(profil)
        db.session.commit()

    if request.method == "POST":

        name = request.form.get("adminName", "").strip()
        email = request.form.get("adminEmail", "").strip()
        phone = request.form.get("adminPhone", "").strip()

        if not name or not email:
            flash("Le nom et l'adresse e-mail sont obligatoires.", "error")
            return redirect(url_for("parametres.page_parametres"))

        profil.name = name
        profil.email = email
        profil.phone = phone

        db.session.commit()

        flash("Profil enregistré avec succès.", "success")

        return redirect(url_for("parametres.page_parametres"))

    return render_template(
        "parametres.html",
        profil=profil,
        settings={item.cle: json.loads(item.valeur) for item in Parametre.query.all()}
    )


@parametres.route("/parametres/enregistrer", methods=["POST"])
def enregistrer_parametres():
    data = request.get_json(silent=True) or {}
    section = str(data.get("section", "")).strip()
    values = data.get("values")
    if not section or not isinstance(values, dict):
        return jsonify({"success": False, "message": "Paramètres invalides."}), 400

    setting = Parametre.query.filter_by(cle=section).first()
    if setting is None:
        setting = Parametre(cle=section)
        db.session.add(setting)
    setting.valeur = json.dumps(values, ensure_ascii=False)
    db.session.commit()
    return jsonify({"success": True, "message": "Paramètres enregistrés avec succès."})