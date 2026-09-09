document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       DATE
    ===================================================== */

    const dateElement = document.getElementById("currentDate");

    if (dateElement) {

        const today = new Date();

        const options = {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        };

        let date = today.toLocaleDateString("fr-FR", options);

        date = date.charAt(0).toUpperCase() + date.slice(1);

        dateElement.textContent = date;
    }


    /* =====================================================
       MENU MOBILE
    ===================================================== */

    const menuButton = document.getElementById("menuButton");

    const sidebar = document.querySelector(".sidebar");


    if (menuButton && sidebar) {

        menuButton.addEventListener("click", function () {

            sidebar.classList.toggle("open");

        });

    }


    /* =====================================================
       DECONNEXION
    ===================================================== */

    const logoutLink = document.getElementById("logoutLink");

    const logoutModal = document.getElementById("logoutModal");

    const logoutCancel = document.getElementById("logoutCancel");


    if (logoutLink && logoutModal) {

        logoutLink.addEventListener("click", function (event) {

            event.preventDefault();

            logoutModal.classList.add("show");

        });

    }


    if (logoutCancel && logoutModal) {

        logoutCancel.addEventListener("click", function () {

            logoutModal.classList.remove("show");

        });

    }


    if (logoutModal) {

        logoutModal.addEventListener("click", function (event) {

            if (event.target === logoutModal) {

                logoutModal.classList.remove("show");

            }

        });

    }

});