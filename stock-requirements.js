// Cuánto stock de cada ingrediente base consume cada producto.
// Si un producto no aparece aquí, su disponibilidad se controla
// a mano con el interruptor normal (soldOut) en el panel de admin.
var FRY_STOCK_REQUIREMENTS = {
  "Ración 2 Piezas": { piezas: 2 },
  "Ración 4 Tiras": { tiras: 4 },
  "Hamburguesa FRY.": { hamburguesas: 1 },
  "Fiesta Mixta": { piezas: 4, hamburguesas: 4 }
};

// Ingredientes base que se gestionan a mano como cantidad numérica en el
// panel de admin.
var FRY_STOCK_LABELS = {
  piezas: "Piezas de pechuga",
  hamburguesas: "Carne (en hamburguesas)"
};

// Las tiras usan la misma carne que las hamburguesas, así que no tienen su
// propio input en el admin: se calculan solas a partir del stock de
// "hamburguesas" (misma carne, rinde el doble de tiras).
var FRY_STOCK_RATIOS = {
  tiras: { from: "hamburguesas", factor: 2 }
};

// Añade a un stock "en bruto" (tal cual sale de Firebase) las cantidades
// derivadas de FRY_STOCK_RATIOS, para poder comprobar disponibilidad.
function FRY_deriveStock(rawStock) {
  var stock = {};
  var source = rawStock || {};
  for (var k in source) stock[k] = source[k];
  Object.keys(FRY_STOCK_RATIOS).forEach(function (derivedKey) {
    var rule = FRY_STOCK_RATIOS[derivedKey];
    var base = typeof source[rule.from] === "number" ? source[rule.from] : 0;
    stock[derivedKey] = base * rule.factor;
  });
  return stock;
}
