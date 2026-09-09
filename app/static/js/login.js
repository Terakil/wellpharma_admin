
document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       AFFICHER / MASQUER LE MOT DE PASSE
    ===================================================== */

    const passwordInput =
        document.getElementById("password");

    const passwordToggle =
        document.getElementById("passwordToggle");


    if (passwordInput && passwordToggle) {

        passwordToggle.addEventListener("click", function () {

            const icon =
                passwordToggle.querySelector("i");


            if (passwordInput.type === "password") {

                passwordInput.type = "text";

                icon.classList.remove("bi-eye");
                icon.classList.add("bi-eye-slash");

            } else {

                passwordInput.type = "password";

                icon.classList.remove("bi-eye-slash");
                icon.classList.add("bi-eye");

            }

        });

    }

});

