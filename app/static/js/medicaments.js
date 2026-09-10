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

    if (!tableBody || !totalMedicines || !inStockCount || !lowStockCount || !outOfStockCount) {
        return;
    }


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

            const name = (row.dataset.displayName || row.dataset.name || "").toLowerCase();
            const category = (row.dataset.displayCategory || row.dataset.category || "").toLowerCase();
            const quantity = parseInt(
                row.dataset.quantity || 0
            );

            const stockStatus = getStockStatus(quantity);

            const matchSearch = name.includes(searchValue);

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
                        row.dataset.displayName || row.dataset.name;

                    const details =
                        "Médicament : " + name +
                        "\nCatégorie : " + (row.dataset.displayCategory || row.dataset.category) +
                        "\nPrix : " + row.dataset.price + " Ar" +
                        "\nStock : " + row.dataset.quantity +
                        "\nOrdonnance : " + row.dataset.prescription;

                    alert(
                        details
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

                    const name = row.dataset.displayName || row.dataset.name;
                    const category = row.dataset.displayCategory || row.dataset.category;
                    const price = prompt("Prix unitaire :", row.dataset.price || "0");
                    const quantity = prompt("Quantité en stock :", row.dataset.quantity);
                    const expirationDate = prompt("Date de péremption (AAAA-MM-JJ) :", row.dataset.expiration || "");
                    const supplierId = prompt("ID du fournisseur :", row.dataset.supplierId || "");

                    if (price === null || quantity === null) {
                        return;
                    }

                    const numericPrice = Number(String(price).replace(",", "."));
                    const numericQuantity = Number(quantity);

                    if (!Number.isFinite(numericPrice) || numericPrice < 0 || !Number.isInteger(numericQuantity) || numericQuantity < 0) {
                        if (window.showAppNotification) window.showAppNotification("Prix ou quantité invalide.", "error");
                        return;
                    }

                    fetch("/medicaments/" + row.dataset.id + "/modifier", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: name,
                            category: category,
                            price: numericPrice,
                            quantity: numericQuantity,
                            expiration_date: expirationDate,
                            supplier_id: supplierId,
                            description: row.dataset.description,
                            image_url: row.dataset.image,
                            needs_prescription: row.dataset.prescription
                        })
                    })
                        .then(function (response) {
                            return response.json().then(function (result) {
                                return { response, result };
                            });
                        })
                        .then(function (data) {
                            if (!data.response.ok || !data.result.success) {
                                if (window.showAppNotification) window.showAppNotification(data.result.message || "Modification impossible.", "error");
                                return;
                            }
                            if (window.showAppNotification) window.showAppNotification("Prix du médicament modifié avec succès.", "success");
                            window.setTimeout(() => window.location.reload(), 900);
                        })
                        .catch(function () {
                            if (window.showAppNotification) window.showAppNotification("Impossible de contacter le serveur.", "error");
                        });

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

                        fetch("/medicaments/" + row.dataset.id + "/supprimer", {
                            method: "POST"
                        })
                            .then(function (response) {
                                return response.json().then(function (result) {
                                    return { response, result };
                                });
                            })
                            .then(function (data) {
                                if (!data.response.ok || !data.result.success) {
                                    alert(data.result.message || "Suppression impossible.");
                                    return;
                                }
                                row.remove();
                                updateCounters();
                            })
                            .catch(function () {
                                alert("Impossible de contacter le serveur.");
                            });

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