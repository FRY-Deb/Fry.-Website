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
      tiktok: "#", // TODO: enlace real de TikTok
    },

    categories: [
      {
        id: "combos-mixtos",
        label: "Combos Mixtos",
        items: [
          { name: "Fiesta Mixta", desc: "4 piezas de pechuga + 4 hamburguesas FRY. + 6 patatas + 6 bebidas + 2 cubos de Salsa FRY. incluidos.", price: "56,90€" },
        ],
      },
      {
        id: "piezas",
        label: "Piezas de Pollo",
        note: "Pechuga entera marinada en buttermilk, doble rebozado bien picante. Se vende por ración de 2 piezas.",
        items: [
          { name: "Ración 2 Piezas", desc: "2 piezas de pechuga entera (400 g en total) — para 1-2 personas. Incluye 1 cubo de Salsa FRY.", price: "11,50€", highlight: true },
        ],
      },
      {
        id: "tiras",
        label: "Tiras Grandes",
        note: "Delicioso pollo rebozado, doble capa, cortado en tiras grandes. Se vende por ración de 4.",
        items: [
          { name: "Ración 4 Tiras", desc: "4 tiras grandes de pollo, rebozado crujiente y picante.", price: "7,50€" },
        ],
      },
      {
        id: "hamburguesas",
        label: "Hamburguesas",
        note: "Delicioso pollo rebozado entero, sin picar. Brioche, pepinillos, salsa FRY.",
        items: [
          { name: "Hamburguesa FRY.", desc: "Delicioso pollo rebozado, pepinillos agridulces, salsa FRY, brioche.", price: "8,00€" },
        ],
      },
      {
        id: "ensaladas",
        label: "Ensaladas",
        note: "Próximamente.",
        items: [],
      },
      {
        id: "guarniciones",
        label: "Guarniciones",
        note: "Patatas con nuestro sazón cajun de la casa — elige el tamaño según cuántos seáis.",
        items: [
          { name: "Patatas Fritas — Pequeña", desc: "Para 1-2 personas.", price: "3,40€" },
          { name: "Patatas Fritas — Mediana", desc: "Para 2-3 personas.", price: "5,20€" },
          { name: "Patatas Fritas — Grande", desc: "Para 4-5 personas.", price: "6,50€" },
          { name: "CHEESE. FRY.", desc: "Bolitas de queso fundente, con el mismo rebozado crujiente del pollo. 4 unidades.", price: "4,50€" },
          { name: "CHEESE. FRY. (7 uds)", desc: "Bolitas de queso fundente, con el mismo rebozado crujiente del pollo. 7 unidades.", price: "6,90€" },
          { name: "Mazorca FRY.", desc: "Bañada en mantequilla con nuestro sazón cajun de la casa: pimentón ahumado, chipotle y un toque de hierbas.", price: "3,50€" },
        ],
      },
      {
        id: "salsas",
        label: "Salsas Extra",
        note: "Tarrinas individuales, listas para mojar o echar por encima.",
        items: [
          { name: "Cubo de Salsa FRY.", desc: "Cremosa, con paprika, mostaza y un toque de miel. 227 g, cubo grande para sumergir la pieza entera.", price: "3,95€" },
          { name: "Tarrina de Salsa Bourbon", desc: "40 g. Glaseado dulce y ahumado con bourbon real, sirope de arce puro y un fondo de mostaza y soja.", price: "1,90€" },
          { name: "Tarrina de Salsa Sweet Chilli", desc: "40 g. Guindilla fresca y ajo salteado, dulce con un toque picante de fondo.", price: "1,00€" },
          { name: "Tarrina de Salsa Habanero Mango", desc: "40 g. Mango fresco y habanero, picante afrutado y con punch.", price: "1,20€" },
        ],
      },
      {
        id: "bebidas",
        label: "Bebidas",
        items: [
          { name: "Refrescos 500ml", desc: "Elige tu sabor y añádelo al pedido: Coca-Cola, Coca-Cola Zero, Fanta Naranja, Aquarius Limón o Nestea.", price: "2,40€" },
          { name: "Refrescos 2 Litros", desc: "Para compartir. Elige tu sabor.", price: "3,00€" },
          { name: "Agua Embotellada", desc: "500 ml.", price: "1,20€" },
        ],
      },
    ],

    combos: [
      { name: "Fiesta Mixta", price: "56,90€", tag: "4 piezas + 4 hamburguesas + 6 patatas + 6 bebidas + 2 cubos de Salsa FRY." },
      { name: "Ración 2 Piezas", price: "11,50€", tag: "2 piezas de pechuga entera + 1 cubo de Salsa FRY." },
      { name: "Ración 4 Tiras", price: "7,50€", tag: "4 tiras grandes de pollo" },
    ],
  };
})();
