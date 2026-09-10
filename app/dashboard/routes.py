from collections import defaultdict
from datetime import date, datetime, timedelta
import json

from flask import Blueprint, render_template, redirect, url_for, session

from app.models import Commande, MouvementProduit, Parametre, Produit, Utilisateur, db
from sqlalchemy import func


dashboard = Blueprint(
    "dashboard",
    __name__,
    template_folder="../templates"
)


def movement_kind(value):
    normalized = (value or "").strip().lower()
    if normalized in ("entrée", "entree", "entry", "in"):
        return "entry"
    if normalized in ("sortie", "sorties", "exit", "out"):
        return "exit"
    return "other"


def period_bounds(period, today):
    if period == "day":
        return datetime.combine(today, datetime.min.time()), datetime.combine(today + timedelta(days=1), datetime.min.time())
    if period == "week":
        start = today - timedelta(days=today.weekday())
        return datetime.combine(start, datetime.min.time()), datetime.combine(today + timedelta(days=1), datetime.min.time())
    if period == "month":
        start = today.replace(day=1)
        return datetime.combine(start, datetime.min.time()), datetime.combine(today + timedelta(days=1), datetime.min.time())
    return datetime(today.year, 1, 1), datetime(today.year + 1, 1, 1)


def in_period(value, start, end):
    return value is not None and start <= value < end


def build_sales_chart(commandes, today):
    chart = {}
    for period in ("7", "30", "month"):
        if period == "month":
            start = today.replace(day=1)
            days = (today - start).days + 1
        else:
            days = int(period)
            start = today - timedelta(days=days - 1)
        totals = defaultdict(float)
        for commande in commandes:
            if commande.date and start <= commande.date.date() <= today:
                totals[commande.date.date()] += float(commande.prix_total or 0)
        dates = [start + timedelta(days=index) for index in range(days)]
        chart[period] = {
            "labels": [current.strftime("%d/%m") for current in dates],
            "values": [totals[current] for current in dates]
        }

    totals = defaultdict(float)
    for commande in commandes:
        if commande.date and commande.date.year == today.year:
            totals[commande.date.month] += float(commande.prix_total or 0)
    chart["year"] = {
        "labels": [datetime(today.year, month, 1).strftime("%b") for month in range(1, 13)],
        "values": [totals[month] for month in range(1, 13)]
    }
    return chart


def build_stock_data(commandes, mouvements, produits, today, expiration_threshold):
    stock_data = {}
    for period in ("day", "week", "month", "year"):
        start, end = period_bounds(period, today)
        entries = sum(
            mouvement.quantite for mouvement in mouvements
            if movement_kind(mouvement.type) == "entry" and in_period(mouvement.date, start, end)
        )
        movement_exits = sum(
            mouvement.quantite for mouvement in mouvements
            if movement_kind(mouvement.type) == "exit" and in_period(mouvement.date, start, end)
        )
        order_exits = sum(
            commande.quantite for commande in commandes
            if in_period(commande.date, start, end)
        )
        stock_data[period] = {
            "entries": entries,
            "exits": movement_exits + order_exits,
            "ruptures": sum(1 for produit in produits if produit.quantite == 0),
            "expiration": sum(
                1 for produit in produits
                if produit.date_peremption and
                produit.date_peremption <= today + timedelta(days=expiration_threshold)
            )
        }
    return stock_data


@dashboard.route("/")
def home():
    if not session.get("admin_logged_in"):
        return redirect(url_for("auth.login"))

    produits = Produit.query.all()
    commandes_recentes = Commande.query.order_by(Commande.date.desc()).limit(5).all()
    commandes = Commande.query.all()
    mouvements = MouvementProduit.query.all()
    today = date.today()
    settings = {item.cle: json.loads(item.valeur) for item in Parametre.query.all()}
    management_settings = settings.get("management", {})
    notification_settings = settings.get("notifications", {})
    try:
        low_stock_threshold = max(0, int(management_settings.get("lowStockThreshold", 10)))
    except (TypeError, ValueError):
        low_stock_threshold = 10
    try:
        expiration_threshold = max(0, int(management_settings.get("expirationThreshold", 30)))
    except (TypeError, ValueError):
        expiration_threshold = 30
    notify_low_stock = notification_settings.get("notifyLowStock", True)
    notify_expiration = notification_settings.get("notifyExpiration", True)

    revenue_total = db.session.query(
        func.coalesce(func.sum(Commande.prix_total), 0)
    ).scalar()
    total_stock = sum(produit.quantite for produit in produits)
    out_of_stock = sum(1 for produit in produits if produit.quantite == 0)
    clients = Utilisateur.query.filter(Utilisateur.role != "admin").count()

    stats = {
        "revenue": int(round(float(revenue_total or 0))),
        "stock": total_stock,
        "clients": clients,
        "orders": sum(1 for commande in commandes if commande.date and commande.date.date() == today),
        "out_of_stock": out_of_stock,
    }

    expiration_notifications = []
    expiration_limit = today + timedelta(days=expiration_threshold)
    for produit in produits:
        if not notify_expiration:
            continue
        if not produit.date_peremption or produit.date_peremption > expiration_limit:
            continue
        if produit.date_peremption < today:
            message = f"{produit.designation} : périmé depuis le {produit.date_peremption.strftime('%d/%m/%Y')}"
            notification_type = "danger"
        elif produit.date_peremption == today:
            message = f"{produit.designation} : expire aujourd'hui"
            notification_type = "danger"
        else:
            days_left = (produit.date_peremption - today).days
            message = f"{produit.designation} : expiration dans {days_left} jour(s)"
            notification_type = "warning"
        expiration_notifications.append({"type": notification_type, "message": message})

    stock_notifications = [
        {
            "type": "danger" if produit.quantite == 0 else "low-stock",
            "message": f"{produit.designation} : {produit.quantite} unités restantes"
        }
        for produit in produits
        if notify_low_stock and produit.quantite <= low_stock_threshold
    ]
    notifications = (expiration_notifications + stock_notifications)[:3]

    if not notifications:
        notifications = [{
            "type": "success",
            "message": "Stock général satisfaisant pour le moment."
        }]

    recent_orders = []
    for commande in commandes_recentes:
        produit = Produit.query.get(commande.id_produit)
        recent_orders.append({
            "id": commande.id_commande,
            "client": commande.acheteur or "Client",
            "date": commande.date.strftime("%d/%m/%Y") if commande.date else "-",
            "amount": f"{float(commande.prix_total):,.0f} Ar",
            "status": "Payée"
        })

    stock_entries = sum(
        movement.quantite for movement in mouvements
        if movement_kind(movement.type) == "entry"
    )
    stock_exits = sum(
        movement.quantite for movement in mouvements
        if movement_kind(movement.type) == "exit"
    ) + sum(commande.quantite for commande in commandes)
    expiration_alerts = sum(
        1 for produit in produits
        if notify_expiration and produit.date_peremption and produit.date_peremption <= expiration_limit
    )

    top_sales = defaultdict(int)
    for commande in commandes:
        if commande.produit:
            top_sales[commande.produit.designation] += commande.quantite
    top_medicaments = [
        {"name": name, "sales": sales}
        for name, sales in sorted(top_sales.items(), key=lambda item: item[1], reverse=True)[:5]
    ]

    return render_template(
        "dashboard.html",
        stats=stats,
        notifications=notifications,
        recent_orders=recent_orders,
        stock_entries=stock_entries,
        stock_exits=stock_exits,
        expiration_alerts=expiration_alerts,
        sales_chart=build_sales_chart(commandes, today),
        stock_data=build_stock_data(commandes, mouvements, produits, today, expiration_threshold),
        top_medicaments=top_medicaments
    )
