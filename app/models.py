from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


db = SQLAlchemy()


class Produit(db.Model):
    __tablename__ = "produits"

    id_produit = db.Column(db.Integer, primary_key=True)
    designation = db.Column(db.String(255), nullable=False)
    reference = db.Column(db.String(50), unique=True, nullable=False)
    categorie = db.Column(db.String(100))
    quantite = db.Column(db.Integer, nullable=False, default=0)
    prix_unitaire = db.Column(db.Numeric(10, 2), nullable=False)
    statut = db.Column(db.String(20), default="EN STOCK")
    description = db.Column(db.Text)
    image_url = db.Column(db.Text)
    needs_prescription = db.Column(db.Boolean, default=False, nullable=False)
    date_ajout = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def id(self):
        return self.id_produit

    @property
    def name(self):
        return self.designation

    @name.setter
    def name(self, value):
        self.designation = value

    @property
    def category(self):
        return self.categorie

    @category.setter
    def category(self, value):
        self.categorie = value

    @property
    def quantity(self):
        return self.quantite

    @quantity.setter
    def quantity(self, value):
        self.quantite = value

    @property
    def price(self):
        return float(self.prix_unitaire) if self.prix_unitaire is not None else 0.0

    @price.setter
    def price(self, value):
        self.prix_unitaire = value

    @property
    def image(self):
        return self.image_url

    @image.setter
    def image(self, value):
        self.image_url = value

    @property
    def image_url_value(self):
        return self.image_url

    @property
    def requires_prescription_value(self):
        return bool(self.needs_prescription)

    @property
    def expiration_date(self):
        return None

    @property
    def supplier(self):
        return None

    def __repr__(self):
        return f"<Produit {self.designation}>"


class Utilisateur(db.Model):
    __tablename__ = "utilisateurs"

    id_utilisateur = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False, default="user")
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    motdepasse = db.Column(db.String(255), nullable=False)

    @property
    def name(self):
        return self.nom

    @name.setter
    def name(self, value):
        self.nom = value

    @property
    def password(self):
        return self.motdepasse

    @password.setter
    def password(self, value):
        self.motdepasse = value

    @property
    def phone(self):
        return ""

    @phone.setter
    def phone(self, value):
        pass

    def __repr__(self):
        return f"<Utilisateur {self.email}>"


class Commande(db.Model):
    __tablename__ = "commandes"

    id_commande = db.Column(db.Integer, primary_key=True)
    id_produit = db.Column(db.Integer, db.ForeignKey("produits.id_produit"), nullable=False)
    quantite = db.Column(db.Integer, nullable=False)
    prix_total = db.Column(db.Numeric(15, 2), nullable=False)
    acheteur = db.Column(db.String(100))
    date = db.Column(db.DateTime, default=datetime.utcnow)

    produit = db.relationship("Produit")

    @property
    def id(self):
        return self.id_commande

    def __repr__(self):
        return f"<Commande {self.id_commande}>"


class Fournisseur(db.Model):
    __tablename__ = "fournisseurs"

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(50), nullable=False)
    ville = db.Column(db.String(50), nullable=False)
    personneContact = db.Column(db.String(50), nullable=False)
    tel = db.Column(db.String(15))
    LastCommand = db.Column(db.Date, nullable=False)
    DateArrive = db.Column(db.Date, nullable=False)
    MedicamentFourni = db.Column(db.String(50), nullable=False)
    delaiLivraison = db.Column(db.Integer, nullable=False)
    montant = db.Column(db.Integer, nullable=False)

    @property
    def name(self):
        return self.nom

    @property
    def city(self):
        return self.ville

    @property
    def contact(self):
        return self.personneContact

    @property
    def phone(self):
        return self.tel

    @property
    def last_order(self):
        return self.LastCommand

    @property
    def arrival_date(self):
        return self.DateArrive

    @property
    def medicines(self):
        return self.MedicamentFourni

    @property
    def delivery_delay(self):
        return self.delaiLivraison


class MouvementStock(db.Model):
    __tablename__ = "stock_movements"

    id = db.Column(db.Integer, primary_key=True)
    medicine_id = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime)


class MouvementProduit(db.Model):
    __tablename__ = "mouvements_produits"

    id = db.Column(db.Integer, primary_key=True)
    id_produit = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(20), nullable=False)
    quantite = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class ProduitArchive(db.Model):
    __tablename__ = "produits_archives"

    id = db.Column(db.Integer, primary_key=True)
    id_produit = db.Column(db.Integer, unique=True, nullable=False)
    date_archivage = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


Medicine = Produit
MedicineInfo = Produit
StockMovement = MouvementStock
Supplier = Fournisseur
AdminProfile = Utilisateur