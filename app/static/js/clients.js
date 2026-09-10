document.addEventListener("DOMContentLoaded", function () {

const searchInput = document.getElementById("clientSearch");
const statusFilter = document.getElementById("statusFilter");
const rows = Array.from(document.querySelectorAll(".client-row"));
const emptyClient = document.getElementById("emptyClient");
const clientCount = document.getElementById("clientCount");

function filterClients() {

    const search = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const status = statusFilter
        ? statusFilter.value.toLowerCase()
        : "";

    let visible = 0;

    rows.forEach(function (row) {

        const name = row.dataset.name || "";
        const email = row.dataset.email || "";
        const clientStatus = row.dataset.status || "";

        const matchesSearch =
            name.includes(search) ||
            email.includes(search);

        const matchesStatus =
            status === "" ||
            clientStatus === status;

        if (matchesSearch && matchesStatus) {
            row.style.display = "";
            visible++;
        } else {
            row.style.display = "none";
        }
    });

    if (emptyClient) {
        emptyClient.style.display =
            visible === 0 ? "table-row" : "none";
    }

    if (clientCount) {
        clientCount.textContent =
            visible +
            " client" +
            (visible > 1 ? "s" : "");
    }
}


/* =================================================
   RECHERCHE
================================================= */

if (searchInput) {
    searchInput.addEventListener(
        "input",
        filterClients
    );
}


/* =================================================
   FILTRE STATUT
================================================= */

if (statusFilter) {
    statusFilter.addEventListener(
        "change",
        filterClients
    );
}


/* =================================================
   BOUTON AJOUTER
================================================= */

const addClientBtn =
    document.getElementById("addClientBtn");

if (addClientBtn) {
    addClientBtn.addEventListener(
        "click",
        function () {

            alert(
                "Le formulaire d'ajout de client sera disponible prochainement."
            );

        }
    );
}


/* =================================================
   BOUTON VOIR
================================================= */

document.querySelectorAll(".action-btn.view")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const row =
                    button.closest(".client-row");

                if (!row) return;

                const name =
                    row.dataset.name || "";

                alert(
                    "Consultation du client : " +
                    name
                );

            }
        );

    });


/* =================================================
   BOUTON MODIFIER
================================================= */

document.querySelectorAll(".action-btn.edit")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const row =
                    button.closest(".client-row");

                if (!row) return;

                const name =
                    row.dataset.name || "";

                alert(
                    "Modification du client : " +
                    name
                );

            }
        );

    });


/* =================================================
   BOUTON SUPPRIMER
================================================= */

document.querySelectorAll(".action-btn.delete")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const confirmation =
                    confirm(
                        "Voulez-vous vraiment supprimer ce client ?"
                    );

                if (!confirmation) {
                    return;
                }

                const row =
                    button.closest(".client-row");

                if (!row) {
                    return;
                }

                row.remove();

                const index =
                    rows.indexOf(row);

                if (index !== -1) {
                    rows.splice(index, 1);
                }

                filterClients();
            }
        );

    });


/* =================================================
   VOIR TOUT
================================================= */

const viewAll =
    document.getElementById("viewAllClients");

if (viewAll) {
    viewAll.addEventListener(
        "click",
        function () {

            if (searchInput) {
                searchInput.value = "";
            }

            if (statusFilter) {
                statusFilter.value = "";
            }

            filterClients();
        }
    );
}


/* =================================================
   INITIALISATION
================================================= */

filterClients();

});
