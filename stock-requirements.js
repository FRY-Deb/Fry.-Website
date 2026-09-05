// Cuánto stock de cada ingrediente base consume cada producto.
// Si un producto no aparece aquí, su disponibilidad se controla
// a mano con el interruptor normal (soldOut) en el panel de admin.
var FRY_STOCK_REQUIREMENTS = {
  "Ración 2 Piezas": { piezas: 2 },
  "Ración 4 Tiras": { tiras: 4 },
  "Hamburguesa FRY.": { hamburguesas: 1 },
  "Fiesta Mixta": { piezas: 4, hamburguesas: 4 }
};

// Ingredientes base que se gestionan como cantidad numérica en vez de sí/no.
var FRY_STOCK_LABELS = {
  piezas: "Piezas de pechuga",
  tiras: "Tiras",
  hamburguesas: "Hamburguesas"
};
