document.addEventListener("DOMContentLoaded", function () {

    const showAllAlerts = document.getElementById("showAllAlerts");
    const showAllMovements = document.getElementById("showAllMovements");

    if (showAllAlerts) {
        showAllAlerts.addEventListener("click", function () {
            toggleList(showAllAlerts, ".alert-list", ".alert-item");
        });
    }

    if (showAllMovements) {
        showAllMovements.addEventListener("click", function () {
            toggleList(showAllMovements, ".recent-list", ".recent-item");
        });
    }

    function toggleList(button, containerSelector, itemSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            return;
        }

        const items = Array.from(container.querySelectorAll(itemSelector));
        const expanded = button.dataset.expanded === "true";
        items.forEach(function (item, index) {
            item.style.display = !expanded && index >= 5 ? "" : index >= 5 ? "none" : "";
        });
        button.dataset.expanded = String(!expanded);
        button.textContent = expanded ? "Voir tout →" : "Voir moins ↑";
    }

    /* =====================================================
       GRAPHIQUE DES MOUVEMENTS
    ===================================================== */

    const canvas =
        document.getElementById("stockMovementChart");

    if (canvas && window.stockMovements) {

        const data = window.stockMovements;

        new Chart(canvas, {

            type: "line",

            data: {

                labels: data.labels,

                datasets: [

                    {
                        label: "Entrées",
                        data: data.entries,
                        borderWidth: 3,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 4
                    },

                    {
                        label: "Sorties",
                        data: data.exits,
                        borderWidth: 3,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 4
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
                        display: true,
                        position: "top"
                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {
                            stepSize: 10
                        }

                    }

                }

            }

        });

    }


    /* =====================================================
       RECHERCHE ET FILTRES
    ===================================================== */

    const searchInput =
        document.getElementById("stockSearch");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const statusFilter =
        document.getElementById("statusFilter");

    const sortFilter =
        document.getElementById("sortFilter");

    const rows =
        document.querySelectorAll(".stock-row");

    const emptyStock =
        document.getElementById("emptyStock");

    const stockCount =
        document.getElementById("stockCount");


    function filterStocks() {

        const search = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

        const category = categoryFilter
            ? categoryFilter.value.toLowerCase()
            : "";

        const status = statusFilter
            ? statusFilter.value.toLowerCase()
            : "";

        let visibleRows = [];


        rows.forEach(function (row) {

            const name =
                row.dataset.name || "";

            const rowCategory =
                row.dataset.category || "";

            const rowStatus =
                row.dataset.status || "";


            const matchesSearch =
                name.includes(search);

            const matchesCategory =
                !category ||
                rowCategory === category;

            const matchesStatus =
                !status ||
                rowStatus === status;


            if (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            ) {

                row.style.display = "";

                visibleRows.push(row);

            } else {

                row.style.display = "none";

            }

        });


        if (visibleRows.length === 0) {

            emptyStock.style.display =
                "table-row";

        } else {

            emptyStock.style.display =
                "none";

        }


        stockCount.textContent =
            visibleRows.length +
            " produit(s)";
    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterStocks
        );

    }


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            filterStocks
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterStocks
        );

    }


    /* =====================================================
       TRI
    ===================================================== */

    if (sortFilter) {

        sortFilter.addEventListener(
            "change",
            function () {

                const tbody =
                    document.getElementById(
                        "stockTableBody"
                    );

                const rowsArray =
                    Array.from(
                        document.querySelectorAll(
                            ".stock-row"
                        )
                    );

                const value =
                    sortFilter.value;


                if (value === "quantity-desc") {

                    rowsArray.sort(function (a, b) {

                        return (
                            Number(
                                b.dataset.quantity
                            ) -
                            Number(
                                a.dataset.quantity
                            )
                        );

                    });

                }


                if (value === "quantity-asc") {

                    rowsArray.sort(function (a, b) {

                        return (
                            Number(
                                a.dataset.quantity
                            ) -
                            Number(
                                b.dataset.quantity
                            )
                        );

                    });

                }


                if (value === "name") {

                    rowsArray.sort(function (a, b) {

                        return a.dataset.name.localeCompare(
                            b.dataset.name
                        );

                    });

                }


                rowsArray.forEach(function (row) {

                    tbody.appendChild(row);

                });


                filterStocks();

            }
        );

    }


    /* =====================================================
       RESET
    ===================================================== */

    const resetButton =
        document.getElementById(
            "resetFilters"
        );


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            function () {

                if (searchInput) {
                    searchInput.value = "";
                }

                if (categoryFilter) {
                    categoryFilter.value = "";
                }

                if (statusFilter) {
                    statusFilter.value = "";
                }

                if (sortFilter) {
                    sortFilter.value = "";
                }


                rows.forEach(function (row) {

                    row.style.display = "";

                });


                emptyStock.style.display =
                    "none";


                stockCount.textContent =
                    rows.length +
                    " produit(s)";

            }
        );

    }


    /* =====================================================
       NOUVELLE ENTRÉE
    ===================================================== */

    const addStockBtn =
        document.getElementById(
            "addStockBtn"
        );

    const stockEntryModalElement =
        document.getElementById(
            "stockEntryModal"
        );

    const entryMedicine =
        document.getElementById(
            "entryMedicine"
        );

    const entryQuantity =
        document.getElementById(
            "entryQuantity"
        );

    const saveStockEntry =
        document.getElementById(
            "saveStockEntry"
        );

    const stockEntryMessage =
        document.getElementById(
            "stockEntryMessage"
        );


    let stockEntryModal = null;


    if (stockEntryModalElement) {

        stockEntryModal =
            new bootstrap.Modal(
                stockEntryModalElement
            );

    }


    if (addStockBtn && stockEntryModal) {

        addStockBtn.addEventListener(
            "click",
            function () {

                entryMedicine.value = "";
                entryQuantity.value = "1";

                stockEntryMessage.className =
                    "alert d-none";

                stockEntryMessage.textContent =
                    "";

                stockEntryModal.show();

            }
        );

    }


    if (saveStockEntry) {

        saveStockEntry.addEventListener(
            "click",
            async function () {

                const medicineId =
                    entryMedicine.value;

                const quantity =
                    Number(
                        entryQuantity.value
                    );


                if (!medicineId) {

                    showEntryMessage(
                        "Veuillez sélectionner un médicament.",
                        "danger"
                    );

                    return;
                }


                if (
                    !quantity ||
                    quantity <= 0
                ) {

                    showEntryMessage(
                        "Veuillez saisir une quantité valide.",
                        "danger"
                    );

                    return;
                }


                saveStockEntry.disabled =
                    true;


                try {

                    const response =
                        await fetch(
                            "/stocks/entry",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    medicine_id:
                                        medicineId,

                                    quantity:
                                        quantity
                                })
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok ||
                        !result.success) {

                        showEntryMessage(
                            result.message ||
                            "Une erreur est survenue.",
                            "danger"
                        );

                        return;
                    }


                    showEntryMessage(
                        result.message,
                        "success"
                    );


                    setTimeout(
                        function () {

                            window.location.reload();

                        },
                        700
                    );

                } catch (error) {

                    console.error(error);

                    showEntryMessage(
                        "Impossible de contacter le serveur.",
                        "danger"
                    );

                } finally {

                    saveStockEntry.disabled =
                        false;

                }

            }
        );

    }


    function showEntryMessage(
        message,
        type
    ) {

        if (!stockEntryMessage) {
            return;
        }

        stockEntryMessage.className =
            "alert alert-" + type;

        stockEntryMessage.textContent =
            message;

    }


    /* =====================================================
       VOIR
    ===================================================== */

    const viewButtons =
        document.querySelectorAll(
            ".action-btn.view"
        );


    viewButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const row =
                    button.closest(
                        ".stock-row"
                    );

                const name =
                    row.dataset.name;

                alert(
                    "Médicament : " +
                    name
                );

            }
        );

    });


    /* =====================================================
       ENTRÉE + 1
    ===================================================== */

    const entryButtons =
        document.querySelectorAll(
            ".action-btn.entry"
        );


    entryButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const row =
                    button.closest(
                        ".stock-row"
                    );

                const medicineId =
                    row.dataset.id;


                adjustStock(
                    medicineId,
                    "increase",
                    row
                );

            }
        );

    });


    /* =====================================================
       SORTIE - 1
    ===================================================== */

    const exitButtons =
        document.querySelectorAll(
            ".action-btn.exit"
        );


    exitButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const row =
                    button.closest(
                        ".stock-row"
                    );

                const medicineId =
                    row.dataset.id;


                adjustStock(
                    medicineId,
                    "decrease",
                    row
                );

            }
        );

    });


    /* =====================================================
       MODIFICATION DU STOCK
    ===================================================== */

    async function adjustStock(
        medicineId,
        action,
        row
    ) {

        const buttons =
            row.querySelectorAll(
                ".action-btn"
            );


        buttons.forEach(function (button) {

            button.disabled = true;

        });


        try {

            const response =
                await fetch(
                    "/stocks/" +
                    medicineId +
                    "/adjust",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            action: action
                        })
                    }
                );


            const result =
                await response.json();


            if (!response.ok ||
                !result.success) {

                alert(
                    result.message ||
                    "Impossible de modifier le stock."
                );

                return;
            }


            updateStockRow(
                row,
                result.quantity,
                result.status
            );


        } catch (error) {

            console.error(error);

            alert(
                "Impossible de contacter le serveur."
            );

        } finally {

            buttons.forEach(function (button) {

                button.disabled = false;

            });

        }

    }


    /* =====================================================
       MISE À JOUR VISUELLE DE LA LIGNE
    ===================================================== */

    function updateStockRow(
        row,
        quantity,
        status
    ) {

        const quantityElement =
            row.querySelector(
                ".quantity"
            );

        const statusElement =
            row.querySelector(
                ".status-badge"
            );


        if (quantityElement) {

            quantityElement.textContent =
                quantity;

        }


        row.dataset.quantity =
            quantity;


        row.dataset.status =
            status.toLowerCase();


        if (statusElement) {

            if (status === "Rupture") {

                statusElement.className =
                    "status-badge rupture";

                statusElement.innerHTML =
                    '<i class="bi bi-x-circle"></i>' +
                    " Rupture";

            }

            else if (
                status === "Stock faible"
            ) {

                statusElement.className =
                    "status-badge faible";

                statusElement.innerHTML =
                    '<i class="bi bi-exclamation-circle"></i>' +
                    " Stock faible";

            }

            else {

                statusElement.className =
                    "status-badge disponible";

                statusElement.innerHTML =
                    '<i class="bi bi-check-circle"></i>' +
                    " En stock";

            }

        }

    }

});