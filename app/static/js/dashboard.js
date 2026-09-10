const dashboardData = window.dashboardData || { sales: {}, stock: {} };
const chartCanvas = document.getElementById("salesChart");
const salesPeriod = document.getElementById("salesPeriod");
const stockPeriod = document.getElementById("stockPeriod");
const stockEntriesElement = document.querySelector(".stock-summary-item.entry strong");
const stockExitsElement = document.querySelector(".stock-summary-item.exit strong");
const stockDetailElements = document.querySelectorAll(".stock-detail strong");
let salesChart = null;

function formatCurrency(value) {
    return new Intl.NumberFormat("fr-FR").format(value) + " Ar";
}

function createSalesChart(period = "7") {
    if (!chartCanvas || !dashboardData.sales[period]) return;
    if (salesChart) salesChart.destroy();

    const data = dashboardData.sales[period];
    salesChart = new Chart(chartCanvas, {
        type: "line",
        data: {
            labels: data.labels,
            datasets: [{
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
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: "index" },
            plugins: {
                legend: { display: false },
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        label: context => "Ventes : " + formatCurrency(context.parsed.y)
                    }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: "#8a94a2", font: { family: "Poppins", size: 10 } } },
                y: {
                    beginAtZero: true,
                    grid: { color: "#edf0f4" },
                    ticks: {
                        color: "#8a94a2",
                        font: { family: "Poppins", size: 10 },
                        callback: value => formatCurrency(value)
                    }
                }
            }
        }
    });
}

function updateStockData(period) {
    const data = dashboardData.stock[period];
    if (!data) return;
    if (stockEntriesElement) stockEntriesElement.textContent = data.entries;
    if (stockExitsElement) stockExitsElement.textContent = data.exits;
    if (stockDetailElements.length >= 4) {
        stockDetailElements[0].textContent = data.entries;
        stockDetailElements[1].textContent = data.exits;
        stockDetailElements[2].textContent = data.ruptures;
        stockDetailElements[3].textContent = data.expiration;
    }
}

if (salesPeriod) {
    salesPeriod.addEventListener("change", () => createSalesChart(salesPeriod.value));
}
if (stockPeriod) {
    stockPeriod.addEventListener("change", () => updateStockData(stockPeriod.value));
}

document.addEventListener("DOMContentLoaded", () => {
    createSalesChart(salesPeriod ? salesPeriod.value : "7");
    updateStockData(stockPeriod ? stockPeriod.value : "week");
    window.setTimeout(() => window.location.reload(), 30000);
});
