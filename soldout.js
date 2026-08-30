(function () {
  "use strict";

  // Debe coincidir EXACTAMENTE con la función usada en admin.html.
  function sanitizeKey(name) {
    return String(name).replace(/[.#$\[\]\/]/g, "_");
  }

  function isAvailable(name, stockMap, soldOutMap) {
    var req = window.FRY_STOCK_REQUIREMENTS ? window.FRY_STOCK_REQUIREMENTS[name] : null;

    if (req) {
      // Producto cuya disponibilidad se calcula sola a partir del stock compartido.
      for (var key in req) {
        var have = (stockMap && typeof stockMap[key] === "number") ? stockMap[key] : 0;
        if (have < req[key]) return false;
      }
      return true;
    }

    // Producto simple: se controla a mano con el interruptor del panel.
    var soldOutKey = sanitizeKey(name);
    return !(soldOutMap && soldOutMap[soldOutKey] === true);
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

  var lastStock = {};
  var lastSoldOut = {};

  function applyAll() {
    var cards = document.querySelectorAll(".menu-card");
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var nameEl = card.querySelector(".menu-card-name");
      if (!nameEl) continue;
      // el badge puede haberse insertado antes: cogemos solo el texto del nombre real
      var name = nameEl.childNodes[0] ? nameEl.childNodes[0].textContent.trim() : nameEl.textContent.trim();

      if (isAvailable(name, lastStock, lastSoldOut)) {
        markAvailable(card);
      } else {
        markSoldOut(card);
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

    db.ref("stock").on("value", function (snapshot) {
      lastStock = snapshot.val() || {};
      applyAll();
    }, function (error) {
      console.warn("No se pudo comprobar el stock:", error);
    });

    db.ref("soldOut").on("value", function (snapshot) {
      lastSoldOut = snapshot.val() || {};
      applyAll();
    }, function (error) {
      console.warn("No se pudo comprobar el estado de agotados:", error);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
