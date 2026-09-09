from flask import Blueprint, render_template

main = Blueprint("main", __name__)


@main.route("/")
def index():

    # =====================================================
    # 5 CARTES PRINCIPALES
    # =====================================================

    stats = {
        "revenue": 429000,
        "stock": 248,
        "clients": 156,
        "orders": 18,
        "out_of_stock": 7
    }


    # =====================================================
    # ENTREES / SORTIES DE STOCK
    # =====================================================

    stock_entries = 125
    stock_exits = 98

    expiration_alerts = 5


    # =====================================================
    # COURBE DES VENTES
    # =====================================================

    sales_chart = {

        "7": {
            "labels": [
                "02 Août",
                "03 Août",
                "04 Août",
                "05 Août",
                "06 Août",
                "07 Août",
                "08 Août"
            ],

            "values": [
                85000,
                120000,
                95000,
                145000,
                110000,
                175000,
                123000
            ]
        },

        "30": {
            "labels": [
                "10 Juil.",
                "12 Juil.",
                "14 Juil.",
                "16 Juil.",
                "18 Juil.",
                "20 Juil.",
                "22 Juil.",
                "24 Juil.",
                "26 Juil.",
                "28 Juil.",
                "30 Juil.",
                "01 Août",
                "03 Août",
                "05 Août",
                "08 Août"
            ],

            "values": [
                90000,
                115000,
                105000,
                130000,
                95000,
                145000,
                125000,
                160000,
                135000,
                180000,
                155000,
                170000,
                145000,
                175000,
                123000
            ]
        },

        "month": {
            "labels": [
                "01",
                "03",
                "05",
                "07",
                "09",
                "11",
                "13",
                "15",
                "17",
                "19",
                "21",
                "23",
                "25",
                "27",
                "29",
                "31"
            ],

            "values": [
                80000,
                105000,
                92000,
                125000,
                110000,
                135000,
                115000,
                150000,
                142000,
                160000,
                148000,
                175000,
                155000,
                185000,
                165000,
                123000
            ]
        },

        "year": {
            "labels": [
                "Jan",
                "Fév",
                "Mar",
                "Avr",
                "Mai",
                "Juin",
                "Juil",
                "Août"
            ],

            "values": [
                2850000,
                3200000,
                2950000,
                3500000,
                3750000,
                4100000,
                4350000,
                2850000
            ]
        }
    }


    # =====================================================
    # TOP 5 MÉDICAMENTS LES PLUS VENDUS
    # =====================================================

    top_medicaments = [

        {
            "name": "Paracétamol",
            "sales": 145
        },

        {
            "name": "Amoxicilline",
            "sales": 120
        },

        {
            "name": "Ibuprofène",
            "sales": 98
        },

        {
            "name": "Doliprane",
            "sales": 87
        },

        {
            "name": "Vitamine C",
            "sales": 74
        }
    ]


    # =====================================================
    # DERNIÈRES COMMANDES
    # =====================================================

    latest_orders = [

        {
            "id": "#1001",
            "client": "Jean Rakoto",
            "date": "08/08/2026",
            "amount": "78 000 Ar",
            "status": "Payée"
        },

        {
            "id": "#1002",
            "client": "Marie Rabe",
            "date": "08/08/2026",
            "amount": "43 000 Ar",
            "status": "En attente"
        },

        {
            "id": "#1003",
            "client": "Paul Ranaivo",
            "date": "08/08/2026",
            "amount": "123 000 Ar",
            "status": "Payée"
        }
    ]


    # =====================================================
    # NOTIFICATIONS
    # =====================================================

    notifications = [

        {
            "type": "danger",
            "message": "Rupture de stock"
        },

        {
            "type": "success",
            "message": "Nouvelle commande"
        },

        {
            "type": "warning",
            "message": "Péremption"
        },

        {
            "type": "low-stock",
            "message": "Stock faible"
        }
    ]


    # =====================================================
    # ENVOI DES DONNÉES AU DASHBOARD
    # =====================================================

    return render_template(
        "dashboard.html",

        stats=stats,

        stock_entries=stock_entries,
        stock_exits=stock_exits,
        expiration_alerts=expiration_alerts,

        sales_chart=sales_chart,

        top_medicaments=top_medicaments,

        latest_orders=latest_orders,

        notifications=notifications
    )