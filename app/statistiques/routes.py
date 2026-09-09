from datetime import date, timedelta

from flask import Blueprint, render_template

from app.models import Commande, Produit, Utilisateur


statistiques = Blueprint("statistiques", __name__)


def build_period_data(orders, products, days):
    today = date.today()
    start = today - timedelta(days=days - 1)
    labels = []
    revenue_values = []
    order_values = []

    for offset in range(days):
        current = start + timedelta(days=offset)
        labels.append(current.strftime("%d/%m"))
        day_orders = [
            order for order in orders
            if order.date and order.date.date() == current
        ]
        revenue_values.append(sum(float(order.prix_total or 0) for order in day_orders))
        order_values.append(len(day_orders))

    product_sales = {}
    for order in orders:
        if order.date and start <= order.date.date() <= today:
            product_sales[order.id_produit] = product_sales.get(order.id_produit, 0) + order.quantite

    product_names = {product.id_produit: product.designation for product in products}
    best = sorted(product_sales.items(), key=lambda item: item[1], reverse=True)[:5]

    return {
        "revenue": {"labels": labels, "values": revenue_values},
        "orders": {"labels": labels, "values": order_values},
        "best_sellers": {
            "labels": [product_names.get(product_id, "Produit inconnu") for product_id, _ in best],
            "values": [quantity for _, quantity in best]
        }
    }


@statistiques.route("/statistiques")
def page_statistiques():
    orders = Commande.query.all()
    products = Produit.query.all()
    clients = Utilisateur.query.filter(Utilisateur.role != "admin").count()
    revenue = sum(float(order.prix_total or 0) for order in orders)
    average_basket = revenue / len(orders) if orders else 0

    data_7_days = build_period_data(orders, products, 7)
    data_30_days = build_period_data(orders, products, 30)
    data_3_months = build_period_data(orders, products, 90)

    best_labels = data_7_days["best_sellers"]["labels"]
    best_values = data_7_days["best_sellers"]["values"]
    best_product = best_labels[0] if best_labels else "Aucun produit"
    best_quantity = best_values[0] if best_values else 0

    daily_revenue = data_7_days["revenue"]["values"]
    best_day_index = daily_revenue.index(max(daily_revenue)) if daily_revenue else 0
    best_day = data_7_days["revenue"]["labels"][best_day_index] if daily_revenue else "-"
    best_day_revenue = daily_revenue[best_day_index] if daily_revenue else 0

    stats = {
        "revenue": revenue,
        "orders": len(orders),
        "clients": clients,
        "average_basket": average_basket
    }
    analysis = {
        "best_day": best_day,
        "best_day_revenue": f"{best_day_revenue:,.0f}".replace(",", " ") + " Ar",
        "best_product": best_product,
        "best_product_quantity": best_quantity,
        "revenue_evolution": "Données en temps réel"
    }

    return render_template(
        "statistiques.html",
        stats=stats,
        revenue_data=data_7_days["revenue"],
        orders_data=data_7_days["orders"],
        best_sellers=data_7_days["best_sellers"],
        analysis=analysis,
        data_7_days=data_7_days,
        data_30_days=data_30_days,
        data_3_months=data_3_months
    )
