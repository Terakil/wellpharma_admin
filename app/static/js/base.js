window.showAppNotification = function (message, type = "success") {
    const notification = document.createElement("div");
    notification.className = "app-notification " + type;
    const icon = type === "success" ? "bi-check-circle" : type === "error" ? "bi-exclamation-circle" : "bi-info-circle";
    notification.innerHTML = `<i class="bi ${icon}"></i><span></span>`;
    notification.querySelector("span").textContent = message;
    document.body.appendChild(notification);
    requestAnimationFrame(() => notification.classList.add("show"));
    window.setTimeout(() => {
        notification.classList.remove("show");
        window.setTimeout(() => notification.remove(), 250);
    }, 3000);
};

document.addEventListener("DOMContentLoaded", function () {

    document.querySelectorAll(".list-toggle").forEach(function (button) {
        const target = document.getElementById(button.dataset.listTarget);
        if (!target) {
            return;
        }

        const selector = button.dataset.itemSelector || "tr";
        const items = Array.from(target.querySelectorAll(selector));
        if (items.length <= 5) {
            button.style.display = "none";
            return;
        }

        items.slice(5).forEach(function (item) {
            item.classList.add("list-item-hidden");
        });

        button.addEventListener("click", function () {
            const expanded = button.dataset.expanded === "true";
            items.slice(5).forEach(function (item) {
                item.classList.toggle("list-item-hidden", expanded);
            });
            button.dataset.expanded = String(!expanded);
            button.textContent = expanded ? "Voir tout →" : "Voir moins ↑";
        });
    });

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