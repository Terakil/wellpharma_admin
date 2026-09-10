document.addEventListener("DOMContentLoaded", function () {


const reportType = document.getElementById("reportType");
const reportPeriod = document.getElementById("reportPeriod");
const customDates = document.getElementById("customDates");

const createReportBtn = document.getElementById("createReportBtn");
const generateReportBtn = document.getElementById("generateReportBtn");

const reportSearch = document.getElementById("reportSearch");
const typeFilter = document.getElementById("typeFilter");

const rows = document.querySelectorAll(".report-row");
const emptyReports = document.getElementById("emptyReports");


/* =====================================================
   PERIOD CUSTOM
===================================================== */

reportPeriod.addEventListener("change", function () {

    if (this.value === "custom") {
        customDates.classList.add("active");
    } else {
        customDates.classList.remove("active");
    }

});


/* =====================================================
   FILTER REPORTS
===================================================== */

function filterReports() {

    const search = reportSearch.value.toLowerCase().trim();
    const type = typeFilter.value.toLowerCase();

    let visible = 0;

    rows.forEach(function (row) {

        const name = row.dataset.search || row.dataset.name || "";
        const rowType = row.dataset.type || "";

        const matchesSearch = name.includes(search);
        const matchesType = !type || rowType === type;

        if (matchesSearch && matchesType) {

            row.style.display = "";
            visible++;

        } else {

            row.style.display = "none";

        }

    });


    if (visible === 0) {
        emptyReports.style.display = "table-row";
    } else {
        emptyReports.style.display = "none";
    }

}


reportSearch.addEventListener("input", filterReports);
typeFilter.addEventListener("change", filterReports);


/* =====================================================
   GENERATE REPORT
===================================================== */

function generateReport() {

    if (!reportType.value) {

        alert("Veuillez sélectionner un type de rapport.");
        return;

    }


    if (reportPeriod.value === "custom") {

        const start = document.getElementById("startDate").value;
        const end = document.getElementById("endDate").value;


        if (!start || !end) {

            alert("Veuillez sélectionner les deux dates.");
            return;

        }


        if (start > end) {

            alert(
                "La date de début doit être avant la date de fin."
            );

            return;

        }

    }


    fetch("/rapports/ajouter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type: reportType.value,
            period: reportPeriod.value
        })
    })
        .then(function (response) {
            return response.json().then(function (result) {
                return { response, result };
            });
        })
        .then(function (data) {
            if (!data.response.ok || !data.result.success) {
                alert(data.result.message || "Le rapport n'a pas pu être créé.");
                return;
            }
            window.location.reload();
        })
        .catch(function () {
            alert("Impossible de contacter le serveur.");
        });

}


createReportBtn.addEventListener(
    "click",
    generateReport
);


/* =====================================================
   GENERATE BUTTON
===================================================== */

generateReportBtn.addEventListener("click", function () {

    document.querySelector(".generation-box").scrollIntoView({
        behavior: "smooth"
    });

});


/* =====================================================
   VIEW
===================================================== */

document
    .querySelectorAll(".action-btn.view")
    .forEach(function (button) {

        button.addEventListener("click", function () {

            alert(
                "Ouverture du rapport #" +
                this.dataset.id
            );

        });

    });


/* =====================================================
   DOWNLOAD
===================================================== */

document
    .querySelectorAll(".action-btn.download")
    .forEach(function (button) {

        button.addEventListener("click", function () {

            alert(
                "Téléchargement du rapport #" +
                this.dataset.id
            );

        });

    });


/* =====================================================
   DELETE
===================================================== */

document
    .querySelectorAll(".action-btn.delete")
    .forEach(function (button) {

        button.addEventListener("click", function () {

            const confirmation = confirm(
                "Voulez-vous vraiment supprimer ce rapport ?"
            );


            if (confirmation) {

                this.closest(".report-row").remove();

                filterReports();

            }

        });

    });


});
