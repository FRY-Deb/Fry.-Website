// Ofertas/códigos de descuento disponibles en la web.
// "active" NO se define aquí: se activa/desactiva en vivo desde el panel
// de admin (Firebase, ref "offers/<código>"), para poder encender y apagar
// tantas ofertas como haga falta sin tocar código.
var FRY_OFFERS = {
  "FRY.OPENING": {
    label: "FRY.OPENING — 10% en todo el pedido",
    scope: "subtotal",
    rate: 0.10
  },
  "SALSA50": {
    label: "SALSA50 — 50% en tarrinas grandes de Salsa FRY y Ranch FRY",
    scope: "items",
    rate: 0.50,
    // Debe coincidir EXACTAMENTE con el nombre que queda guardado en el
    // carrito para esos productos (carta.html / salsas.html).
    items: ["Tarrina de Salsa FRY.", "Salsa Ranch FRY — Tarrina 200g"]
  },
  "PATATAZO": {
    label: "PATATAZO — patatas pequeñas gratis en pedidos de más de 18€ (miércoles y jueves)",
    scope: "freeitem",
    minSubtotal: 18,
    days: [3, 4], // 0 = domingo ... 3 = miércoles, 4 = jueves
    freeItemName: "Patatas Fritas — Pequeña (regalo PATATAZO)"
  }
};

// Día de la semana (0-6) en hora de Madrid, da igual la zona del navegador.
function FRY_madridWeekday() {
  try {
    var name = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Madrid", weekday: "short" }).format(new Date());
    return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[name];
  } catch (e) {
    return new Date().getDay();
  }
}

function FRY_offerValidToday(code) {
  var offer = FRY_OFFERS[code];
  if (!offer || !offer.days) return true;
  return offer.days.indexOf(FRY_madridWeekday()) !== -1;
}

// Producto regalo (precio 0) que corresponde al carrito actual, o null.
function FRY_computeFreeItem(code, subtotal) {
  var offer = FRY_OFFERS[code];
  if (!offer || offer.scope !== "freeitem") return null;
  if (!FRY_offerValidToday(code)) return null;
  if (!(subtotal > offer.minSubtotal)) return null;
  return { name: offer.freeItemName, price: 0, qty: 1 };
}

// Cuánto descuento (en €) aporta un código concreto sobre el carrito actual.
function FRY_computeOfferDiscount(code, cartItems, subtotal) {
  var offer = FRY_OFFERS[code];
  if (!offer) return 0;

  if (offer.scope === "subtotal") {
    return subtotal * offer.rate;
  }

  if (offer.scope === "items") {
    var sum = 0;
    (cartItems || []).forEach(function (item) {
      if (offer.items.indexOf(item.name) !== -1) {
        sum += item.price * item.qty * offer.rate;
      }
    });
    return sum;
  }

  return 0;
}
