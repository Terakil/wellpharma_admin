document.addEventListener("DOMContentLoaded", function () {


if (typeof Chart === "undefined") {
    console.error("Chart.js n'est pas chargé.");
    return;
}

// ==========================================================
// DONNEES FOURNIES PAR FLASK
// ==========================================================

const statisticsData = {
    "7": window.data7Days,
    "30": window.data30Days,
    "3months": window.data3Months
};

// ==========================================================
// COULEURS
// ==========================================================

const green = "#198754";
const greenLight = "rgba(25, 135, 84, 0.12)";

// ==========================================================
// GRAPHIQUE CHIFFRE D'AFFAIRES
// ==========================================================

const revenueCanvas = document.getElementById("revenueChart");

let revenueChart = null;

if (revenueCanvas && window.revenueData) {

    revenueChart = new Chart(revenueCanvas, {
        type: "line",

        data: {
            labels: window.revenueData.labels,

            datasets: [
                {
                    label: "Chiffre d'affaires",
                    data: window.revenueData.values,
                    borderColor: green,
                    backgroundColor: greenLight,
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: green,
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return (
                                " " +
                                Number(context.raw).toLocaleString("fr-FR") +
                                " Ar"
                            );
                        }
                    }
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        callback: function (value) {
                            return (
                                Number(value).toLocaleString("fr-FR") +
                                " Ar"
                            );
                        }
                    }
                }
            }
        }
    });
}

// ==========================================================
// GRAPHIQUE COMMANDES
// ==========================================================

const ordersCanvas = document.getElementById("ordersChart");

let ordersChart = null;

if (ordersCanvas && window.ordersData) {

    ordersChart = new Chart(ordersCanvas, {
        type: "bar",

        data: {
            labels: window.ordersData.labels,

            datasets: [
                {
                    label: "Commandes",
                    data: window.ordersData.values,
                    backgroundColor: green,
                    borderWidth: 0,
                    borderRadius: 6
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// ==========================================================
// GRAPHIQUE MEILLEURES VENTES
// ==========================================================

const bestSellersCanvas =
    document.getElementById("bestSellersChart");

let bestSellersChart = null;

if (bestSellersCanvas && window.bestSellersData) {

    bestSellersChart = new Chart(bestSellersCanvas, {
        type: "doughnut",

        data: {
            labels: window.bestSellersData.labels,

            datasets: [
                {
                    data: window.bestSellersData.values,
                    borderWidth: 2
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "60%",

            plugins: {
                legend: {
                    position: "right",

                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// ==========================================================
// CHANGEMENT DE PERIODE
// ==========================================================

const periodFilter =
    document.getElementById("periodFilter");

if (periodFilter) {

    periodFilter.addEventListener("change", function () {

        const period = this.value;

        const selectedData = statisticsData[period];

        if (!selectedData) {
            return;
        }

        // ------------------------------------------
        // Chiffre d'affaires
        // ------------------------------------------

        if (revenueChart) {

            revenueChart.data.labels =
                selectedData.revenue.labels;

            revenueChart.data.datasets[0].data =
                selectedData.revenue.values;

            revenueChart.update();
        }

        // ------------------------------------------
        // Commandes
        // ------------------------------------------

        if (ordersChart) {

            ordersChart.data.labels =
                selectedData.orders.labels;

            ordersChart.data.datasets[0].data =
                selectedData.orders.values;

            ordersChart.update();
        }

        // ------------------------------------------
        // Meilleures ventes
        // ------------------------------------------

        if (bestSellersChart) {

            bestSellersChart.data.labels =
                selectedData.best_sellers.labels;

            bestSellersChart.data.datasets[0].data =
                selectedData.best_sellers.values;

            bestSellersChart.update();
        }

        console.log("Période sélectionnée :", period);
    });
}


});
