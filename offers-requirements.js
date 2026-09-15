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
  }
};

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
