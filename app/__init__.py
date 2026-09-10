import os
from flask import Flask, session, redirect, url_for, request
from app.models import db
from sqlalchemy import inspect, text


def create_app():

    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "wellpharma")

    database_url = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://root:@localhost/pharmacie_db?charset=utf8mb4"
    )

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()
        product_columns = {
            column["name"] for column in inspect(db.engine).get_columns("produits")
        }
        if "date_peremption" not in product_columns:
            db.session.execute(text("ALTER TABLE produits ADD COLUMN date_peremption DATE NULL"))
        if "id_fournisseur" not in product_columns:
            db.session.execute(text("ALTER TABLE produits ADD COLUMN id_fournisseur INTEGER NULL"))
        if "date_peremption" not in product_columns or "id_fournisseur" not in product_columns:
            db.session.commit()


    # =========================
    # IMPORTATION DES BLUEPRINTS
    # =========================

    from app.dashboard.routes import dashboard
    from app.medicaments.routes import medicaments
    from app.stocks.routes import stocks
    from app.commandes.routes import commandes
    from app.clients.routes import clients
    from app.statistiques.routes import statistiques
    from app.rapports.routes import rapports
    from app.fournisseurs.routes import fournisseurs
    from app.parametres.routes import parametres
    from app.auth.routes import auth


    # =========================
    # ENREGISTREMENT DES BLUEPRINTS
    # =========================

    app.register_blueprint(dashboard)
    app.register_blueprint(medicaments)
    app.register_blueprint(stocks)
    app.register_blueprint(commandes)
    app.register_blueprint(clients)
    app.register_blueprint(statistiques)
    app.register_blueprint(rapports)
    app.register_blueprint(fournisseurs)
    app.register_blueprint(parametres)
    app.register_blueprint(auth)


    # =========================
    # PROTECTION DES PAGES
    # =========================

    @app.before_request
    def check_authentication():

        public_routes = [
            "auth.login",
            "static"
        ]

        if request.endpoint in public_routes:
            return

        if not session.get("admin_logged_in"):
            return redirect(url_for("auth.login"))


    return app

