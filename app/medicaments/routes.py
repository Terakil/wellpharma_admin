from flask import Blueprint, render_template, request, redirect, url_for, flash
from datetime import datetime

from app.models import db, Produit


medicaments = Blueprint("medicaments", __name__)


def generate_reference(name):
    clean = "".join(ch for ch in name.upper() if ch.isalpha() or ch.isdigit())[:6]
    return f"REF-{clean or 'PROD'}-{datetime.now().strftime('%d%H%M')}"


@medicaments.route("/medicaments")
def liste_medicaments():
    medicines = Produit.query.order_by(Produit.id_produit.asc()).all()

    total = len(medicines)
    en_stock = sum(1 for medicine in medicines if medicine.quantite > 10)
    stock_faible = sum(1 for medicine in medicines if 0 < medicine.quantite <= 10)
    rupture = sum(1 for medicine in medicines if medicine.quantite == 0)

    return render_template(
        "medicaments.html",
        medicines=medicines,
        total=total,
        en_stock=en_stock,
        stock_faible=stock_faible,
        rupture=rupture
    )


@medicaments.route("/medicaments/add", methods=["POST"])
def ajouter_medicament():
    try:
        designation = request.form.get("name", "").strip()
        categorie = request.form.get("category", "").strip()
        prix = float(request.form.get("price", 0) or 0)
        quantite = int(request.form.get("quantity", 0) or 0)
        description = request.form.get("description", "")
        image_url = request.form.get("image_url", "").strip()
        needs_prescription = request.form.get("requires_prescription") == "oui"

        if not designation or not categorie:
            flash("Le nom et la catégorie du médicament sont obligatoires.", "danger")
            return redirect(url_for("medicaments.liste_medicaments"))

        produit = Produit(
            designation=designation,
            reference=generate_reference(designation),
            categorie=categorie,
            quantite=quantite,
            prix_unitaire=prix,
            description=description,
            image_url=image_url or None,
            needs_prescription=needs_prescription,
            statut="EN STOCK" if quantite > 10 else "FAIBLE" if quantite > 0 else "RUPTURE"
        )

        db.session.add(produit)
        db.session.commit()
        flash("Médicament ajouté avec succès.", "success")

    except Exception as e:
        db.session.rollback()
        flash(f"Erreur : {e}", "danger")

    return redirect(url_for("medicaments.liste_medicaments"))

