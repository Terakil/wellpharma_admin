document.addEventListener("DOMContentLoaded", function () {

const searchInput = document.getElementById("orderSearch");
const statusFilter = document.getElementById("statusFilter");
const dateFilter = document.getElementById("dateFilter");
const orderCount = document.getElementById("orderCount");
const emptyOrder = document.getElementById("emptyOrder");

const rows = Array.from(
    document.querySelectorAll(".order-row")
);


/* =====================================================
   FILTRAGE DES COMMANDES
===================================================== */

function filterOrders() {

    const search = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const status = statusFilter
        ? statusFilter.value.toLowerCase()
        : "";

    const date = dateFilter
        ? dateFilter.value.toLowerCase()
        : "";

    let visible = 0;


    rows.forEach(function (row) {

        const searchable = row.dataset.search || row.dataset.client || "";
        const rowStatus = row.dataset.status || "";
        const rowDate = row.dataset.dateKey || "";

        const matchSearch =
            searchable.includes(search);

        const matchStatus =
            status === "" ||
            rowStatus === status;

        const orderDate = rowDate ? new Date(`${rowDate}T00:00:00`) : null;
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay() + 1);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const matchDate = !date || (
            orderDate && (
                (date === "today" && orderDate.getTime() === startOfToday.getTime()) ||
                (date === "week" && orderDate >= startOfWeek && orderDate <= startOfToday) ||
                (date === "month" && orderDate >= startOfMonth && orderDate <= startOfToday)
            )
        );


        if (
            matchSearch &&
            matchStatus &&
            matchDate
        ) {

            row.style.display = "";
            visible++;

        } else {

            row.style.display = "none";

        }

    });


    if (emptyOrder) {

        emptyOrder.style.display =
            visible === 0
                ? "table-row"
                : "none";

    }


    if (orderCount) {

        orderCount.textContent =
            visible + " commande" +
            (visible > 1 ? "s" : "");

    }

}


/* =====================================================
   RECHERCHE
===================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterOrders
    );

}


/* =====================================================
   FILTRE STATUT
===================================================== */

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        filterOrders
    );

}


/* =====================================================
   FILTRE DATE
===================================================== */

if (dateFilter) {

    dateFilter.addEventListener(
        "change",
        filterOrders
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

                const row =
                    button.closest(".order-row");

                if (!row) {
                    return;
                }

                const id =
                    row.querySelector("td")
                        .textContent
                        .trim();

                const client =
                    row.dataset.client || "";


                alert(
                    "Détails de la commande\n\n" +
                    "Commande : " + id +
                    "\nClient : " + client
                );

            }
        );

    });


/* =====================================================
   BOUTON SUPPRIMER
===================================================== */

document
    .querySelectorAll(".action-btn.delete")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const row =
                    button.closest(".order-row");

                if (!row) {
                    return;
                }

                const id =
                    row.querySelector("td")
                        .textContent
                        .trim();


                const confirmation =
                    confirm(
                        "Voulez-vous supprimer " +
                        id +
                        " ?"
                    );


                if (confirmation) {

                    row.remove();

                    const index =
                        rows.indexOf(row);

                    if (index !== -1) {
                        rows.splice(index, 1);
                    }

                    filterOrders();

                }

            }
        );

    });


/* =====================================================
   NOUVELLE COMMANDE
===================================================== */

const saveOrder =
    document.getElementById("saveOrder");


if (saveOrder) {

    saveOrder.addEventListener(
        "click",
        function () {

            const client =
                document
                    .getElementById("newClient")
                    .value
                    .trim();

            const medicine = document.getElementById("newMedicine").value;

            const quantity =
                document
                    .getElementById("newQuantity")
                    .value;

            const amount =
                document
                    .getElementById("newAmount")
                    .value;


            if (
                client === "" ||
                medicine === "" ||
                quantity === "" ||
                amount === ""
            ) {

                alert(
                    "Veuillez remplir tous les champs."
                );

                return;

            }


            fetch("/commandes/ajouter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client: client,
                    medicine_id: medicine,
                    quantity: quantity,
                    amount: amount
                })
            })
                .then(function (response) { return response.json().then(function (result) { return { response, result }; }); })
                .then(function (data) {
                    if (!data.response.ok || !data.result.success) {
                        alert(data.result.message || "La commande n'a pas pu être enregistrée.");
                        return;
                    }
                    window.location.reload();
                })
                .catch(function () {
                    alert("Impossible de contacter le serveur.");
                });


            const modalElement =
                document.getElementById(
                    "addOrderModal"
                );


            if (modalElement) {

                const modal =
                    bootstrap.Modal.getInstance(
                        modalElement
                    );

                if (modal) {
                    modal.hide();
                }

            }

        }
    );

}


/* =====================================================
   INITIALISATION
===================================================== */

filterOrders();

});
