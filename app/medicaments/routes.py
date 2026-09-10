from flask import Blueprint, jsonify, render_template, request, redirect, url_for, flash
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.models import Commande, Fournisseur, Produit, ProduitArchive, db


medicaments = Blueprint("medicaments", __name__)


def parse_medicine_date(value):
    value = (value or "").strip()
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


def parse_supplier_id(value):
    value = (value or "").strip()
    if not value:
        return None
    try:
        supplier_id = int(value)
    except (TypeError, ValueError):
        return None
    return supplier_id if db.session.get(Fournisseur, supplier_id) else None


def generate_reference(name):
    clean = "".join(ch for ch in name.upper() if ch.isalpha() or ch.isdigit())[:6]
    return f"REF-{clean or 'PROD'}-{datetime.now().strftime('%d%H%M')}"


@medicaments.route("/medicaments")
def liste_medicaments():
    archived_ids = {row.id_produit for row in ProduitArchive.query.all()}
    medicines = [
        medicine for medicine in Produit.query.order_by(Produit.id_produit.asc()).all()
        if medicine.id_produit not in archived_ids
    ]

    total = len(medicines)
    en_stock = sum(1 for medicine in medicines if medicine.quantite > 10)
    stock_faible = sum(1 for medicine in medicines if 0 < medicine.quantite <= 10)
    rupture = sum(1 for medicine in medicines if medicine.quantite == 0)

    return render_template(
        "medicaments.html",
        medicines=medicines,
        suppliers=Fournisseur.query.order_by(Fournisseur.nom.asc()).all(),
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
        expiration_date = parse_medicine_date(request.form.get("expiration_date"))
        supplier_id = parse_supplier_id(request.form.get("supplier"))

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
            date_peremption=expiration_date,
            id_fournisseur=supplier_id,
            statut="EN STOCK" if quantite > 10 else "FAIBLE" if quantite > 0 else "RUPTURE"
        )

        db.session.add(produit)
        db.session.commit()
        flash("Médicament ajouté avec succès.", "success")

    except Exception as e:
        db.session.rollback()
        flash(f"Erreur : {e}", "danger")

    return redirect(url_for("medicaments.liste_medicaments"))


@medicaments.route("/medicaments/<int:medicine_id>/modifier", methods=["POST"])
def modifier_medicament(medicine_id):
    data = request.get_json(silent=True) or request.form
    produit = db.session.get(Produit, medicine_id)
    if produit is None:
        return jsonify({"success": False, "message": "Médicament introuvable."}), 404

    try:
        designation = (data.get("name") or produit.designation).strip()
        categorie = (data.get("category") or produit.categorie or "Autre").strip()
        prix = float(data.get("price") or produit.prix_unitaire or 0)
        quantite = int(data.get("quantity", produit.quantite))
        expiration_date = parse_medicine_date(data.get("expiration_date"))
        supplier_id = parse_supplier_id(data.get("supplier_id"))
        if not designation or prix < 0 or quantite < 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "Nom, prix ou quantité invalide."}), 400

    produit.designation = designation
    produit.categorie = categorie
    produit.prix_unitaire = prix
    produit.quantite = quantite
    produit.description = data.get("description", produit.description)
    produit.image_url = data.get("image_url", produit.image_url)
    produit.needs_prescription = str(data.get(
        "needs_prescription", int(bool(produit.needs_prescription))
    )).lower() in ("1", "true", "oui")
    produit.date_peremption = expiration_date
    produit.id_fournisseur = supplier_id
    produit.statut = "EN STOCK" if quantite > 10 else "FAIBLE" if quantite > 0 else "RUPTURE"

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"success": False, "message": "Modification impossible dans la base."}), 500

    return jsonify({
        "success": True,
        "message": "Médicament modifié avec succès.",
        "price": float(produit.prix_unitaire)
    })


@medicaments.route("/medicaments/<int:medicine_id>/supprimer", methods=["POST"])
def supprimer_medicament(medicine_id):
    produit = db.session.get(Produit, medicine_id)
    if produit is None:
        return jsonify({"success": False, "message": "Médicament introuvable."}), 404

    try:
        quantity = produit.quantite
        if quantity > 0:
            db.session.execute(
                text(
                    "INSERT INTO mouvements_produits "
                    "(id_produit, type, quantite, date) "
                    "VALUES (:id_produit, 'Sortie', :quantite, :date)"
                ),
                {
                    "id_produit": medicine_id,
                    "quantite": quantity,
                    "date": datetime.now()
                }
            )

        db.session.execute(
            text("DELETE FROM alertes WHERE id_produit = :id_produit"),
            {"id_produit": medicine_id}
        )
        Commande.query.filter_by(id_produit=medicine_id).delete(synchronize_session=False)
        ProduitArchive.query.filter_by(id_produit=medicine_id).delete(synchronize_session=False)
        db.session.delete(produit)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Le médicament n'a pas pu être supprimé de la base."
        }), 500

    return jsonify({
        "success": True,
        "message": "Médicament sorti du stock et supprimé de la base.",
        "quantity_removed": quantity
    })

