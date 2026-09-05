(function () {
  "use strict";

  var CART_KEY = "fryCart";
  var SHIPPING_KEY = "fryShipping";
  var PAYMENT_KEY = "fryPayment";
  var SCHEDULE_TYPE_KEY = "fryScheduleType";
  var SCHEDULE_TIME_KEY = "fryScheduleTime";
  var DISCOUNT_KEY = "fryDiscountApplied";
  var NAME_KEY = "fryCustomerName";
  var STREET_KEY = "fryStreet";
  var FLOOR_KEY = "fryFloor";
  var ACCESS_NOTES_KEY = "fryAccessNotes";
  var HOW_FOUND_KEY = "fryHowFound";
  var LAST_ORDER_KEY = "fryLastOrder";
  var WHATSAPP_NUMBER = "34669765785"; // debe coincidir con lib/manifest.js
  var DEFAULT_SHIPPING = ""; // "" = todavía no ha elegido zona (obligatorio antes de pedir)
  var DEFAULT_PAYMENT = "Efectivo";

  var HOW_FOUND_OPTIONS = ["Instagram", "TikTok", "Boca a boca", "Vi el flyer", "Otro"];

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
    refreshAllQtyControls();
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

  // --- datos del cliente: nombre, dirección, notas, cómo nos conoció ---
  function getField(key) {
    try { return localStorage.getItem(key) || ""; } catch (e) { return ""; }
  }
  function saveField(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* sin persistencia */ }
  }

  // Recalcula si el botón de pedido debe estar activo (zona, nombre,
  // dirección, horario) sin tener que reconstruir toda la lista de
  // productos del carrito — se llama en cada pulsación de tecla.
  function refreshOrderButtonState() {
    renderCartPage();
  }

  function bindPersistedField(elementId, storageKey) {
    var el = document.getElementById(elementId);
    if (!el) return;
    if (!el.dataset.filled) {
      el.dataset.filled = "1";
      el.value = getField(storageKey);
    }
    if (!el.dataset.bound) {
      el.dataset.bound = "1";
      el.addEventListener("input", function () {
        saveField(storageKey, el.value);
        refreshOrderButtonState();
      });
    }
  }

  // --- repetir último pedido ---
  function saveLastOrder(cart) {
    try { localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(cart)); } catch (e) { /* sin persistencia */ }
  }
  function getLastOrder() {
    try {
      var raw = localStorage.getItem(LAST_ORDER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
  function repeatLastOrder() {
    var last = getLastOrder();
    if (!last || !last.length) return false;
    saveCart(last.map(function (i) { return { name: i.name, price: i.price, qty: i.qty }; }));
    renderCartPage();
    return true;
  }
  window.__fryRepeatLastOrder = repeatLastOrder;
  window.__fryHasLastOrder = function () { var l = getLastOrder(); return !!(l && l.length); };

  // --- horario de apertura ---
  var cachedHours = (typeof FRY_HOURS_DEFAULT !== "undefined") ? FRY_HOURS_DEFAULT : null;

  function refreshHoursFromFirebase() {
    if (!ensureFirebaseInitialized()) return;
    try {
      firebase.database().ref("hours").on("value", function (snapshot) {
        var val = snapshot.val();
        if (val) cachedHours = val;
        renderCartPage();
      });
    } catch (e) { /* usamos el horario por defecto */ }
  }

  function getEffectiveOrderDate() {
    var scheduleType = getScheduleType();
    if (scheduleType === "later" && getScheduleTime()) {
      var now = new Date();
      var parts = getScheduleTime().split(":");
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(parts[0], 10), parseInt(parts[1], 10));
      return d;
    }
    return new Date();
  }

  function isCurrentlyOpenForOrder() {
    if (!cachedHours || typeof fryIsWithinHours !== "function") return true; // sin datos de horario: no bloqueamos
    return fryIsWithinHours(getEffectiveOrderDate(), cachedHours);
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

  // ---------------------------------------------------------------
  // Control de cantidad tipo píldora ("+ Añadir" -> "− N +")
  // Se usa en cada producto de la carta y en la ventana emergente.
  // ---------------------------------------------------------------
  function qtyStepperHTML(qty) {
    return (
      '<div class="qty-stepper">' +
        '<button type="button" class="qty-stepper-btn" data-qty-dec aria-label="Quitar uno">−</button>' +
        '<span class="qty-stepper-num">' + qty + '</span>' +
        '<button type="button" class="qty-stepper-btn" data-qty-inc aria-label="Añadir uno">+</button>' +
      '</div>'
    );
  }

  function renderQtyControl(container) {
    var name = container.dataset.name;
    var priceStr = container.dataset.price;
    var cart = getCart();
    var item = cart.filter(function (i) { return i.name === name; })[0];
    var qty = item ? item.qty : 0;

    if (qty <= 0) {
      container.innerHTML = '<button type="button" class="menu-card-add" data-qty-add>+ Añadir</button>';
    } else {
      container.innerHTML = qtyStepperHTML(qty);
    }

    if (!container.dataset.bound) {
      container.dataset.bound = "1";
      container.addEventListener("click", function (e) {
        if (e.target.closest("[data-qty-add]") || e.target.closest("[data-qty-inc]")) {
          addToCart(name, priceStr);
        } else if (e.target.closest("[data-qty-dec]")) {
          updateQty(name, -1);
        }
      });
    }
  }

  // Variante con selector de sabor (Refrescos): la cantidad depende de
  // cuál esté elegido en el desplegable en cada momento.
  function renderVariantQtyControl(wrapper) {
    var select = wrapper.querySelector("[data-variant-select]");
    var container = wrapper.querySelector("[data-qty-control-variant]");
    if (!select || !container) return;

    function currentPriceStr() {
      var opt = select.options[select.selectedIndex];
      return (opt && opt.dataset.price) ? opt.dataset.price : container.dataset.price;
    }

    var cart = getCart();
    var item = cart.filter(function (i) { return i.name === select.value; })[0];
    var qty = item ? item.qty : 0;

    if (qty <= 0) {
      container.innerHTML = '<button type="button" class="menu-card-add" data-qty-add>+ Añadir</button>';
    } else {
      container.innerHTML = qtyStepperHTML(qty);
    }

    if (!container.dataset.bound) {
      container.dataset.bound = "1";
      container.addEventListener("click", function (e) {
        if (e.target.closest("[data-qty-add]") || e.target.closest("[data-qty-inc]")) {
          addToCart(select.value, currentPriceStr());
        } else if (e.target.closest("[data-qty-dec]")) {
          updateQty(select.value, -1);
        }
      });
    }
    if (!select.dataset.qtyBound) {
      select.dataset.qtyBound = "1";
      select.addEventListener("change", function () { renderVariantQtyControl(wrapper); });
    }
  }

  // Control de cantidad con elección de salsa integrada en la propia carta
  // (Piezas, Tiras, Hamburguesas, Combos Mixtos). Igual que el desplegable
  // de sabor de los refrescos, pero combinando "modo de salsa" + "sabor".
  function renderSauceVariantQtyControl(wrapper) {
    var modeSelect = wrapper.querySelector("[data-sauce-mode-select]");
    var flavorField = wrapper.querySelector("[data-sauce-flavor-field]");
    var flavorSelect = wrapper.querySelector("[data-sauce-flavor-select]");
    var container = wrapper.querySelector("[data-qty-control-sauce]");
    if (!modeSelect || !container) return;

    var baseName = container.dataset.baseName;
    var basePrice = parseFloat(container.dataset.basePrice);

    function current() {
      var mode = modeSelect.value;
      if (mode === "none") return { name: baseName, price: basePrice };
      var flavor = flavorSelect ? flavorSelect.value : SAUCE_FLAVORS[0];
      if (mode === "ontop") {
        return { name: baseName + " (salsa " + flavor + " por encima)", price: basePrice + 1.00 };
      }
      return { name: baseName + " (bañada en salsa " + flavor + ")", price: basePrice + 1.50 };
    }

    function render() {
      if (flavorField) flavorField.style.display = modeSelect.value === "none" ? "none" : "inline-block";
      var c = current();
      var cart = getCart();
      var item = cart.filter(function (i) { return i.name === c.name; })[0];
      var qty = item ? item.qty : 0;
      if (qty <= 0) {
        container.innerHTML = '<button type="button" class="menu-card-add" data-qty-add>+ Añadir</button>';
      } else {
        container.innerHTML = qtyStepperHTML(qty);
      }
    }

    render();

    if (!container.dataset.bound) {
      container.dataset.bound = "1";
      container.addEventListener("click", function (e) {
        var c = current();
        var priceStr = formatPrice(c.price);
        if (e.target.closest("[data-qty-add]") || e.target.closest("[data-qty-inc]")) {
          addToCart(c.name, priceStr);
        } else if (e.target.closest("[data-qty-dec]")) {
          updateQty(c.name, -1);
        }
      });
    }
    if (!modeSelect.dataset.bound) {
      modeSelect.dataset.bound = "1";
      modeSelect.addEventListener("change", render);
    }
    if (flavorSelect && !flavorSelect.dataset.bound) {
      flavorSelect.dataset.bound = "1";
      flavorSelect.addEventListener("change", render);
    }
  }

  function initQtyControls() {
    var containers = document.querySelectorAll("[data-qty-control]");
    for (var i = 0; i < containers.length; i++) renderQtyControl(containers[i]);

    var variantWrappers = document.querySelectorAll(".menu-card-variant");
    for (var j = 0; j < variantWrappers.length; j++) renderVariantQtyControl(variantWrappers[j]);

    var sauceWrappers = document.querySelectorAll(".menu-card-sauce-variant");
    for (var k = 0; k < sauceWrappers.length; k++) renderSauceVariantQtyControl(sauceWrappers[k]);
  }

  function refreshAllQtyControls() {
    var containers = document.querySelectorAll("[data-qty-control]");
    for (var i = 0; i < containers.length; i++) renderQtyControl(containers[i]);

    var variantWrappers = document.querySelectorAll(".menu-card-variant");
    for (var j = 0; j < variantWrappers.length; j++) renderVariantQtyControl(variantWrappers[j]);

    var sauceWrappers = document.querySelectorAll(".menu-card-sauce-variant");
    for (var k = 0; k < sauceWrappers.length; k++) renderSauceVariantQtyControl(sauceWrappers[k]);
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

    var name = getField(NAME_KEY);
    var street = getField(STREET_KEY);
    var floor = getField(FLOOR_KEY);
    var accessNotes = getField(ACCESS_NOTES_KEY);
    var orderNotes = document.getElementById("orderNotes") ? document.getElementById("orderNotes").value.trim() : "";
    var howFound = getField(HOW_FOUND_KEY);

    if (name) lines.push("Nombre: " + name);
    if (street) {
      var addressLine = "Dirección: " + street;
      if (floor) addressLine += ", " + floor;
      lines.push(addressLine);
    }
    if (accessNotes) lines.push("Notas de acceso: " + accessNotes);
    if (name || street || accessNotes) lines.push("");

    cart.forEach(function (i) {
      lines.push("- " + i.qty + "x " + i.name + " (" + formatPrice(i.price) + ") = " + formatPrice(i.price * i.qty));
    });
    lines.push("");

    if (orderNotes) {
      lines.push("Notas del pedido: " + orderNotes);
      lines.push("");
    }

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
    if (howFound) lines.push("Nos conoció por: " + howFound);
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
      customerName: getField(NAME_KEY),
      street: getField(STREET_KEY),
      floor: getField(FLOOR_KEY),
      accessNotes: getField(ACCESS_NOTES_KEY),
      orderNotes: document.getElementById("orderNotes") ? document.getElementById("orderNotes").value.trim() : "",
      howFound: getField(HOW_FOUND_KEY),
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

  function ensureFirebaseInitialized() {
    if (typeof firebase === "undefined" || typeof FRY_FIREBASE_CONFIG === "undefined") return false;
    if (!firebase.apps.length) {
      try {
        firebase.initializeApp(FRY_FIREBASE_CONFIG);
      } catch (e) {
        return false;
      }
    }
    return true;
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
    if (!ensureFirebaseInitialized()) {
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

    // --- nombre, dirección y notas del cliente (se guardan para la próxima visita) ---
    bindPersistedField("customerName", NAME_KEY);
    bindPersistedField("streetAddress", STREET_KEY);
    bindPersistedField("floorDoor", FLOOR_KEY);
    bindPersistedField("accessNotes", ACCESS_NOTES_KEY);

    var howFoundSelect = document.getElementById("howFound");
    if (howFoundSelect) {
      if (!howFoundSelect.dataset.optionsBuilt) {
        howFoundSelect.dataset.optionsBuilt = "1";
        HOW_FOUND_OPTIONS.forEach(function (opt) {
          var o = document.createElement("option");
          o.value = opt; o.textContent = opt;
          howFoundSelect.appendChild(o);
        });
      }
      howFoundSelect.value = getField(HOW_FOUND_KEY);
      if (!howFoundSelect.dataset.bound) {
        howFoundSelect.dataset.bound = "1";
        howFoundSelect.addEventListener("change", function () {
          saveField(HOW_FOUND_KEY, this.value);
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

    var blockReason = getOrderBlockReason(shipping);

    if (shipping.zone === "") {
      if (shippingCostEl) shippingCostEl.textContent = "—";
      if (shippingHintEl) shippingHintEl.style.display = "none";
    } else if (shipping.cost === null) {
      if (shippingCostEl) shippingCostEl.textContent = "A consultar";
      if (shippingHintEl) shippingHintEl.style.display = "block";
    } else {
      if (shippingCostEl) shippingCostEl.textContent = formatPrice(shipping.cost);
      if (shippingHintEl) shippingHintEl.style.display = "none";
    }

    if (blockReason === "zone") {
      if (totalEl) totalEl.textContent = "Elige tu zona para ver el total";
    } else if (shipping.cost === null) {
      if (totalEl) totalEl.textContent = formatPrice(subtotalConDescuento) + " + envío";
    } else {
      if (totalEl) totalEl.textContent = formatPrice(subtotalConDescuento + shipping.cost);
    }

    if (orderBtn) {
      if (blockReason) disableOrderBtn(orderBtn);
      else enableOrderBtn(orderBtn);
    }

    var blockMsgEl = document.querySelector("[data-order-block-msg]");
    if (blockMsgEl) {
      if (blockReason === "contact") {
        blockMsgEl.textContent = "Necesitamos tu nombre y tu dirección para poder enviarte el pedido.";
        blockMsgEl.style.display = "block";
      } else if (blockReason === "hours") {
        var hoursText = (typeof fryTodayHoursText === "function" && cachedHours) ? fryTodayHoursText(new Date(), cachedHours) : "";
        blockMsgEl.textContent = "Ahora mismo estamos cerrados. " + hoursText + " — puedes programar tu pedido para más tarde.";
        blockMsgEl.style.display = "block";
      } else {
        blockMsgEl.style.display = "none";
      }
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

          // Abrimos la pestaña YA, de forma síncrona con el clic — así el
          // navegador nunca la bloquea. OJO: sin "noopener" aquí, porque
          // necesitamos quedarnos con la referencia para poder redirigirla
          // en cuanto tengamos la URL final (con "noopener" el navegador
          // no nos deja guardar esa referencia).
          var newTab = window.open("", "_blank");

          orderBtn.classList.add("is-sending");
          var originalText = orderBtn.textContent;
          orderBtn.textContent = "Preparando pedido…";

          saveOrderAndProceed(function (code) {
            var msg = buildWhatsAppMessage(code);
            var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
            saveLastOrder(getCart());
            orderBtn.classList.remove("is-sending");
            orderBtn.textContent = originalText;
            if (newTab && !newTab.closed) {
              newTab.location.href = url;
            } else {
              // el navegador bloqueó incluso la pestaña en blanco: probamos
              // igualmente, por si el usuario tiene que darle a "permitir".
              window.open(url, "_blank", "noopener");
            }
          });
        });
      }
    }
  }

  function getOrderBlockReason(shipping) {
    if (shipping.zone === "") return "zone";
    var name = getField(NAME_KEY);
    var street = getField(STREET_KEY);
    if (!name.trim() || !street.trim()) return "contact";
    if (!isCurrentlyOpenForOrder()) return "hours";
    return null;
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
          var shipping = parseShippingValue(getShippingValue());
          var reason = getOrderBlockReason(shipping);
          var target = null;
          if (reason === "zone") {
            target = document.querySelector("[data-shipping-select]");
            if (target) target.classList.add("is-required");
          } else if (reason === "contact") {
            var name = getField(NAME_KEY);
            target = document.getElementById(!name.trim() ? "customerName" : "streetAddress");
          }
          if (target) {
            target.focus();
            target.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            var msgEl = document.querySelector("[data-order-block-msg]");
            if (msgEl) msgEl.scrollIntoView({ behavior: "smooth", block: "center" });
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
    initQtyControls();
    updateBadge();
    renderCartPage();
    maybeShowUpsell();
    refreshHoursFromFirebase();
    initRepeatOrderButton();
  }

  function initRepeatOrderButton() {
    var btn = document.getElementById("repeatOrderBtn");
    if (!btn) return;
    if (window.__fryHasLastOrder()) {
      btn.style.display = "inline-flex";
      btn.addEventListener("click", function () {
        if (repeatLastOrder()) {
          window.location.href = "carrito.html";
        }
      });
    }
  }

  // ---------------------------------------------------------------
  // Ventana emergente en el carrito
  // ---------------------------------------------------------------

  // Todo lo que ya es un menú/combo completo (con patatas y bebida incluidas).
  // Con el modelo à la carte, el único que queda es Fiesta Mixta.
  var MENU_ITEM_NAMES = ["Fiesta Mixta"];

  // Ya no hay piezas sueltas con un "menú equivalente" al que subir —
  // con el modelo à la carte, el cliente se monta el menú él mismo.
  var MENU_UPGRADES = {};

  var EXTRA_ADDONS = [
    { name: "CHEESE. FRY. (4 uds)", price: "3,90€", text: "Bolitas de queso fundente, 4 unidades." },
    { name: "CHEESE. FRY. (7 uds)", price: "5,90€", text: "Bolitas de queso fundente, 7 unidades." },
    { name: "Mazorca FRY.", price: "2,90€", text: "Mazorca bañada en mantequilla y sazón cajun." }
  ];

  // Productos a los que se les puede añadir salsa por encima o bañarlos.
  // El precio es el de la carta (sin ningún extra) — a partir de aquí se
  // suma +1,00€ (por encima) o +1,50€ (bañada), SIEMPRE por unidad/combo,
  // nunca un extra fijo repartido entre varias unidades.
  var SAUCE_ELIGIBLE_PRICES = {
    "Ración 2 Piezas": 11.50,
    "Ración 4 Tiras": 7.50,
    "Hamburguesa FRY.": 8.00,
    "Fiesta Mixta": 56.90
  };

  var SAUCE_FLAVORS = ["Bourbon", "Sweet Chilli", "Habanero Mango"];
  var SAUCE_ONTOP_EXTRA = 1.00;
  var SAUCE_BATHED_EXTRA = 1.50;

  // Detecta si un nombre de carrito ya lleva salsa añadida, y con qué sabor.
  // "Pechuga Entera (salsa Bourbon por encima)" / "Pechuga Entera (bañada en salsa Bourbon)"
  function parseSaucedName(name) {
    var mOntop = name.match(/^(.+) \(salsa (.+) por encima\)$/);
    if (mOntop) return { base: mOntop[1], flavor: mOntop[2], state: "ontop" };
    var mBathed = name.match(/^(.+) \(bañada en salsa (.+)\)$/);
    if (mBathed) return { base: mBathed[1], flavor: mBathed[2], state: "bathed" };
    return { base: name, flavor: null, state: "none" };
  }

  function convertCartItemSauce(oldName, newName, newPrice, qty) {
    var cart = getCart();
    cart = cart.filter(function (i) { return i.name !== oldName; });
    var existing = cart.filter(function (i) { return i.name === newName; })[0];
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ name: newName, price: newPrice, qty: qty });
    }
    saveCart(cart);
    renderCartPage();
  }

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
    initQtyControls();
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
        if (btn.dataset.actionBound) return;
        btn.dataset.actionBound = "1";
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
        if (btn.dataset.actionBound) return;
        btn.dataset.actionBound = "1";
        btn.addEventListener("click", function () {
          addToCart(btn.dataset.name, btn.dataset.price);
          flashAdded(btn);
        });
      })(addonBtns[j]);
    }

    // Añadir salsa por encima o bañar (desde estado "sin salsa")
    var sauceAddBtns = overlay.querySelectorAll("[data-sauce-add]");
    for (var s = 0; s < sauceAddBtns.length; s++) {
      (function (btn) {
        if (btn.dataset.actionBound) return;
        btn.dataset.actionBound = "1";
        btn.addEventListener("click", function () {
          var itemEl = btn.closest(".upsell-item");
          var baseName = btn.dataset.sauceAdd;
          var mode = btn.dataset.sauceMode; // "ontop" | "bathed"
          var qty = parseInt(btn.dataset.sauceQty, 10);
          var basePrice = SAUCE_ELIGIBLE_PRICES[baseName];
          var selectEl = overlay.querySelector('[data-sauce-select-for="' + baseName + '"]');
          var flavor = selectEl ? selectEl.value : SAUCE_FLAVORS[0];

          var newName, newPrice, confirmMsg;
          if (mode === "ontop") {
            newName = baseName + " (salsa " + flavor + " por encima)";
            newPrice = basePrice + SAUCE_ONTOP_EXTRA;
            confirmMsg = "Añadida salsa " + flavor + " por encima a " + baseName;
          } else {
            newName = baseName + " (bañada en salsa " + flavor + ")";
            newPrice = basePrice + SAUCE_BATHED_EXTRA;
            confirmMsg = baseName + " bañada en salsa " + flavor;
          }
          convertCartItemSauce(baseName, newName, newPrice, qty);

          if (itemEl) {
            showSauceConfirmation(itemEl, confirmMsg);
            settleSauceItem(itemEl, newName);
          }
        });
      })(sauceAddBtns[s]);
    }

    // Subir de "salsa por encima" a "bañada" (+0,50€/ud más)
    var sauceUpgradeBtns = overlay.querySelectorAll("[data-sauce-upgrade]");
    for (var u = 0; u < sauceUpgradeBtns.length; u++) {
      (function (btn) {
        if (btn.dataset.actionBound) return;
        btn.dataset.actionBound = "1";
        btn.addEventListener("click", function () {
          var itemEl = btn.closest(".upsell-item");
          var oldName = btn.dataset.sauceUpgrade;
          var baseName = btn.dataset.sauceBase;
          var flavor = btn.dataset.sauceFlavor;
          var qty = parseInt(btn.dataset.sauceQty, 10);
          var basePrice = SAUCE_ELIGIBLE_PRICES[baseName];
          var newName = baseName + " (bañada en salsa " + flavor + ")";
          var newPrice = basePrice + SAUCE_BATHED_EXTRA;
          convertCartItemSauce(oldName, newName, newPrice, qty);

          if (itemEl) {
            showSauceConfirmation(itemEl, baseName + " bañada en salsa " + flavor);
            settleSauceItem(itemEl, newName);
          }
        });
      })(sauceUpgradeBtns[u]);
    }
  }

  function buildSauceItemBlockHtml(item) {
    var parsed = parseSaucedName(item.name);
    if (!SAUCE_ELIGIBLE_PRICES.hasOwnProperty(parsed.base)) return "";
    if (parsed.state === "bathed") return ""; // ya al máximo, no mostramos nada

    if (parsed.state === "none") {
      var flavorOptions = SAUCE_FLAVORS.map(function (f) {
        return '<option value="' + f + '">' + escHTML(f) + '</option>';
      }).join("");
      return (
        '<div class="upsell-item">' +
          '<p class="upsell-item-text"><strong>' + escHTML(item.name) + '</strong> (x' + item.qty + ') — ¿le añadimos salsa?</p>' +
          '<select class="upsell-sauce-select" data-sauce-select-for="' + item.name + '">' + flavorOptions + '</select>' +
          '<div class="upsell-sauce-btn-row">' +
            '<button type="button" class="upsell-btn upsell-btn-small" data-sauce-add="' + item.name + '" data-sauce-mode="ontop" data-sauce-qty="' + item.qty + '">Salsa por encima (+' + formatPrice(SAUCE_ONTOP_EXTRA) + '/ud)</button>' +
            '<button type="button" class="upsell-btn upsell-btn-small" data-sauce-add="' + item.name + '" data-sauce-mode="bathed" data-sauce-qty="' + item.qty + '">Bañarla en salsa (+' + formatPrice(SAUCE_BATHED_EXTRA) + '/ud)</button>' +
          '</div>' +
        '</div>'
      );
    } else if (parsed.state === "ontop") {
      return (
        '<div class="upsell-item">' +
          '<p class="upsell-item-text"><strong>' + escHTML(parsed.base) + '</strong> — salsa ' + escHTML(parsed.flavor) + ' por encima (x' + item.qty + ')</p>' +
          '<button type="button" class="upsell-btn upsell-btn-small" data-sauce-upgrade="' + item.name + '" data-sauce-base="' + parsed.base + '" data-sauce-flavor="' + parsed.flavor + '" data-sauce-qty="' + item.qty + '">Bañarla también (+' + formatPrice(SAUCE_BATHED_EXTRA - SAUCE_ONTOP_EXTRA) + '/ud más)</button>' +
        '</div>'
      );
    }
    return "";
  }

  function buildSauceItemsHtml(cart) {
    return cart.map(buildSauceItemBlockHtml).join("");
  }

  // Muestra una confirmación clara (sin botones) en el sitio exacto donde
  // estaba el botón pulsado, para que un segundo clic accidental no caiga
  // sobre una acción distinta que haya aparecido en ese mismo hueco.
  function showSauceConfirmation(itemEl, message) {
    itemEl.innerHTML = '<p class="upsell-item-text upsell-item-confirmed">✓ ' + escHTML(message) + '</p>';
  }

  // Tras la confirmación, sustituye SOLO ese bloque por su siguiente estado
  // real (o lo elimina si ya no hay nada más que ofrecer ahí).
  function settleSauceItem(itemEl, newName) {
    setTimeout(function () {
      if (!itemEl.parentNode) return; // el usuario ya cerró el popup
      var cart = getCart();
      var updated = cart.filter(function (i) { return i.name === newName; })[0];
      var nextHtml = updated ? buildSauceItemBlockHtml(updated) : "";
      if (!nextHtml) {
        itemEl.remove();
      } else {
        itemEl.outerHTML = nextHtml;
        var overlay = document.querySelector("[data-upsell-overlay]");
        if (overlay) bindUpsellActions(overlay);
      }
    }, 1100);
  }


  function maybeShowUpsell() {
    // solo tiene sentido en la página del carrito
    if (!document.querySelector("[data-cart-items]")) return;

    var cart = getCart();
    if (!cart.length) return;

    // Con el modelo à la carte ya no hay "menús" que completar primero —
    // siempre que haya algo en el carrito, ofrecemos salsa/bañado para
    // lo que aplique, y los complementos de siempre.
    var sauceHtml = buildSauceItemsHtml(cart);
    var html =
      '<span class="eyebrow upsell-eyebrow">Completa tu pedido</span>' +
      '<h2 class="upsell-title">¿Añadimos algo más?</h2>' +
      EXTRA_ADDONS.map(function (a) {
        return (
          '<div class="upsell-item">' +
            '<p class="upsell-item-text">' + escHTML(a.text) + " (" + escHTML(a.price) + ")</p>" +
            '<div class="qty-control" data-qty-control data-name="' + escHTML(a.name) + '" data-price="' + escHTML(a.price) + '"></div>' +
          "</div>"
        );
      }).join("") +
      (sauceHtml ? '<p class="upsell-subhead">¿Le añadimos salsa a algo?</p>' + sauceHtml : "") +
      '<a href="#" class="upsell-dismiss" data-upsell-close>No, gracias</a>';
    openUpsell(html);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
