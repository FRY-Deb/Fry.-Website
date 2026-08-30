// Cuánto stock de cada ingrediente base consume cada producto.
// Si un producto no aparece aquí, su disponibilidad se controla
// a mano con el interruptor normal (soldOut) en el panel de admin.
var FRY_STOCK_REQUIREMENTS = {
  "Pechuga Entera": { piezas: 1 },
  "Menú 2 Piezas": { piezas: 2 },
  "Menú Para 2": { piezas: 4 },
  "Menú Para 3": { piezas: 6 },
  "Familiar 8 Piezas": { piezas: 8 },

  "Ración 4 Tiras": { tiras: 4 },
  "Menú 2 Tiras": { tiras: 2 },
  "Menú 3 Tiras": { tiras: 3 },
  "Menú 4 Tiras": { tiras: 4 },
  "Cubo Familiar de Tiras": { tiras: 12 },
  "Mega Familiar": { tiras: 16 },

  "Hamburguesa FRY.": { hamburguesas: 1 },
  "Combo 2 Hamburguesas": { hamburguesas: 2 },
  "Familiar 4 Hamburguesas": { hamburguesas: 4 },

  "Dúo Tiras + Pieza": { tiras: 4, piezas: 2 },
  "Fiesta Mixta": { piezas: 4, hamburguesas: 4 }
};

// Ingredientes base que se gestionan como cantidad numérica en vez de sí/no.
var FRY_STOCK_LABELS = {
  piezas: "Piezas de pechuga",
  tiras: "Tiras",
  hamburguesas: "Hamburguesas"
};
