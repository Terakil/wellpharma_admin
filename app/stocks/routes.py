from datetime import datetime, timedelta
from datetime import date
import json

from flask import Blueprint, jsonify, render_template, request

from app.models import Commande, MouvementProduit, Parametre, Produit, db


stocks = Blueprint("stocks", __name__)


def movement_kind(value):
    normalized = (value or "").strip().lower()
    if normalized in ("entrée", "entree", "entry", "in"):
        return "entry"
    if normalized in ("sortie", "sorties", "exit", "out"):
        return "exit"
    return "other"


def get_stock_status(quantity):
    if quantity == 0:
        return "Rupture"
    if quantity <= 10:
        return "Stock faible"
    return "En stock"


def update_product_status(product):
    product.statut = get_stock_status(product.quantite).upper()
    if product.statut == "STOCK FAIBLE":
        product.statut = "FAIBLE"


@stocks.route("/stocks")
def liste_stocks():
    medicines = Produit.query.order_by(Produit.id_produit.asc()).all()
    orders = Commande.query.order_by(Commande.date.desc()).all()
    movements_db = MouvementProduit.query.order_by(MouvementProduit.date.desc()).all()

    total_stock = sum(medicine.quantite for medicine in medicines)
    total_entries = sum(
        movement.quantite for movement in movements_db
        if movement_kind(movement.type) == "entry"
    )
    manual_exits = sum(
        movement.quantite for movement in movements_db
        if movement_kind(movement.type) == "exit"
    )
    total_exits = manual_exits + sum(order.quantite for order in orders)
    settings = {}
    for item in Parametre.query.filter_by(cle="management").all():
        try:
            settings = json.loads(item.valeur)
        except (TypeError, ValueError, json.JSONDecodeError):
            settings = {}
    try:
        low_stock_threshold = max(0, int(settings.get("lowStockThreshold", 10)))
    except (TypeError, ValueError):
        low_stock_threshold = 10
    try:
        expiration_threshold = max(0, int(settings.get("expirationThreshold", 30)))
    except (TypeError, ValueError):
        expiration_threshold = 30

    total_alerts = sum(1 for medicine in medicines if medicine.quantite <= low_stock_threshold)

    stocks_data = [{
        "id": medicine.id_produit,
        "name": medicine.designation,
        "reference": medicine.reference,
        "category": medicine.categorie,
        "quantity": medicine.quantite,
        "threshold": 10,
        "status": get_stock_status(medicine.quantite)
    } for medicine in medicines]

    alerts = []
    for medicine in medicines:
        if medicine.quantite == 0:
            alerts.append({
                "icon": "bi-x-circle",
                "medicine": medicine.designation,
                "type": "Rupture",
                "message": "Produit indisponible"
            })
        elif medicine.quantite <= low_stock_threshold:
            alerts.append({
                "icon": "bi-exclamation-triangle",
                "medicine": medicine.designation,
                "type": "Stock faible",
                "message": f"{medicine.quantite} unités restantes"
            })
        if medicine.date_peremption and medicine.date_peremption <= date.today() + timedelta(days=expiration_threshold):
            alerts.append({
                "icon": "bi-calendar-x",
                "medicine": medicine.designation,
                "type": "Péremption",
                "message": "Produit périmé" if medicine.date_peremption < date.today() else "Expiration proche"
            })

    recent_movements = []
    for order in orders:
        product = Produit.query.get(order.id_produit)
        recent_movements.append({
            "medicine": product.designation if product else "Produit inconnu",
            "type": "Sortie - Commande",
            "date": order.date.strftime("%d/%m/%Y") if order.date else "-",
            "quantity": order.quantite,
            "timestamp": order.date or datetime.min
        })

    for movement in movements_db[:5]:
        product = Produit.query.get(movement.id_produit)
        recent_movements.append({
            "medicine": product.designation if product else "Produit inconnu",
            "type": movement.type,
            "date": movement.date.strftime("%d/%m/%Y") if movement.date else "-",
            "quantity": movement.quantite,
            "timestamp": movement.date or datetime.min
        })
    recent_movements.sort(key=lambda item: item["timestamp"], reverse=True)
    for movement in recent_movements:
        movement.pop("timestamp", None)

    movements = build_chart_data(movements_db, orders)
    stats = {
        "total_stock": total_stock,
        "total_entries": total_entries,
        "total_exits": total_exits,
        "total_alerts": total_alerts
    }

    return render_template(
        "stocks.html",
        stats=stats,
        stocks=stocks_data,
        alerts=alerts,
        recent_movements=recent_movements,
        movements=movements,
        medicines=medicines
    )


def build_chart_data(movements_db, orders):
    today = datetime.now().date()
    labels = []
    entries = []
    exits = []

    for days_ago in range(6, -1, -1):
        current_date = today - timedelta(days=days_ago)
        labels.append(current_date.strftime("%d/%m"))
        entries.append(sum(
            movement.quantite for movement in movements_db
            if movement.date and movement.date.date() == current_date
            and movement_kind(movement.type) == "entry"
        ))
        manual_exits = sum(
            movement.quantite for movement in movements_db
            if movement.date and movement.date.date() == current_date
            and movement_kind(movement.type) == "exit"
        )
        command_exits = sum(
            order.quantite for order in orders
            if order.date and order.date.date() == current_date
        )
        exits.append(manual_exits + command_exits)

    return {"labels": labels, "entries": entries, "exits": exits}


def parse_stock_request():
    data = request.get_json(silent=True) or {}
    try:
        medicine_id = int(data.get("medicine_id"))
        quantity = int(data.get("quantity"))
    except (TypeError, ValueError):
        return None, None
    return medicine_id, quantity


def register_movement(product, movement_type, quantity):
    update_product_status(product)
    db.session.add(MouvementProduit(
        id_produit=product.id_produit,
        type=movement_type,
        quantite=quantity,
        date=datetime.now()
    ))


@stocks.route("/stocks/entry", methods=["POST"])
def stock_entry():
    medicine_id, quantity = parse_stock_request()
    if not medicine_id or not quantity or quantity <= 0:
        return jsonify({"success": False, "message": "Médicament et quantité valides obligatoires."}), 400

    medicine = db.session.get(Produit, medicine_id)
    if medicine is None:
        return jsonify({"success": False, "message": "Médicament introuvable."}), 404

    medicine.quantite += quantity
    register_movement(medicine, "Entrée", quantity)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Entrée en stock enregistrée.",
        "medicine_id": medicine.id_produit,
        "quantity": medicine.quantite,
        "status": get_stock_status(medicine.quantite)
    })


@stocks.route("/stocks/exit", methods=["POST"])
def stock_exit():
    medicine_id, quantity = parse_stock_request()
    if not medicine_id or not quantity or quantity <= 0:
        return jsonify({"success": False, "message": "Médicament et quantité valides obligatoires."}), 400

    medicine = db.session.get(Produit, medicine_id)
    if medicine is None:
        return jsonify({"success": False, "message": "Médicament introuvable."}), 404
    if medicine.quantite < quantity:
        return jsonify({"success": False, "message": "Quantité supérieure au stock disponible."}), 400

    medicine.quantite -= quantity
    register_movement(medicine, "Sortie", quantity)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Sortie de stock enregistrée.",
        "medicine_id": medicine.id_produit,
        "quantity": medicine.quantite,
        "status": get_stock_status(medicine.quantite)
    })


@stocks.route("/stocks/<int:medicine_id>/adjust", methods=["POST"])
def adjust_stock(medicine_id):
    data = request.get_json(silent=True) or {}
    action = data.get("action")
    medicine = db.session.get(Produit, medicine_id)

    if medicine is None:
        return jsonify({"success": False, "message": "Médicament introuvable."}), 404
    if action == "increase":
        movement_type = "Entrée"
        medicine.quantite += 1
    elif action == "decrease":
        if medicine.quantite <= 0:
            return jsonify({"success": False, "message": "Le stock est déjà à zéro."}), 400
        movement_type = "Sortie"
        medicine.quantite -= 1
    else:
        return jsonify({"success": False, "message": "Action invalide."}), 400

    register_movement(medicine, movement_type, 1)
    db.session.commit()

    return jsonify({
        "success": True,
        "medicine_id": medicine.id_produit,
        "quantity": medicine.quantite,
        "status": get_stock_status(medicine.quantite)
    })
