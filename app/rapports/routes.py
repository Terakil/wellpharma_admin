from datetime import date, datetime

from flask import Blueprint, jsonify, render_template, request
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import inspect, text

from app.models import db

rapports = Blueprint("rapports", __name__)


def first_value(row, names, default="-"):
    for name in names:
        if name in row and row[name] is not None:
            return row[name]
    return default


def format_value(value):
    if isinstance(value, (datetime, date)):
        return value.strftime("%d/%m/%Y")
    return str(value)


REPORT_TYPES = {
    "ventes": (1, "Ventes"),
    "stocks": (2, "Stocks"),
    "commandes": (3, "Commandes"),
    "clients": (4, "Clients"),
    "medicaments": (5, "Médicaments")
}


def report_type_label(value):
    try:
        type_id = int(value)
    except (TypeError, ValueError):
        return format_value(value)
    return next((label for code, label in REPORT_TYPES.values() if code == type_id), "Autre")


def load_reports():
    inspector = inspect(db.engine)
    table_names = inspector.get_table_names()
    if "rapports" not in table_names:
        return []

    rows = db.session.execute(text("SELECT * FROM rapports")).mappings().all()
    reports = []

    for row in rows:
        report_id = first_value(row, ["id", "id_rapport", "rapport_id"])
        report_type = first_value(row, [
            "type", "type_rapport", "categorie", "category", "rapport_type"
        ], "Autre")
        report_date = first_value(row, [
            "date", "date_rapport", "created_at", "date_creation"
        ])
        period = first_value(row, [
            "periode", "period", "periode_rapport", "date_periode"
        ], "-")

        reports.append({
            "id": report_id,
            "name": first_value(row, ["nom", "name", "titre", "libelle"], f"Rapport {report_id}"),
            "type": report_type_label(report_type),
            "period": format_value(period),
            "date": format_value(report_date),
            "status": format_value(first_value(row, [
                "statut", "status", "etat"
            ], "Disponible"))
        })

    return reports


@rapports.route("/rapports")
def page_rapports():
    reports = load_reports()
    types = [report["type"].lower() for report in reports]
    stats = {
        "total_reports": len(reports),
        "sales_reports": sum("vente" in report_type for report_type in types),
        "stock_reports": sum("stock" in report_type for report_type in types),
        "order_reports": sum("commande" in report_type for report_type in types),
        "client_reports": sum("client" in report_type for report_type in types)
    }

    return render_template(
        "rapports.html",
        stats=stats,
        reports=reports
    )


@rapports.route("/rapports/ajouter", methods=["POST"])
def ajouter_rapport():
    data = request.get_json(silent=True) or request.form
    report_type = str(data.get("type", "")).lower()
    period = str(data.get("period", "7days")).lower()

    if report_type not in REPORT_TYPES:
        return jsonify({"success": False, "message": "Type de rapport invalide."}), 400

    period_days = {
        "today": 1,
        "7days": 7,
        "30days": 30,
        "month": 30,
        "custom": 0
    }.get(period)
    if period_days is None:
        return jsonify({"success": False, "message": "Période invalide."}), 400

    report_id = f"R-{datetime.now().strftime('%Y%m%d%H%M%S%f')}"
    try:
        db.session.execute(
            text("INSERT INTO rapports (id, type, periode) VALUES (:id, :type, :periode)"),
            {"id": report_id, "type": REPORT_TYPES[report_type][0], "periode": period_days}
        )
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"success": False, "message": "Le rapport n'a pas pu être enregistré."}), 500

    return jsonify({"success": True, "message": "Rapport enregistré.", "id": report_id})