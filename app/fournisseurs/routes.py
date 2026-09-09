from flask import (
    Blueprint,
    render_template,
    request,
    redirect,
    url_for,
    flash
)
from datetime import date, datetime
from sqlalchemy.exc import SQLAlchemyError

from app.models import db, Supplier


fournisseurs = Blueprint("fournisseurs", __name__)


def parse_supplier_date(value):
    value = (value or "").strip()
    for date_format in ("%Y-%m-%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(value, date_format).date()
        except ValueError:
            continue
    return None


def display_date(value):
    return value.strftime("%d/%m/%Y") if value else "-"


@fournisseurs.route("/fournisseurs")
def liste_fournisseurs():
    try:
        suppliers_db = Supplier.query.order_by(Supplier.id.desc()).all()
    except SQLAlchemyError:
        db.session.rollback()
        flash("Impossible de lire la table fournisseurs. Vérifiez la connexion à la base.", "danger")
        suppliers_db = []
    suppliers = []

    for supplier in suppliers_db:
        arrival_date = supplier.arrival_date
        if arrival_date and arrival_date < date.today():
            status = "En retard"
        elif arrival_date and arrival_date >= date.today():
            status = "Commande en attente"
        else:
            status = "Actif"

        suppliers.append({
            "id": supplier.id,
            "name": supplier.name,
            "city": supplier.city,
            "contact": supplier.contact,
            "phone": supplier.phone,
            "medicines": [item.strip() for item in supplier.medicines.split(",")] if supplier.medicines else [],
            "last_order": display_date(supplier.last_order),
            "arrival_date": display_date(supplier.arrival_date),
            "delivery_delay": supplier.delivery_delay or 0,
            "amount": supplier.amount or 0,
            "status": status
        })

    stats = {
        "total": len(suppliers),
        "active": sum(1 for supplier in suppliers if supplier["status"] == "Actif"),
        "pending": sum(1 for supplier in suppliers if supplier["status"] == "Commande en attente"),
        "upcoming": sum(1 for supplier in suppliers if supplier["arrival_date"] != "-"),
        "alerts": sum(1 for supplier in suppliers if supplier["status"] == "En retard")
    }

    upcoming_suppliers = []
    for supplier in suppliers:
        if supplier["arrival_date"] != "-":
            upcoming_suppliers.append({
                "name": supplier["name"],
                "medicine": " + ".join(supplier["medicines"]),
                "arrival_date": supplier["arrival_date"],
                "delivery_delay": supplier["delivery_delay"]
            })

    return render_template("fournisseurs.html", suppliers=suppliers, stats=stats, upcoming_suppliers=upcoming_suppliers)


@fournisseurs.route("/fournisseurs/ajouter", methods=["POST"])
def ajouter_fournisseur():
    name = request.form.get("name", "").strip()
    city = request.form.get("city", "").strip()
    contact = request.form.get("contact", "").strip()
    phone = request.form.get("phone", "").strip()
    medicines = request.form.get("medicines", "").strip() or "Non spécifié"
    last_order = parse_supplier_date(request.form.get("last_order"))
    arrival_date = parse_supplier_date(request.form.get("arrival_date"))
    delivery_delay = request.form.get("delivery_delay", 0)
    amount = request.form.get("amount", 0)

    if not name or not city or not contact or not phone:
        flash("Veuillez remplir tous les champs obligatoires.", "danger")
        return redirect(url_for("fournisseurs.liste_fournisseurs"))

    last_order = last_order or date.today()
    arrival_date = arrival_date or date.today()

    try:
        delivery_delay = int(delivery_delay)
        amount = int(float(amount))
        if delivery_delay < 0 or amount < 0:
            raise ValueError
    except (TypeError, ValueError):
        flash("Les dates, le délai et le montant doivent être valides.", "danger")
        return redirect(url_for("fournisseurs.liste_fournisseurs"))

    new_supplier = Supplier(
        nom=name[:50],
        ville=city[:50],
        personne_contact=contact[:50],
        tel=phone[:15] or None,
        medicament_fourni=medicines[:50],
        last_command=last_order,
        date_arrive=arrival_date,
        delai_livraison=delivery_delay,
        montant=amount,
    )

    try:
        db.session.add(new_supplier)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        flash("Le fournisseur n'a pas pu être enregistré dans la base.", "danger")
        return redirect(url_for("fournisseurs.liste_fournisseurs"))

    flash("Le fournisseur a été ajouté avec succès.", "success")
    return redirect(url_for("fournisseurs.liste_fournisseurs"))
