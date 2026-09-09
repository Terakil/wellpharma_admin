from flask import Blueprint, render_template

from app.models import Commande, Utilisateur

clients = Blueprint(
    "clients",
    __name__
)


@clients.route("/clients")
def liste_clients():
    users = Utilisateur.query.filter(Utilisateur.role != "admin").order_by(Utilisateur.id_utilisateur.asc()).all()
    orders = Commande.query.all()
    orders_by_email = {}

    for order in orders:
        if order.acheteur:
            customer_orders = orders_by_email.setdefault(order.acheteur, [])
            customer_orders.append(order)

    clients_data = []
    for user in users:
        customer_orders = orders_by_email.get(user.email, [])
        total = sum(float(order.prix_total or 0) for order in customer_orders)
        clients_data.append({
            "id": user.id_utilisateur,
            "name": user.nom,
            "email": user.email,
            "phone": "-",
            "orders": len(customer_orders),
            "total": f"{total:,.0f}".replace(",", " ") + " Ar",
            "status": "Actif" if customer_orders else "Inactif"
        })

    return render_template(
        "clients.html",
        clients=clients_data
    )