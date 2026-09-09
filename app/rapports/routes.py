from datetime import date, datetime

from flask import Blueprint, render_template
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
            "type": format_value(report_type),
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