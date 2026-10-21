(function () {
  "use strict";

  window.__BRAND__ = {
    name: "FRY.",
    tagline: "HOT. CRISPY. LOUD.",
    manifesto: "FRY. es actitud. Es sabor sin filtros. Es crujiente, picante y real. No pedimos permiso. Solo freímos. Y lo hacemos bien.",
    est: "2026",
    zone: "Villaverde, Madrid",

    whatsapp: "34669765785",
    whatsappMessage: "Hola! Quiero hacer un pedido en FRY.",

    delivery: {
      mode: "Únicamente a domicilio",
      villaverde: "2€",
      fuera: "Fuera de zona: consultar con el local",
    },

    social: {
      instagram: "https://www.instagram.com/fry_group?igsi=azF1aW1yaThhMm9q&utm_source=qr",
      tiktok: "https://www.tiktok.com/@fry0815",
    },

    categories: [
      {
        id: "combos-mixtos",
        label: "Combos Mixtos",
        items: [
          { name: "Fiesta Mixta", desc: "4 piezas de pechuga + 4 hamburguesas FRY. + 2 patatas medianas + 1 bebida de 2L + 4 tarrinas de Salsa FRY. (≈100 g) incluidas.", price: "56,90€" },
        ],
      },
      {
        id: "piezas",
        label: "Piezas de Pollo",
        note: "Pechuga entera marinada en buttermilk, doble rebozado bien picante. Se vende por ración de 2 piezas.",
        items: [
          { name: "Ración 2 Piezas", desc: "2 piezas de pechuga entera (400 g en total) — para 1-2 personas. Incluye 1 tarrina de Salsa FRY. (≈100 g).", price: "11,50€", highlight: true },
        ],
      },
      {
        id: "tiras",
        label: "Tiras Grandes",
        note: "Delicioso pollo rebozado, doble capa, cortado en tiras grandes. Se vende por ración de 4.",
        items: [
          { name: "Ración 4 Tiras", desc: "4 tiras grandes de pollo (unos 150 g cada una, más o menos), rebozado crujiente y picante. Incluye 1 tarrina de Salsa FRY. (≈100 g).", price: "9,50€" },
        ],
      },
      {
        id: "bites",
        label: "FRY BITES",
        note: "Bocaditos de pollo rebozado, para picar o compartir. Las raciones de 20 y 30 uds incluyen 1 tarrina de Salsa FRY.",
        items: [
          { name: "FRY BITES — 10 uds", desc: "10 bocaditos de pollo rebozado, crujientes y picantes. Para picar.", price: "4,50€" },
          { name: "FRY BITES — 20 uds", desc: "20 bocaditos de pollo rebozado. Incluye 1 tarrina de Salsa FRY.", price: "7,50€" },
          { name: "FRY BITES — 30 uds", desc: "30 bocaditos de pollo rebozado, para compartir. Incluye 1 tarrina de Salsa FRY.", price: "10,50€" },
        ],
      },
      {
        id: "hamburguesas",
        label: "Hamburguesas",
        note: "150 g de pollo rebozado entero, sin picar. Brioche, loncha de queso, pepinillos, salsa FRY.",
        items: [
          { name: "Hamburguesa FRY.", desc: "150 g de pollo rebozado, loncha de queso, pepinillos agridulces, salsa FRY, pan brioche.", price: "9,00€" },
        ],
      },
      {
        id: "guarniciones",
        label: "Guarniciones",
        note: "Patatas con nuestro sazón cajun de la casa — elige el tamaño según cuántos seáis.",
        items: [
          { name: "Patatas Especiales FRY. — Pequeña", desc: "150g de patatas cajún + 1 tarrina de Salsa Ranch FRY (≈100g) + tarrina de miel (30g).", price: "5,20€" },
          { name: "Patatas Especiales FRY. — Grande", desc: "800g de patatas cajún + 2 tarrinas de Salsa Ranch FRY (≈100g c/u) + 2 tarrinas de miel (30g c/u).", price: "10,00€" },
          { name: "Patatas Fritas — Pequeña", desc: "Para 1-2 personas.", price: "3,40€" },
          { name: "Patatas Fritas — Mediana", desc: "Para 2-3 personas.", price: "5,20€" },
          { name: "Patatas Fritas — Grande", desc: "Para 4-5 personas.", price: "6,50€" },
        ],
      },
      {
        id: "salsas",
        label: "Nuestras salsas",
        note: "Tarrinas individuales, listas para mojar o echar por encima.",
        items: [
          { name: "Tarrina de Salsa FRY.", desc: "Cremosa, con paprika, mostaza y un toque de miel. Tarrina de ≈100 g, para mojar.", price: "2,50€" },
          { name: "Tarrina de Salsa Ranch FRY.", desc: "Mayonesa, yogur griego, zumo de limón, zumo de pepinillo y cilantro fresco. Tarrina de ≈100 g, para mojar.", price: "2,50€" },
          { name: "Miel", desc: "30 g. Miel líquida para mojar o echar por encima.", price: "1,50€" },
        ],
      },
      {
        id: "bebidas",
        label: "Bebidas",
        items: [
          { name: "Refrescos 2 Litros", desc: "Para compartir. Elige tu sabor.", price: "3,50€" },
        ],
      },
    ],

    combos: [
      { name: "Fiesta Mixta", price: "56,90€", tag: "4 piezas + 4 hamburguesas + 2 patatas medianas + bebida de 2L + 4 tarrinas de Salsa FRY." },
      { name: "Hamburguesa FRY.", price: "9,00€", tag: "Pan brioche, pepinillos agridulces, salsa FRY, queso y 150 g de pollo rebozado." },
      { name: "Ración 4 Tiras", price: "9,50€", tag: "4 tiras grandes de pollo" },
    ],
  };
})();
