(function () {
  "use strict";

  // Debe coincidir EXACTAMENTE con la función usada en admin.html,
  // para que las claves generadas sean las mismas en los dos sitios.
  function sanitizeKey(name) {
    return String(name).replace(/[.#$\[\]\/]/g, "_");
  }

  function markSoldOut(card) {
    if (card.classList.contains("is-soldout")) return;
    card.classList.add("is-soldout");

    var nameEl = card.querySelector(".menu-card-name");
    if (nameEl && !nameEl.querySelector(".menu-card-soldout-badge")) {
      var badge = document.createElement("span");
      badge.className = "menu-card-soldout-badge";
      badge.textContent = "AGOTADO";
      nameEl.appendChild(badge);
    }

    var addBtn = card.querySelector("[data-add-to-cart]");
    if (addBtn) { addBtn.disabled = true; addBtn.textContent = "Agotado"; }

    var variantBtn = card.querySelector("[data-add-to-cart-variant]");
    if (variantBtn) { variantBtn.disabled = true; variantBtn.textContent = "Agotado"; }

    var select = card.querySelector("[data-variant-select]");
    if (select) select.disabled = true;
  }

  function markAvailable(card) {
    if (!card.classList.contains("is-soldout")) return;
    card.classList.remove("is-soldout");

    var badge = card.querySelector(".menu-card-soldout-badge");
    if (badge) badge.remove();

    var addBtn = card.querySelector("[data-add-to-cart]");
    if (addBtn) { addBtn.disabled = false; addBtn.textContent = "+ Añadir"; }

    var variantBtn = card.querySelector("[data-add-to-cart-variant]");
    if (variantBtn) { variantBtn.disabled = false; variantBtn.textContent = "+ Añadir"; }

    var select = card.querySelector("[data-variant-select]");
    if (select) select.disabled = false;
  }

  function applySoldOutState(soldOutMap) {
    var cards = document.querySelectorAll(".menu-card");
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var nameEl = card.querySelector(".menu-card-name");
      if (!nameEl) continue;
      // el badge puede haberse insertado antes: cogemos solo el texto del nombre real
      var name = nameEl.childNodes[0] ? nameEl.childNodes[0].textContent.trim() : nameEl.textContent.trim();
      var key = sanitizeKey(name);
      if (soldOutMap && soldOutMap[key] === true) {
        markSoldOut(card);
      } else {
        markAvailable(card);
      }
    }
  }

  function init() {
    if (typeof firebase === "undefined" || typeof FRY_FIREBASE_CONFIG === "undefined") return;
    if (!document.querySelector(".menu-card")) return; // no hay productos en esta página

    if (!firebase.apps.length) {
      firebase.initializeApp(FRY_FIREBASE_CONFIG);
    }

    var db = firebase.database();
    db.ref("soldOut").on("value", function (snapshot) {
      applySoldOutState(snapshot.val() || {});
    }, function (error) {
      console.warn("No se pudo comprobar el estado de productos agotados:", error);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
