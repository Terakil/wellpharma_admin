from flask import (
    Blueprint,
    jsonify,
    render_template,
    request,
    redirect,
    url_for,
    flash
)
from datetime import date, datetime
from sqlalchemy.exc import SQLAlchemyError

from app.models import Fournisseur, db
from sqlalchemy import func


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
        db.session.expire_all()
        suppliers_db = Fournisseur.query.populate_existing().order_by(Fournisseur.id.desc()).all()
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
            "last_order_key": supplier.last_order.isoformat() if supplier.last_order else "",
            "arrival_date": display_date(supplier.arrival_date),
            "arrival_date_key": supplier.arrival_date.isoformat() if supplier.arrival_date else "",
            "delivery_delay": supplier.delivery_delay or 0,
            "amount": supplier.montant or 0,
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

    response = render_template(
        "fournisseurs.html",
        suppliers=suppliers,
        stats=stats,
        upcoming_suppliers=upcoming_suppliers
    )
    from flask import make_response
    page = make_response(response)
    page.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    page.headers["Pragma"] = "no-cache"
    return page


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

    if not name or not city or not contact:
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

    new_supplier = Fournisseur(
        id=(db.session.query(func.max(Fournisseur.id)).scalar() or 0) + 1,
        nom=name[:50],
        ville=city[:50],
        personneContact=contact[:50],
        tel=phone[:15] or None,
        MedicamentFourni=medicines[:50],
        LastCommand=last_order,
        DateArrive=arrival_date,
        delaiLivraison=delivery_delay,
        montant=amount,
    )

    try:
        db.session.add(new_supplier)
        db.session.commit()
        db.session.expire_all()
    except SQLAlchemyError:
        db.session.rollback()
        flash("Le fournisseur n'a pas pu être enregistré dans la base.", "danger")
        return redirect(url_for("fournisseurs.liste_fournisseurs"))

    flash("Le fournisseur a été ajouté avec succès.", "success")
    return redirect(url_for("fournisseurs.liste_fournisseurs"))


@fournisseurs.route("/fournisseurs/<int:supplier_id>/modifier", methods=["POST"])
def modifier_fournisseur(supplier_id):
    data = request.get_json(silent=True) or request.form
    supplier = db.session.get(Fournisseur, supplier_id)
    if supplier is None:
        return jsonify({"success": False, "message": "Fournisseur introuvable."}), 404

    name = (data.get("name") or supplier.nom).strip()
    city = (data.get("city") or supplier.ville).strip()
    contact = (data.get("contact") or supplier.personneContact).strip()
    phone = (data.get("phone") or "").strip()
    medicines = (data.get("medicines") or "Non spécifié").strip()
    last_order = parse_supplier_date(data.get("last_order")) or supplier.LastCommand
    arrival_date = parse_supplier_date(data.get("arrival_date")) or supplier.DateArrive

    if not name or not city or not contact:
        return jsonify({"success": False, "message": "Nom, ville et contact sont obligatoires."}), 400

    try:
        delivery_delay = int(data.get("delivery_delay", supplier.delaiLivraison))
        amount = int(float(data.get("amount", supplier.montant)))
        if delivery_delay < 0 or amount < 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "Délai ou montant invalide."}), 400

    supplier.nom = name[:50]
    supplier.ville = city[:50]
    supplier.personneContact = contact[:50]
    supplier.tel = phone[:15] or None
    supplier.MedicamentFourni = medicines[:50]
    supplier.LastCommand = last_order
    supplier.DateArrive = arrival_date
    supplier.delaiLivraison = delivery_delay
    supplier.montant = amount

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"success": False, "message": "Modification impossible dans la base."}), 500

    return jsonify({"success": True, "message": "Fournisseur modifié avec succès."})
