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
const medicineSelect = document.getElementById("newMedicine");
const quantityInput = document.getElementById("newQuantity");
const amountInput = document.getElementById("newAmount");

function updateOrderAmount() {
    const option = medicineSelect ? medicineSelect.selectedOptions[0] : null;
    const price = option ? Number(option.dataset.price || 0) : 0;
    const quantity = quantityInput ? Number(quantityInput.value || 0) : 0;
    if (amountInput) amountInput.value = price * quantity || "";
}

if (medicineSelect) medicineSelect.addEventListener("change", updateOrderAmount);
if (quantityInput) quantityInput.addEventListener("input", updateOrderAmount);


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

            if (
                client === "" ||
                medicine === "" ||
                quantity === ""
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
                    quantity: quantity
                })
            })
                .then(function (response) { return response.json().then(function (result) { return { response, result }; }); })
                .then(function (data) {
                    if (!data.response.ok || !data.result.success) {
                        alert(data.result.message || "La commande n'a pas pu être enregistrée.");
                        return;
                    }
                    const message = "Commande enregistrée avec succès. Montant : " + data.result.amount + " Ar";
                    if (window.showAppNotification) window.showAppNotification(message, "success");
                    window.setTimeout(() => window.location.reload(), 900);
                })
                .catch(function () {
                    if (window.showAppNotification) window.showAppNotification("Impossible de contacter le serveur.", "error");
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
