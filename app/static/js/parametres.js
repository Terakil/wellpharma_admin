
document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       NAVIGATION DES PARAMÈTRES
    ===================================================== */

    const navButtons = document.querySelectorAll(".settings-nav");
    const sections = document.querySelectorAll(".settings-section");

    navButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const target = button.dataset.section;

            navButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            sections.forEach(function (section) {
                section.classList.remove("active");
            });

            button.classList.add("active");

            const selectedSection = document.getElementById(target);

            if (selectedSection) {
                selectedSection.classList.add("active");
            }

        });

    });


    /* =====================================================
       AFFICHER / MASQUER MOT DE PASSE
    ===================================================== */

    const passwordButtons =
        document.querySelectorAll(".password-toggle");

    passwordButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const targetId = button.dataset.target;

            const input = document.getElementById(targetId);

            const icon = button.querySelector("i");

            if (!input || !icon) {
                return;
            }

            if (input.type === "password") {

                input.type = "text";

                icon.classList.remove("bi-eye");
                icon.classList.add("bi-eye-slash");

            } else {

                input.type = "password";

                icon.classList.remove("bi-eye-slash");
                icon.classList.add("bi-eye");

            }

        });

    });


    /* =====================================================
       COMPTE ADMINISTRATEUR
    ===================================================== */

    


    /* =====================================================
       MODIFIER LA PHOTO
    ===================================================== */

    const changePhotoBtn =
        document.getElementById("changePhotoBtn");

    if (changePhotoBtn) {

        changePhotoBtn.addEventListener("click", function () {

            showNotification(
                "La modification de la photo sera disponible prochainement.",
                "info"
            );

        });

    }


    /* =====================================================
       MOT DE PASSE
    ===================================================== */

    const changePasswordBtn =
        document.getElementById("changePasswordBtn");

    if (changePasswordBtn) {

        changePasswordBtn.addEventListener("click", function () {

            const oldPassword =
                document.getElementById("currentPassword").value;

            const newPassword =
                document.getElementById("newPassword").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;


            if (!oldPassword || !newPassword || !confirmPassword) {

                showNotification(
                    "Veuillez remplir tous les champs.",
                    "error"
                );

                return;

            }


            if (newPassword.length < 8) {

                showNotification(
                    "Le nouveau mot de passe doit contenir au moins 8 caractères.",
                    "error"
                );

                return;

            }


            if (newPassword !== confirmPassword) {

                showNotification(
                    "Les mots de passe ne correspondent pas.",
                    "error"
                );

                return;

            }


            showNotification(
                "Mot de passe modifié avec succès.",
                "success"
            );


            document.getElementById("currentPassword").value = "";
            document.getElementById("newPassword").value = "";
            document.getElementById("confirmPassword").value = "";

        });

    }


    /* =====================================================
       DÉCONNEXION DE TOUS LES APPAREILS
    ===================================================== */

    const logoutAllBtn =
        document.getElementById("logoutAllBtn");

    if (logoutAllBtn) {

        logoutAllBtn.addEventListener("click", function () {

            const confirmed = confirm(
                "Voulez-vous déconnecter toutes les autres sessions ?"
            );

            if (confirmed) {

                showNotification(
                    "Les autres sessions ont été déconnectées.",
                    "success"
                );

            }

        });

    }


    /* =====================================================
       SAUVEGARDE
    ===================================================== */

    const backupBtn =
        document.getElementById("backupBtn");

    if (backupBtn) {

        backupBtn.addEventListener("click", function () {

            showNotification(
                "La sauvegarde sera disponible après connexion à la base de données.",
                "info"
            );

        });

    }


    /* =====================================================
       RESTAURATION
    ===================================================== */

    const restoreBtn =
        document.getElementById("restoreBtn");

    if (restoreBtn) {

        restoreBtn.addEventListener("click", function () {

            showNotification(
                "La restauration sera disponible après connexion à la base de données.",
                "info"
            );

        });

    }


    /* =====================================================
       ENREGISTREMENT DES PARAMÈTRES
    ===================================================== */

    const saveButtons = [

        "savePharmacyBtn",
        "saveManagementBtn",
        "saveNotificationsBtn",
        "saveDocumentsBtn",
        "savePaymentsBtn"

    ];


    saveButtons.forEach(function (buttonId) {

        const button =
            document.getElementById(buttonId);

        if (button) {

            button.addEventListener("click", function () {

                showNotification(
                    "Paramètres enregistrés avec succès.",
                    "success"
                );

            });

        }

    });


    /* =====================================================
       NOTIFICATION
    ===================================================== */

    function showNotification(message, type) {

        const notification =
            document.createElement("div");

        notification.className =
            "settings-notification";


        let icon = "bi-info-circle";


        if (type === "success") {
            icon = "bi-check-circle";
        }


        if (type === "error") {
            icon = "bi-exclamation-circle";
        }


        notification.innerHTML = `
            <i class="bi ${icon}"></i>
            <span>${message}</span>
        `;


        document.body.appendChild(notification);


        setTimeout(function () {

            notification.classList.add("show");

        }, 10);


        setTimeout(function () {

            notification.classList.remove("show");

            setTimeout(function () {

                notification.remove();

            }, 300);

        }, 3000);

    }

});

