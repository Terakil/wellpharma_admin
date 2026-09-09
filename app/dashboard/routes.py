from datetime import date

from flask import Blueprint, render_template, redirect, url_for, session

from app.models import Commande, MouvementProduit, Produit, Utilisateur


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


@dashboard.route("/")
def home():
    if not session.get("admin_logged_in"):
        return redirect(url_for("auth.login"))

    produits = Produit.query.all()
    commandes_recentes = Commande.query.order_by(Commande.date.desc()).limit(5).all()
    commandes = Commande.query.all()
    mouvements = MouvementProduit.query.all()
    today = date.today()

    revenue_today = sum(
        float(commande.prix_total or 0)
        for commande in commandes
        if commande.date and commande.date.date() == today
    )
    total_stock = sum(produit.quantite for produit in produits)
    out_of_stock = sum(1 for produit in produits if produit.quantite == 0)
    clients = Utilisateur.query.filter(Utilisateur.role != "admin").count()

    stats = {
        "revenue": int(revenue_today),
        "stock": total_stock,
        "clients": clients,
        "orders": sum(1 for commande in commandes if commande.date and commande.date.date() == today),
        "out_of_stock": out_of_stock,
    }

    notifications = [
        f"{produit.designation} : {produit.quantite} unités restantes"
        for produit in produits
        if produit.quantite <= 10
    ][:3]

    if not notifications:
        notifications = ["Stock général satisfaisant pour le moment."]

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
    expiration_alerts = sum(1 for produit in produits if produit.quantite <= 10)

    return render_template(
        "dashboard.html",
        stats=stats,
        notifications=notifications,
        recent_orders=recent_orders,
        stock_entries=stock_entries,
        stock_exits=stock_exits,
        expiration_alerts=expiration_alerts
    )
