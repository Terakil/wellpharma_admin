document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const searchInput = document.getElementById("medicineSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const stockFilter = document.getElementById("stockFilter");

    const tableBody = document.getElementById("medicineTableBody");

    const totalMedicines = document.getElementById("totalMedicines");
    const inStockCount = document.getElementById("inStockCount");
    const lowStockCount = document.getElementById("lowStockCount");
    const outOfStockCount = document.getElementById("outOfStockCount");


    // =====================================================
    // RECUPERER LES LIGNES
    // =====================================================

    function getMedicineRows() {
        return Array.from(
            tableBody.querySelectorAll(".medicine-row")
        );
    }


    // =====================================================
    // DETERMINER LE STATUT DU STOCK
    // =====================================================

    function getStockStatus(quantity) {

        quantity = parseInt(quantity);

        if (quantity === 0) {
            return "out";
        }

        if (quantity <= 10) {
            return "low";
        }

        return "available";
    }


    // =====================================================
    // FILTRER LES MEDICAMENTS
    // =====================================================

    function filterMedicines() {

        const searchValue = searchInput.value
            .toLowerCase()
            .trim();

        const categoryValue = categoryFilter.value
            .toLowerCase();

        const stockValue = stockFilter.value;

        const rows = getMedicineRows();

        rows.forEach(function (row) {

            const name = row.dataset.name || "";
            const category = row.dataset.category || "";
            const quantity = parseInt(
                row.dataset.quantity || 0
            );

            const stockStatus = getStockStatus(quantity);

            const matchSearch =
                name.includes(searchValue);

            const matchCategory =
                categoryValue === "" ||
                category === categoryValue;

            const matchStock =
                stockValue === "" ||
                stockStatus === stockValue;

            if (
                matchSearch &&
                matchCategory &&
                matchStock
            ) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }

        });

    }


    // =====================================================
    // METTRE A JOUR LES COMPTEURS
    // =====================================================

    function updateCounters() {

        const rows = getMedicineRows();

        let total = 0;
        let inStock = 0;
        let lowStock = 0;
        let outOfStock = 0;

        rows.forEach(function (row) {

            const quantity = parseInt(
                row.dataset.quantity || 0
            );

            total++;

            if (quantity > 10) {
                inStock++;
            }
            else if (quantity > 0) {
                lowStock++;
            }
            else {
                outOfStock++;
            }

        });


        totalMedicines.textContent = total;
        inStockCount.textContent = inStock;
        lowStockCount.textContent = lowStock;
        outOfStockCount.textContent = outOfStock;
    }


    // =====================================================
    // EVENEMENTS DES FILTRES
    // =====================================================

    searchInput.addEventListener(
        "input",
        filterMedicines
    );

    categoryFilter.addEventListener(
        "change",
        filterMedicines
    );

    stockFilter.addEventListener(
        "change",
        filterMedicines
    );


    // =====================================================
    // BOUTON VOIR
    // =====================================================

    function setupViewButtons() {

        const buttons = document.querySelectorAll(
            ".action-btn.view"
        );

        buttons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const row =
                        button.closest(".medicine-row");

                    const name =
                        row.dataset.name;

                    alert(
                        "Médicament : " + name
                    );

                }
            );

        });

    }


    // =====================================================
    // BOUTON MODIFIER
    // =====================================================

    function setupEditButtons() {

        const buttons = document.querySelectorAll(
            ".action-btn.edit"
        );

        buttons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const row =
                        button.closest(".medicine-row");

                    const name =
                        row.dataset.name;

                    alert(
                        "Modification de : " + name
                    );

                }
            );

        });

    }


    // =====================================================
    // BOUTON SUPPRIMER
    // =====================================================

    function setupDeleteButtons() {

        const buttons = document.querySelectorAll(
            ".action-btn.delete"
        );

        buttons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const row =
                        button.closest(".medicine-row");

                    const name =
                        row.dataset.name;

                    const confirmation =
                        confirm(
                            "Voulez-vous supprimer " +
                            name +
                            " ?"
                        );

                    if (confirmation) {

                        alert(
                            "La suppression sera connectée à la base de données."
                        );

                    }

                }
            );

        });

    }


    // =====================================================
    // INITIALISATION
    // =====================================================

    updateCounters();

    setupViewButtons();
    setupEditButtons();
    setupDeleteButtons();

});