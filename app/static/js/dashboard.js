/* =========================================================
   WELLPHARMA 2.0
   app/static/js/dashboard.js
   ========================================================= */


/* =========================================================
   1. DONNÉES DE LA COURBE
   ========================================================= */

/*
   Pour le moment, les données sont temporaires.
   Elles seront ensuite remplacées par les vraies données
   provenant de routes.py / de la base de données.
*/

const salesData = {

    7: {
        labels: [
            "02 Août",
            "03 Août",
            "04 Août",
            "05 Août",
            "06 Août",
            "07 Août",
            "08 Août"
        ],

        values: [
            85000,
            120000,
            95000,
            145000,
            110000,
            175000,
            123000
        ]
    },


    30: {
        labels: [
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

        values: [
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


    month: {
        labels: [
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

        values: [
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


    year: {
        labels: [
            "Jan",
            "Fév",
            "Mar",
            "Avr",
            "Mai",
            "Juin",
            "Juil",
            "Août"
        ],

        values: [
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

};


/* =========================================================
   2. FORMATAGE DES MONTANTS
   ========================================================= */

function formatCurrency(value) {

    return new Intl.NumberFormat("fr-FR").format(value) + " Ar";

}


/* =========================================================
   3. CRÉATION DE LA COURBE
   ========================================================= */

const chartCanvas = document.getElementById("salesChart");

let salesChart = null;


function createSalesChart(period = 7) {

    if (!chartCanvas) {
        return;
    }


    const data = salesData[period];


    if (!data) {
        return;
    }


    /* Supprime l'ancienne courbe */

    if (salesChart) {

        salesChart.destroy();

    }


    salesChart = new Chart(chartCanvas, {

        type: "line",


        data: {

            labels: data.labels,

            datasets: [

                {

                    label: "Ventes",

                    data: data.values,

                    fill: true,

                    tension: 0.35,

                    borderWidth: 2,

                    pointRadius: 4,

                    pointHoverRadius: 6,

                    backgroundColor: "rgba(21, 148, 71, 0.10)",

                    borderColor: "#159447",

                    pointBackgroundColor: "#159447",

                    pointBorderColor: "#ffffff",

                    pointBorderWidth: 2

                }

            ]

        },


        options: {

            responsive: true,

            maintainAspectRatio: false,


            interaction: {

                intersect: false,

                mode: "index"

            },


            plugins: {

                legend: {

                    display: false

                },


                tooltip: {

                    enabled: true,

                    displayColors: false,


                    callbacks: {

                        title: function(context) {

                            return context[0].label;

                        },


                        label: function(context) {

                            return "Ventes : " +
                                formatCurrency(context.parsed.y);

                        }

                    }

                }

            },


            scales: {

                x: {

                    grid: {

                        display: false

                    },


                    ticks: {

                        color: "#8a94a2",

                        font: {

                            family: "Poppins",

                            size: 10

                        }

                    }

                },


                y: {

                    beginAtZero: true,


                    grid: {

                        color: "#edf0f4"

                    },


                    ticks: {

                        color: "#8a94a2",

                        font: {

                            family: "Poppins",

                            size: 10

                        },


                        callback: function(value) {

                            return new Intl.NumberFormat("fr-FR")
                                .format(value) + " Ar";

                        }

                    }

                }

            }

        }

    });

}


/* =========================================================
   4. FILTRE DE LA COURBE
   ========================================================= */

const salesPeriod = document.getElementById("salesPeriod");


if (salesPeriod) {

    salesPeriod.addEventListener("change", function() {

        const selectedPeriod = this.value;

        createSalesChart(selectedPeriod);

    });

}


/* =========================================================
   5. INITIALISATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function() {

    createSalesChart(7);

});


/* =========================================================
   6. FILTRE ENTRÉES / SORTIES
   ========================================================= */

/*
   Ces données sont provisoires.
   Elles seront remplacées par les données de la base
   lorsque nous modifierons routes.py.
*/

const stockData = {

    day: {

        entries: 18,

        exits: 12,

        medicinesEntries: 18,

        medicinesExits: 12,

        ruptures: 7,

        expiration: 2

    },


    week: {

        entries: 125,

        exits: 98,

        medicinesEntries: 125,

        medicinesExits: 98,

        ruptures: 7,

        expiration: 5

    },


    month: {

        entries: 485,

        exits: 392,

        medicinesEntries: 485,

        medicinesExits: 392,

        ruptures: 9,

        expiration: 18

    },


    year: {

        entries: 5240,

        exits: 4890,

        medicinesEntries: 5240,

        medicinesExits: 4890,

        ruptures: 14,

        expiration: 62

    }

};


/* =========================================================
   7. ÉLÉMENTS HTML DU STOCK
   ========================================================= */

const stockPeriod = document.getElementById("stockPeriod");


const stockEntriesElement =
    document.querySelector(".stock-summary-item.entry strong");


const stockExitsElement =
    document.querySelector(".stock-summary-item.exit strong");


const stockDetailElements =
    document.querySelectorAll(".stock-detail strong");


/* =========================================================
   8. MISE À JOUR DU STOCK
   ========================================================= */

function updateStockData(period) {

    const data = stockData[period];


    if (!data) {
        return;
    }


    /* Entrées */

    if (stockEntriesElement) {

        stockEntriesElement.textContent =
            data.entries;

    }


    /* Sorties */

    if (stockExitsElement) {

        stockExitsElement.textContent =
            data.exits;

    }


    /*
       Les quatre éléments correspondent à :

       1. Médicaments entrés
       2. Médicaments sortis
       3. Ruptures de stock
       4. Alertes péremption
    */

    if (stockDetailElements.length >= 4) {

        stockDetailElements[0].textContent =
            data.medicinesEntries;


        stockDetailElements[1].textContent =
            data.medicinesExits;


        stockDetailElements[2].textContent =
            data.ruptures;


        stockDetailElements[3].textContent =
            data.expiration;

    }

}


/* =========================================================
   9. ÉCOUTE DU FILTRE STOCK
   ========================================================= */

if (stockPeriod) {

    stockPeriod.addEventListener("change", function() {

        const selectedPeriod = this.value;

        updateStockData(selectedPeriod);

    });

}


/* =========================================================
   10. INITIALISATION DU STOCK
   ========================================================= */

document.addEventListener("DOMContentLoaded", function() {

    updateStockData("week");

});