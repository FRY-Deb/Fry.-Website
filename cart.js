(function () {
  "use strict";

  var CART_KEY = "fryCart";
  var SHIPPING_KEY = "fryShipping";
  var PAYMENT_KEY = "fryPayment";
  var SCHEDULE_TYPE_KEY = "fryScheduleType";
  var SCHEDULE_TIME_KEY = "fryScheduleTime";
  var DISCOUNT_KEY = "fryDiscountApplied";
  var WHATSAPP_NUMBER = "34669765785"; // debe coincidir con lib/manifest.js
  var DEFAULT_SHIPPING = ""; // "" = todavía no ha elegido zona (obligatorio antes de pedir)
  var DEFAULT_PAYMENT = "Efectivo";

  var DISCOUNT_CODE = "FRY.OPENING";
  var DISCOUNT_RATE = 0.10; // 10% sobre el subtotal de productos (no sobre el envío)

  // Tiempo estimado de entrega por zona: cocina (15 min) + reparto real,
  // con un mínimo de 30 min incluso en la zona más cercana.
  var TIME_ESTIMATES = {
    "Villaverde": "30-40 min",
    "Puente de Vallecas": "35-45 min",
    "Usera": "35-45 min",
    "Getafe": "35-45 min",
    "Villa de Vallecas": "35-45 min",
    "Arganzuela": "40-50 min",
    "Carabanchel": "40-50 min",
    "Leganés": "40-50 min",
    "Moratalaz": "40-50 min",
    "Fuera de estas zonas": "A confirmar por WhatsApp"
  };

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

  function getPaymentMethod() {
    try {
      return localStorage.getItem(PAYMENT_KEY) || DEFAULT_PAYMENT;
    } catch (e) {
      return DEFAULT_PAYMENT;
    }
  }

  function savePaymentMethod(value) {
    try { localStorage.setItem(PAYMENT_KEY, value); } catch (e) { /* sin persistencia */ }
  }

  function getScheduleType() {
    try {
      return localStorage.getItem(SCHEDULE_TYPE_KEY) || "now";
    } catch (e) {
      return "now";
    }
  }

  function saveScheduleType(value) {
    try { localStorage.setItem(SCHEDULE_TYPE_KEY, value); } catch (e) { /* sin persistencia */ }
  }

  function getScheduleTime() {
    try {
      return localStorage.getItem(SCHEDULE_TIME_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function saveScheduleTime(value) {
    try { localStorage.setItem(SCHEDULE_TIME_KEY, value); } catch (e) { /* sin persistencia */ }
  }

  function getDiscountApplied() {
    try {
      return localStorage.getItem(DISCOUNT_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function saveDiscountApplied(applied) {
    try { localStorage.setItem(DISCOUNT_KEY, applied ? "1" : "0"); } catch (e) { /* sin persistencia */ }
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

  function buildWhatsAppMessage(orderCode) {
    var cart = getCart();
    if (!cart.length) return "Hola! Quisiera hacer un pedido en FRY.";
    var shipping = parseShippingValue(getShippingValue());
    var subtotal = cartTotal();
    var discountApplied = getDiscountApplied();
    var discountAmount = discountApplied ? subtotal * DISCOUNT_RATE : 0;
    var subtotalConDescuento = subtotal - discountAmount;

    var lines = ["Hola! Quisiera hacer este pedido:", ""];
    if (orderCode) {
      lines.push("Pedido #" + orderCode);
      lines.push("");
    }
    cart.forEach(function (i) {
      lines.push("- " + i.qty + "x " + i.name + " (" + formatPrice(i.price) + ") = " + formatPrice(i.price * i.qty));
    });
    lines.push("");

    var scheduleType = getScheduleType();
    if (scheduleType === "later" && getScheduleTime()) {
      lines.push("Hora del pedido: programado para las " + getScheduleTime());
    } else {
      lines.push("Hora del pedido: lo antes posible");
    }
    lines.push("Método de pago: " + getPaymentMethod());
    lines.push("Zona de entrega: " + shipping.zone);
    if (shipping.zone !== "" && TIME_ESTIMATES[shipping.zone]) {
      lines.push("Tiempo estimado: " + TIME_ESTIMATES[shipping.zone]);
    }
    lines.push("");

    lines.push("Subtotal: " + formatPrice(subtotal));
    if (discountApplied) {
      lines.push("Descuento (" + DISCOUNT_CODE + ", -" + Math.round(DISCOUNT_RATE * 100) + "%): -" + formatPrice(discountAmount));
    }

    if (shipping.cost === null) {
      lines.push("Envío: a consultar con el local (fuera del radio habitual)");
      lines.push("");
      lines.push("Total (sin envío): " + formatPrice(subtotalConDescuento));
    } else {
      lines.push("Envío: " + formatPrice(shipping.cost));
      lines.push("");
      lines.push("Total: " + formatPrice(subtotalConDescuento + shipping.cost));
    }
    return lines.join("\n");
  }

  // ---------------------------------------------------------------
  // Guardar el pedido en Firebase antes de abrir WhatsApp, para
  // poder comprobar después que el precio que llega por WhatsApp
  // no se ha tocado (el cliente puede editar el texto antes de
  // enviarlo — esto da un código de referencia con el precio real).
  // ---------------------------------------------------------------
  function buildOrderData() {
    var cart = getCart();
    var shipping = parseShippingValue(getShippingValue());
    var subtotal = cartTotal();
    var discountApplied = getDiscountApplied();
    var discountAmount = discountApplied ? subtotal * DISCOUNT_RATE : 0;
    var total = shipping.cost === null ? null : (subtotal - discountAmount + shipping.cost);

    return {
      items: cart.map(function (i) { return { name: i.name, qty: i.qty, price: i.price }; }),
      subtotal: round2(subtotal),
      discountApplied: discountApplied,
      discountAmount: round2(discountAmount),
      shippingZone: shipping.zone,
      shippingCost: shipping.cost === null ? null : round2(shipping.cost),
      total: total === null ? null : round2(total),
      paymentMethod: getPaymentMethod(),
      scheduleType: getScheduleType(),
      scheduleTime: getScheduleTime(),
      timestamp: (typeof firebase !== "undefined" && firebase.database && firebase.database.ServerValue)
        ? firebase.database.ServerValue.TIMESTAMP
        : Date.now()
    };
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function saveOrderAndProceed(callback) {
    var finished = false;
    function done(code) {
      if (finished) return;
      finished = true;
      callback(code);
    }

    // Si Firebase no está disponible (sin conexión, bloqueado, etc.)
    // no bloqueamos al cliente: seguimos sin código de verificación.
    if (typeof firebase === "undefined" || !firebase.apps || !firebase.apps.length) {
      done(null);
      return;
    }

    // Nunca esperamos más de 3s a Firebase — el pedido tiene que poder
    // enviarse igualmente aunque la base de datos vaya lenta.
    var timeout = setTimeout(function () { done(null); }, 3000);

    try {
      var ref = firebase.database().ref("orders").push();
      ref.set(buildOrderData()).then(function () {
        clearTimeout(timeout);
        var code = ref.key.slice(-6).toUpperCase();
        done(code);
      }).catch(function () {
        clearTimeout(timeout);
        done(null);
      });
    } catch (e) {
      clearTimeout(timeout);
      done(null);
    }
  }

  function renderCartPage() {
    var container = document.querySelector("[data-cart-items]");
    if (!container) return; // no estamos en carrito.html, nada que pintar

    var totalEl = document.querySelector("[data-cart-total]");
    var subtotalEl = document.querySelector("[data-cart-subtotal]");
    var discountRowEl = document.querySelector("[data-discount-row]");
    var discountAmountEl = document.querySelector("[data-cart-discount]");
    var shippingCostEl = document.querySelector("[data-cart-shipping-cost]");
    var shippingHintEl = document.querySelector("[data-shipping-hint]");
    var shippingSelect = document.querySelector("[data-shipping-select]");
    var timeEstimateEl = document.querySelector("[data-time-estimate]");
    var paymentSelect = document.querySelector("[data-payment-select]");
    var discountInput = document.querySelector("[data-discount-input]");
    var discountBtn = document.querySelector("[data-discount-apply]");
    var discountMsgEl = document.querySelector("[data-discount-msg]");
    var scheduleRadios = document.querySelectorAll("[data-schedule-radio]");
    var scheduleTimeInput = document.querySelector("[data-schedule-time]");
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

    // --- zona de entrega ---
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

    // --- tiempo estimado (depende de la zona) ---
    var shipping = parseShippingValue(getShippingValue());
    if (timeEstimateEl) {
      if (shipping.zone === "") {
        timeEstimateEl.textContent = "Elige tu zona para verlo";
      } else {
        timeEstimateEl.textContent = TIME_ESTIMATES[shipping.zone] || "30-40 min";
      }
    }

    // --- horario del pedido ---
    var savedScheduleType = getScheduleType();
    for (var s = 0; s < scheduleRadios.length; s++) {
      scheduleRadios[s].checked = scheduleRadios[s].value === savedScheduleType;
      if (!scheduleRadios[s].dataset.bound) {
        scheduleRadios[s].dataset.bound = "1";
        scheduleRadios[s].addEventListener("change", function () {
          saveScheduleType(this.value);
          if (scheduleTimeInput) scheduleTimeInput.style.display = this.value === "later" ? "block" : "none";
        });
      }
    }
    if (scheduleTimeInput) {
      scheduleTimeInput.style.display = savedScheduleType === "later" ? "block" : "none";
      scheduleTimeInput.value = getScheduleTime();
      if (!scheduleTimeInput.dataset.bound) {
        scheduleTimeInput.dataset.bound = "1";
        scheduleTimeInput.addEventListener("change", function () {
          saveScheduleTime(this.value);
        });
      }
    }

    // --- método de pago ---
    if (paymentSelect) {
      paymentSelect.value = getPaymentMethod();
      if (!paymentSelect.dataset.bound) {
        paymentSelect.dataset.bound = "1";
        paymentSelect.addEventListener("change", function () {
          savePaymentMethod(this.value);
        });
      }
    }

    // --- código de descuento ---
    var discountApplied = getDiscountApplied();
    if (discountApplied && discountInput && !discountInput.value) {
      discountInput.value = DISCOUNT_CODE;
    }
    if (discountBtn && !discountBtn.dataset.bound) {
      discountBtn.dataset.bound = "1";
      discountBtn.addEventListener("click", function () {
        var entered = (discountInput.value || "").trim().toUpperCase();
        if (entered === DISCOUNT_CODE) {
          saveDiscountApplied(true);
          if (discountMsgEl) {
            discountMsgEl.textContent = "¡Código aplicado! " + Math.round(DISCOUNT_RATE * 100) + "% de descuento.";
            discountMsgEl.className = "cart-discount-msg is-ok";
          }
        } else {
          saveDiscountApplied(false);
          if (discountMsgEl) {
            discountMsgEl.textContent = "Código no válido.";
            discountMsgEl.className = "cart-discount-msg is-error";
          }
        }
        renderCartPage();
      });
    }

    // --- subtotal, descuento, envío y total ---
    var subtotal = cartTotal();
    var discountAmount = discountApplied ? subtotal * DISCOUNT_RATE : 0;
    var subtotalConDescuento = subtotal - discountAmount;

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (discountRowEl) discountRowEl.style.display = discountApplied ? "flex" : "none";
    if (discountAmountEl) discountAmountEl.textContent = "-" + formatPrice(discountAmount);

    if (shipping.zone === "") {
      // Todavía no ha elegido zona: obligatorio antes de poder pedir
      if (shippingCostEl) shippingCostEl.textContent = "—";
      if (shippingHintEl) shippingHintEl.style.display = "none";
      if (totalEl) totalEl.textContent = "Elige tu zona para ver el total";
      if (orderBtn) disableOrderBtn(orderBtn);
    } else if (shipping.cost === null) {
      if (shippingCostEl) shippingCostEl.textContent = "A consultar";
      if (shippingHintEl) shippingHintEl.style.display = "block";
      if (totalEl) totalEl.textContent = formatPrice(subtotalConDescuento) + " + envío";
      if (orderBtn) enableOrderBtn(orderBtn);
    } else {
      if (shippingCostEl) shippingCostEl.textContent = formatPrice(shipping.cost);
      if (shippingHintEl) shippingHintEl.style.display = "none";
      if (totalEl) totalEl.textContent = formatPrice(subtotalConDescuento + shipping.cost);
      if (orderBtn) enableOrderBtn(orderBtn);
    }

    if (orderBtn && shipping.zone !== "") {
      // Guardamos un href "de reserva" sin código, por si algo falla en
      // el proceso de guardado — el pedido nunca debe quedarse bloqueado.
      var fallbackMsg = buildWhatsAppMessage(null);
      orderBtn.setAttribute("href", "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(fallbackMsg));

      if (!orderBtn.dataset.clickBound) {
        orderBtn.dataset.clickBound = "1";
        orderBtn.addEventListener("click", function (e) {
          if (orderBtn.classList.contains("is-disabled")) return; // el guardia de zona ya lo gestiona
          e.preventDefault();
          orderBtn.classList.add("is-sending");
          var originalText = orderBtn.textContent;
          orderBtn.textContent = "Preparando pedido…";

          saveOrderAndProceed(function (code) {
            var msg = buildWhatsAppMessage(code);
            var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
            orderBtn.classList.remove("is-sending");
            orderBtn.textContent = originalText;
            window.open(url, "_blank", "noopener");
          });
        });
      }
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
