(function () {
  "use strict";

  var CART_KEY = "fryCart";
  var SHIPPING_KEY = "fryShipping";
  var WHATSAPP_NUMBER = "34669765785"; // debe coincidir con lib/manifest.js
  var DEFAULT_SHIPPING = ""; // "" = todavía no ha elegido zona (obligatorio antes de pedir)

  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function getCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      /* almacenamiento no disponible: seguimos sin persistencia */
    }
    updateBadge();
  }

  function parsePrice(str) {
    var cleaned = String(str).replace(/[^\d,.-]/g, "").replace(",", ".");
    var n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }

  function formatPrice(num) {
    return num.toFixed(2).replace(".", ",") + "€";
  }

  function addToCart(name, priceStr) {
    var cart = getCart();
    var existing = cart.filter(function (i) { return i.name === name; })[0];
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name: name, price: parsePrice(priceStr), qty: 1 });
    }
    saveCart(cart);
    renderCartPage();
  }

  function removeFromCart(name) {
    var cart = getCart().filter(function (i) { return i.name !== name; });
    saveCart(cart);
    renderCartPage();
  }

  function updateQty(name, delta) {
    var cart = getCart();
    var item = cart.filter(function (i) { return i.name === name; })[0];
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(name);
      return;
    }
    saveCart(cart);
    renderCartPage();
  }

  function cartCount() {
    return getCart().reduce(function (sum, i) { return sum + i.qty; }, 0);
  }

  function cartTotal() {
    return getCart().reduce(function (sum, i) { return sum + i.qty * i.price; }, 0);
  }

  function getShippingValue() {
    try {
      return localStorage.getItem(SHIPPING_KEY) || DEFAULT_SHIPPING;
    } catch (e) {
      return DEFAULT_SHIPPING;
    }
  }

  function saveShippingValue(value) {
    try {
      localStorage.setItem(SHIPPING_KEY, value);
    } catch (e) {
      /* sin persistencia disponible */
    }
  }

  function parseShippingValue(value) {
    var parts = String(value).split("|");
    var zone = parts[0];
    var cost = parts[1] ? parseFloat(parts[1]) : null; // null = "fuera de zona, a consultar"
    return { zone: zone, cost: cost };
  }

  function updateBadge() {
    var count = cartCount();
    var badges = document.querySelectorAll("[data-cart-badge]");
    for (var i = 0; i < badges.length; i++) {
      badges[i].textContent = String(count);
      badges[i].style.display = count > 0 ? "flex" : "none";
    }
  }

  function bindAddButtons() {
    var buttons = document.querySelectorAll("[data-add-to-cart]");
    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        if (btn.dataset.bound) return;
        btn.dataset.bound = "1";
        btn.addEventListener("click", function () {
          addToCart(btn.dataset.name, btn.dataset.price);
          flashAdded(btn);
        });
      })(buttons[i]);
    }

    var variantButtons = document.querySelectorAll("[data-add-to-cart-variant]");
    for (var j = 0; j < variantButtons.length; j++) {
      (function (btn) {
        if (btn.dataset.bound) return;
        btn.dataset.bound = "1";
        btn.addEventListener("click", function () {
          var card = btn.closest(".menu-card-variant") || btn.parentElement;
          var select = card ? card.querySelector("[data-variant-select]") : null;
          var name = select ? select.value : btn.dataset.name;
          addToCart(name, btn.dataset.price);
          flashAdded(btn);
        });
      })(variantButtons[j]);
    }
  }

  function flashAdded(btn) {
    var original = btn.textContent;
    btn.textContent = "✓ Añadido";
    btn.classList.add("is-added");
    setTimeout(function () {
      btn.textContent = original;
      btn.classList.remove("is-added");
    }, 900);
  }

  function buildWhatsAppMessage() {
    var cart = getCart();
    if (!cart.length) return "Hola! Quisiera hacer un pedido en FRY.";
    var shipping = parseShippingValue(getShippingValue());
    var subtotal = cartTotal();

    var lines = ["Hola! Quisiera hacer este pedido:", ""];
    cart.forEach(function (i) {
      lines.push("- " + i.qty + "x " + i.name + " (" + formatPrice(i.price) + ") = " + formatPrice(i.price * i.qty));
    });
    lines.push("");
    lines.push("Zona de entrega: " + shipping.zone);
    if (shipping.cost === null) {
      lines.push("Envío: a consultar con el local (fuera del radio habitual)");
      lines.push("");
      lines.push("Subtotal: " + formatPrice(subtotal));
    } else {
      lines.push("Envío: " + formatPrice(shipping.cost));
      lines.push("");
      lines.push("Subtotal: " + formatPrice(subtotal));
      lines.push("Total: " + formatPrice(subtotal + shipping.cost));
    }
    return lines.join("\n");
  }

  function renderCartPage() {
    var container = document.querySelector("[data-cart-items]");
    if (!container) return; // no estamos en carrito.html, nada que pintar

    var totalEl = document.querySelector("[data-cart-total]");
    var subtotalEl = document.querySelector("[data-cart-subtotal]");
    var shippingCostEl = document.querySelector("[data-cart-shipping-cost]");
    var shippingHintEl = document.querySelector("[data-shipping-hint]");
    var shippingSelect = document.querySelector("[data-shipping-select]");
    var emptyEl = document.querySelector("[data-cart-empty]");
    var summaryEl = document.querySelector("[data-cart-summary]");
    var orderBtn = document.querySelector("[data-cart-order-btn]");
    var cart = getCart();

    if (!cart.length) {
      container.innerHTML = "";
      if (emptyEl) emptyEl.style.display = "block";
      if (summaryEl) summaryEl.style.display = "none";
      return;
    }

    if (emptyEl) emptyEl.style.display = "none";
    if (summaryEl) summaryEl.style.display = "block";

    container.innerHTML = cart.map(function (i) {
      var safeName = escHTML(i.name);
      var attrName = safeName.replace(/"/g, "&quot;");
      return (
        '<div class="cart-row">' +
          '<div class="cart-row-main">' +
            '<span class="cart-row-name">' + safeName + "</span>" +
            '<span class="cart-row-unit">' + formatPrice(i.price) + " / ud</span>" +
          "</div>" +
          '<div class="cart-row-qty">' +
            '<button type="button" data-qty-minus="' + attrName + '" aria-label="Quitar uno">−</button>' +
            '<span class="cart-row-qty-num">' + i.qty + "</span>" +
            '<button type="button" data-qty-plus="' + attrName + '" aria-label="Añadir uno">+</button>' +
          "</div>" +
          '<div class="cart-row-subtotal">' + formatPrice(i.price * i.qty) + "</div>" +
          '<button type="button" class="cart-row-remove" data-remove="' + attrName + '" aria-label="Eliminar del carrito">×</button>' +
        "</div>"
      );
    }).join("");

    var minusBtns = container.querySelectorAll("[data-qty-minus]");
    for (var m = 0; m < minusBtns.length; m++) {
      minusBtns[m].addEventListener("click", function () { updateQty(this.dataset.qtyMinus, -1); });
    }
    var plusBtns = container.querySelectorAll("[data-qty-plus]");
    for (var p = 0; p < plusBtns.length; p++) {
      plusBtns[p].addEventListener("click", function () { updateQty(this.dataset.qtyPlus, 1); });
    }
    var removeBtns = container.querySelectorAll("[data-remove]");
    for (var r = 0; r < removeBtns.length; r++) {
      removeBtns[r].addEventListener("click", function () { removeFromCart(this.dataset.remove); });
    }

    // --- zona de entrega, subtotal, envío y total ---
    if (shippingSelect) {
      shippingSelect.value = getShippingValue();
      if (!shippingSelect.dataset.bound) {
        shippingSelect.dataset.bound = "1";
        shippingSelect.addEventListener("change", function () {
          saveShippingValue(this.value);
          renderCartPage();
        });
      }
    }

    var shipping = parseShippingValue(getShippingValue());
    var subtotal = cartTotal();

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);

    if (shipping.zone === "") {
      // Todavía no ha elegido zona: obligatorio antes de poder pedir
      if (shippingCostEl) shippingCostEl.textContent = "—";
      if (shippingHintEl) shippingHintEl.style.display = "none";
      if (totalEl) totalEl.textContent = "Elige tu zona para ver el total";
      if (orderBtn) disableOrderBtn(orderBtn);
    } else if (shipping.cost === null) {
      if (shippingCostEl) shippingCostEl.textContent = "A consultar";
      if (shippingHintEl) shippingHintEl.style.display = "block";
      if (totalEl) totalEl.textContent = formatPrice(subtotal) + " + envío";
      if (orderBtn) enableOrderBtn(orderBtn);
    } else {
      if (shippingCostEl) shippingCostEl.textContent = formatPrice(shipping.cost);
      if (shippingHintEl) shippingHintEl.style.display = "none";
      if (totalEl) totalEl.textContent = formatPrice(subtotal + shipping.cost);
      if (orderBtn) enableOrderBtn(orderBtn);
    }

    if (orderBtn && shipping.zone !== "") {
      var msg = buildWhatsAppMessage();
      orderBtn.setAttribute("href", "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg));
    }
  }

  function disableOrderBtn(btn) {
    btn.classList.add("is-disabled");
    btn.setAttribute("aria-disabled", "true");
    btn.removeAttribute("href");
    if (!btn.dataset.guardBound) {
      btn.dataset.guardBound = "1";
      btn.addEventListener("click", function (e) {
        if (btn.classList.contains("is-disabled")) {
          e.preventDefault();
          var select = document.querySelector("[data-shipping-select]");
          if (select) {
            select.classList.add("is-required");
            select.focus();
            select.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      });
    }
  }

  function enableOrderBtn(btn) {
    btn.classList.remove("is-disabled");
    btn.removeAttribute("aria-disabled");
    var select = document.querySelector("[data-shipping-select]");
    if (select) select.classList.remove("is-required");
  }

  function boot() {
    bindAddButtons();
    updateBadge();
    renderCartPage();
    maybeShowUpsell();
  }

  // ---------------------------------------------------------------
  // Ventana emergente en el carrito
  // ---------------------------------------------------------------

  // Todo lo que ya es un menú/combo completo (con patatas y bebida incluidas).
  var MENU_ITEM_NAMES = [
    "Menú 2 Piezas", "Menú 2 Tiras", "Menú 3 Tiras", "Menú 4 Tiras",
    "Combo 2 Hamburguesas", "Menú Para 2", "Menú Para 3", "Familiar 8 Piezas",
    "Cubo Familiar de Tiras", "Mega Familiar", "Familiar 4 Hamburguesas",
    "Dúo Tiras + Pieza", "Fiesta Mixta"
  ];

  // Piezas sueltas que tienen un menú equivalente directo al que subir.
  var MENU_UPGRADES = {
    "Pechuga Entera": { menuName: "Menú 2 Piezas", menuPrice: 13.50 },
    "Ración 4 Tiras": { menuName: "Menú 4 Tiras", menuPrice: 8.50 }
  };

  var EXTRA_ADDONS = [
    { name: "CHEESE. FRY. (4 uds)", price: "3,90€", text: "Bolitas de queso fundente, 4 unidades." },
    { name: "CHEESE. FRY. (7 uds)", price: "5,90€", text: "Bolitas de queso fundente, 7 unidades." },
    { name: "Mazorca FRY.", price: "2,90€", text: "Mazorca bañada en mantequilla y sazón cajun." }
  ];

  function ensureModal() {
    var overlay = document.querySelector("[data-upsell-overlay]");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.className = "upsell-overlay";
    overlay.setAttribute("data-upsell-overlay", "");
    overlay.innerHTML =
      '<div class="upsell-box">' +
        '<button type="button" class="upsell-close" data-upsell-close aria-label="Cerrar">×</button>' +
        '<div data-upsell-content></div>' +
      "</div>";
    document.body.appendChild(overlay);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeUpsell();
    });
    overlay.querySelector("[data-upsell-close]").addEventListener("click", closeUpsell);

    return overlay;
  }

  function openUpsell(html) {
    var overlay = ensureModal();
    overlay.querySelector("[data-upsell-content]").innerHTML = html;
    overlay.classList.add("is-open");
    bindUpsellActions(overlay);
  }

  function closeUpsell() {
    var overlay = document.querySelector("[data-upsell-overlay]");
    if (overlay) overlay.classList.remove("is-open");
  }

  function bindUpsellActions(overlay) {
    var closeEls = overlay.querySelectorAll("[data-upsell-close]");
    for (var c = 0; c < closeEls.length; c++) {
      (function (el) {
        if (el.dataset.closeBound) return;
        el.dataset.closeBound = "1";
        el.addEventListener("click", function (e) {
          e.preventDefault();
          closeUpsell();
        });
      })(closeEls[c]);
    }

    var upgradeBtns = overlay.querySelectorAll("[data-upgrade-from]");
    for (var i = 0; i < upgradeBtns.length; i++) {
      (function (btn) {
        btn.addEventListener("click", function () {
          var fromName = btn.dataset.upgradeFrom;
          var toName = btn.dataset.upgradeTo;
          var toPrice = btn.dataset.upgradePrice;
          updateQty(fromName, -1); // quita 1 unidad de la pieza suelta
          addToCart(toName, toPrice); // añade 1 unidad del menú equivalente
          closeUpsell();
        });
      })(upgradeBtns[i]);
    }

    var addonBtns = overlay.querySelectorAll("[data-upsell-add]");
    for (var j = 0; j < addonBtns.length; j++) {
      (function (btn) {
        btn.addEventListener("click", function () {
          addToCart(btn.dataset.name, btn.dataset.price);
          flashAdded(btn);
        });
      })(addonBtns[j]);
    }
  }

  function maybeShowUpsell() {
    // solo tiene sentido en la página del carrito
    if (!document.querySelector("[data-cart-items]")) return;

    var cart = getCart();
    if (!cart.length) return;

    var hasMenu = cart.some(function (i) { return MENU_ITEM_NAMES.indexOf(i.name) !== -1; });

    if (hasMenu) {
      // Ya tienen un menú completo -> ofrecer extras con descuento
      var html =
        '<span class="eyebrow upsell-eyebrow">Completa tu pedido</span>' +
        '<h2 class="upsell-title">¿Añadimos algo más?</h2>' +
        EXTRA_ADDONS.map(function (a) {
          return (
            '<div class="upsell-item">' +
              '<p class="upsell-item-text">' + escHTML(a.text) + "</p>" +
              '<button type="button" class="upsell-btn" data-upsell-add data-name="' + escHTML(a.name) + '" data-price="' + escHTML(a.price) + '">+ Añadir por ' + escHTML(a.price) + "</button>" +
            "</div>"
          );
        }).join("") +
        '<a href="#" class="upsell-dismiss" data-upsell-close>No, gracias</a>';
      openUpsell(html);
      return;
    }

    // No tienen ningún menú -> ofrecer subir de pieza suelta a menú
    var upgradable = cart.filter(function (i) { return MENU_UPGRADES[i.name]; });
    if (!upgradable.length) return;

    var html2 =
      '<span class="eyebrow upsell-eyebrow">Hazlo menú</span>' +
      '<h2 class="upsell-title">Llévate el menú completo</h2>' +
      upgradable.map(function (i) {
        var up = MENU_UPGRADES[i.name];
        var diff = up.menuPrice - i.price;
        return (
          '<div class="upsell-item">' +
            '<p class="upsell-item-text">Tu <strong>' + escHTML(i.name) + "</strong> (" + formatPrice(i.price) + ") puede ser <strong>" + escHTML(up.menuName) + "</strong> (con patatas y bebida) por solo <span class=\"upsell-item-price\">+" + formatPrice(diff) + "</span> más.</p>" +
            '<button type="button" class="upsell-btn" data-upgrade-from="' + escHTML(i.name) + '" data-upgrade-to="' + escHTML(up.menuName) + '" data-upgrade-price="' + up.menuPrice + '">Convertir a menú</button>' +
          "</div>"
        );
      }).join("") +
      '<a href="#" class="upsell-dismiss" data-upsell-close>No, gracias</a>';
    openUpsell(html2);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
