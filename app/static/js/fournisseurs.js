document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("supplierSearch");
    const statusFilter = document.getElementById("statusFilter");
    const sortFilter = document.getElementById("sortFilter");

    const tableBody = document.getElementById("supplierTableBody");
    const countElement = document.getElementById("supplierCount");
    const emptyRow = document.getElementById("emptySupplier");

    if (!searchInput || !statusFilter || !sortFilter || !tableBody || !countElement || !emptyRow) {
        return;
    }


    /* =====================================================
       FILTRER LES FOURNISSEURS
    ===================================================== */

    function filterSuppliers() {

        const search = searchInput.value.toLowerCase().trim();
        const status = statusFilter.value.toLowerCase().trim();

        const rows = Array.from(
            tableBody.querySelectorAll(".supplier-row")
        );

        let visibleRows = [];

        rows.forEach(function (row) {

            const name = row.dataset.search || row.dataset.name || "";
            const rowStatus = row.dataset.status || "";

            const matchesSearch = name.includes(search);

            let matchesStatus = true;

            if (status !== "") {

                if (status === "actif") {
                    matchesStatus = rowStatus === "actif";
                }

                else if (status === "attente") {
                    matchesStatus = rowStatus.includes("attente");
                }

                else if (status === "retard") {
                    matchesStatus = rowStatus.includes("retard");
                }
            }


            if (matchesSearch && matchesStatus) {

                row.style.display = "";
                visibleRows.push(row);

            } else {

                row.style.display = "none";
            }

        });


        countElement.textContent =
            visibleRows.length + " fournisseur(s)";


        if (visibleRows.length === 0) {
            emptyRow.style.display = "";
        } else {
            emptyRow.style.display = "none";
        }

    }


    /* =====================================================
       TRI
    ===================================================== */

    function sortSuppliers() {

        const value = sortFilter.value;

        const rows = Array.from(
            tableBody.querySelectorAll(".supplier-row")
        );


        if (value === "name") {

            rows.sort(function (a, b) {

                return a.dataset.name.localeCompare(
                    b.dataset.name
                );

            });

        }


        else if (value === "arrival") {

            rows.sort(function (a, b) {

                return parseFrenchDate(a.dataset.arrival) -
                    parseFrenchDate(b.dataset.arrival);

            });

        }


        else if (value === "delay") {

            rows.sort(function (a, b) {

                return Number(a.dataset.delay) -
                    Number(b.dataset.delay);

            });

        }


        rows.forEach(function (row) {
            tableBody.appendChild(row);
        });


        filterSuppliers();

    }


    function parseFrenchDate(value) {

        const parts = (value || "").split("/");

        if (parts.length === 3) {
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }

        return new Date(0);
    }


    /* =====================================================
       RECHERCHE
    ===================================================== */

    searchInput.addEventListener(
        "input",
        filterSuppliers
    );


    /* =====================================================
       FILTRE STATUT
    ===================================================== */

    statusFilter.addEventListener(
        "change",
        filterSuppliers
    );


    /* =====================================================
       TRI
    ===================================================== */

    sortFilter.addEventListener(
        "change",
        sortSuppliers
    );


    /* =====================================================
       BOUTON AJOUTER
    ===================================================== */

    const addButton = document.getElementById("addSupplierBtn");

    const supplierModalElement =
        document.getElementById("supplierModal");


    if (addButton && supplierModalElement) {

        const supplierModal =
            new bootstrap.Modal(
                supplierModalElement
            );

        addButton.addEventListener(
            "click",
            function () {

                supplierModal.show();

            }
        );

    }


    /* =====================================================
       BOUTON VOIR
    ===================================================== */

    document
        .querySelectorAll(".action-btn.view")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id = this.dataset.id;

                    alert(
                        "Consultation du fournisseur #" + id
                    );

                }
            );

        });


    /* =====================================================
       BOUTON MODIFIER
    ===================================================== */

    document
        .querySelectorAll(".action-btn.edit")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {
                    const row = this.closest(".supplier-row");
                    const id = this.dataset.id;
                    if (!row) return;

                    const name = prompt("Nom du fournisseur :", row.dataset.displayName || row.dataset.name || "");
                    if (name === null) return;
                    const city = prompt("Ville :", row.dataset.city || "");
                    if (city === null) return;
                    const contact = prompt("Personne de contact :", row.dataset.contact || "");
                    if (contact === null) return;
                    const phone = prompt("Téléphone :", row.dataset.phone || "");
                    if (phone === null) return;
                    const medicines = prompt("Médicaments fournis :", row.dataset.medicines || "");
                    if (medicines === null) return;
                    const lastOrder = prompt("Dernière commande (AAAA-MM-JJ) :", row.dataset.lastOrder || "");
                    if (lastOrder === null) return;
                    const arrivalDate = prompt("Date d'arrivée (AAAA-MM-JJ) :", row.dataset.arrivalDate || "");
                    if (arrivalDate === null) return;
                    const delay = prompt("Délai de livraison :", row.dataset.delay || "0");
                    if (delay === null) return;
                    const amount = prompt("Montant :", row.dataset.amount || "0");
                    if (amount === null) return;

                    fetch("/fournisseurs/" + id + "/modifier", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name,
                            city,
                            contact,
                            phone,
                            medicines,
                            last_order: lastOrder,
                            arrival_date: arrivalDate,
                            delivery_delay: delay,
                            amount
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
                            if (window.showAppNotification) window.showAppNotification(data.result.message, "success");
                            window.setTimeout(() => window.location.reload(), 900);
                        })
                        .catch(function () {
                            if (window.showAppNotification) window.showAppNotification("Impossible de contacter le serveur.", "error");
                        });

                }
            );

        });


    /* =====================================================
       INITIALISATION
    ===================================================== */

    filterSuppliers();

});