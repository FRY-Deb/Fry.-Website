(function () {
  "use strict";

  var STORAGE_KEY = "fry_cookie_consent";

  function alreadyAccepted() {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; }
    catch (e) { return false; }
  }

  function markAccepted() {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
  }

  function build() {
    var bar = document.createElement("div");
    bar.className = "cookie-banner";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Aviso de cookies");
    bar.innerHTML =
      '<p class="cookie-banner-text">Usamos cookies propias para que el carrito funcione y para comprobar la disponibilidad de productos. No usamos cookies de publicidad. Más información en nuestra ' +
      '<a href="privacidad.html">Política de Privacidad y Cookies</a>.</p>' +
      '<div class="cookie-banner-actions">' +
      '<button type="button" class="btn btn-primary cookie-banner-accept">Aceptar</button>' +
      "</div>";
    document.body.appendChild(bar);

    bar.querySelector(".cookie-banner-accept").addEventListener("click", function () {
      markAccepted();
      bar.classList.add("is-hidden");
      setTimeout(function () { bar.remove(); }, 300);
    });

    requestAnimationFrame(function () { bar.classList.add("is-visible"); });
  }

  function init() {
    if (alreadyAccepted()) return;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", build);
    } else {
      build();
    }
  }

  init();
})();
