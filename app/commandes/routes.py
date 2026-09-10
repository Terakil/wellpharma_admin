from datetime import date, datetime

from flask import Blueprint, render_template, request, jsonify
from sqlalchemy.exc import SQLAlchemyError

from app.models import Commande, Produit, db

commandes = Blueprint("commandes", __name__)


@commandes.route("/commandes")
def liste_commandes():
    orders_db = Commande.query.order_by(Commande.date.desc()).all()
    orders = []

    for order in orders_db:
        produit = Produit.query.get(order.id_produit)
        orders.append({
            "id": order.id_commande,
            "client": order.acheteur or "Client",
            "date": order.date.strftime("%d/%m/%Y") if order.date else "-",
            "date_key": order.date.strftime("%Y-%m-%d") if order.date else "",
            "medicaments": produit.designation if produit else "Produit inconnu",
            "quantite": order.quantite,
            "total": float(order.prix_total),
            "status": "Payée"
        })

    today = date.today()
    order_stats = {
        "today": sum(1 for order in orders_db if order.date and order.date.date() == today),
        "pending": 0,
        "paid": len(orders_db),
        "cancelled": 0
    }

    return render_template(
        "commandes.html",
        orders=orders,
        medicines=Produit.query.order_by(Produit.designation.asc()).all(),
        order_stats=order_stats
    )


@commandes.route("/commandes/ajouter", methods=["POST"])
def ajouter_commande():
    data = request.get_json(silent=True) or request.form
    client = (data.get("client") or "").strip()
    medicine_id = data.get("medicine_id")

    try:
        quantity = int(data.get("quantity", 0))
        amount = float(data.get("amount", 0))
        medicine_id = int(medicine_id)
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "Produit, quantité et montant invalides."}), 400

    if not client or quantity <= 0 or amount < 0:
        return jsonify({"success": False, "message": "Les informations de commande sont obligatoires."}), 400

    produit = db.session.get(Produit, medicine_id)
    if produit is None:
        return jsonify({"success": False, "message": "Médicament introuvable."}), 404
    if produit.quantite < quantity:
        return jsonify({"success": False, "message": "Stock insuffisant pour cette commande."}), 400

    commande = Commande(
        id_produit=produit.id_produit,
        quantite=quantity,
        prix_total=amount,
        acheteur=client,
        date=datetime.now()
    )
    produit.quantite -= quantity
    produit.statut = "EN STOCK" if produit.quantite > 10 else "FAIBLE" if produit.quantite > 0 else "RUPTURE"

    try:
        db.session.add(commande)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"success": False, "message": "La commande n'a pas pu être enregistrée."}), 500

    return jsonify({
        "success": True,
        "message": "Commande enregistrée et sortie de stock effectuée.",
        "order_id": commande.id_commande,
        "medicine_id": produit.id_produit,
        "quantity": produit.quantite
    })