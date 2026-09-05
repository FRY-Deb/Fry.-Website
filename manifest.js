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
        id: "combos-piezas",
        label: "Combos de Piezas",
        note: "Pensados para 2 o más personas.",
        items: [
          { name: "Menú Para 2", desc: "4 piezas de pechuga entera + 2 patatas + 2 bebidas.", price: "25,90€" },
          { name: "Menú Para 3", desc: "6 piezas de pechuga entera + 3 patatas + 3 bebidas.", price: "37,90€" },
          { name: "Familiar 8 Piezas", desc: "8 piezas de pechuga entera + 4 patatas + 4 bebidas.", price: "49,90€" },
        ],
      },
      {
        id: "combos-tiras",
        label: "Combos de Tiras",
        items: [
          { name: "Cubo Familiar de Tiras", desc: "12 tiras grandes + 4 patatas + 4 bebidas.", price: "29,90€" },
          { name: "Mega Familiar", desc: "16 tiras grandes + 6 patatas + 6 bebidas + cubo de salsa FRY.", price: "44,90€" },
        ],
      },
      {
        id: "combos-hamburguesas",
        label: "Combos de Hamburguesas",
        items: [
          { name: "Familiar 4 Hamburguesas", desc: "4 hamburguesas FRY. + 4 patatas + 4 bebidas.", price: "31,90€" },
        ],
      },
      {
        id: "combos-mixtos",
        label: "Combos Mixtos",
        note: "Combinan varios productos de la carta.",
        items: [
          { name: "Dúo Tiras + Pieza", desc: "4 tiras grandes + 2 piezas de pechuga + 2 patatas + 2 bebidas.", price: "26,90€" },
          { name: "Fiesta Mixta", desc: "4 piezas de pechuga + 4 hamburguesas FRY. + 6 patatas + 6 bebidas.", price: "55,90€" },
        ],
      },
      {
        id: "piezas",
        label: "Piezas de Pollo",
        note: "Pechuga entera marinada en buttermilk, doble rebozado bien picante.",
        items: [
          { name: "Pechuga Entera", desc: "220 g de pechuga, rebozado crujiente, glaseado picante de la casa.", price: "8,50€" },
          { name: "Menú 2 Piezas", desc: "2 pechugas enteras + patatas fritas + bebida.", price: "13,50€", highlight: true },
        ],
      },
      {
        id: "tiras",
        label: "Tiras Grandes",
        note: "Delicioso pollo rebozado, doble capa, cortado en tiras grandes.",
        items: [
          { name: "Ración 4 Tiras", desc: "4 tiras grandes de pollo, rebozado crujiente y picante.", price: "7,50€" },
          { name: "Menú 2 Tiras", desc: "2 tiras + patatas fritas + bebida.", price: "6,50€" },
          { name: "Menú 3 Tiras", desc: "3 tiras + patatas fritas + bebida.", price: "7,50€" },
          { name: "Menú 4 Tiras", desc: "4 tiras + patatas fritas + bebida.", price: "8,50€", highlight: true },
        ],
      },
      {
        id: "hamburguesas",
        label: "Hamburguesas",
        note: "Delicioso pollo rebozado entero, sin picar. Brioche, pepinillos, salsa FRY.",
        items: [
          { name: "Hamburguesa FRY.", desc: "Delicioso pollo rebozado, pepinillos agridulces, salsa FRY, brioche.", price: "8,00€" },
          { name: "Menú Hamburguesa", desc: "Hamburguesa FRY. + patatas fritas + bebida.", price: "12,50€" },
          { name: "Combo 2 Hamburguesas", desc: "2 hamburguesas + 2 patatas + 2 bebidas + cubo de salsa FRY. de regalo.", price: "24,00€", promo: true },
        ],
      },
      {
        id: "guarniciones",
        label: "Guarniciones",
        items: [
          { name: "Patatas Fritas", desc: "Con nuestro sazón cajun de la casa: pimentón ahumado, chipotle y un toque de hierbas, espolvoreado nada más salir de la freidora.", price: "3,40€" },
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
          { name: "Refrescos 500ml", desc: "Elige tu sabor y añádelo al pedido: Coca-Cola, Coca-Cola Zero, Fanta Naranja, Aquarius Limón o Nestea.", price: "2,90€" },
          { name: "Agua Embotellada", desc: "500 ml.", price: "1,20€" },
        ],
      },
    ],

    combos: [
      { name: "Combo 2 Hamburguesas", price: "24€", tag: "+ cubo de salsa FRY. de regalo" },
      { name: "Menú 2 Piezas", price: "13,50€", tag: "pechuga entera x2 + patatas + bebida" },
      { name: "Menú 4 Tiras", price: "8,50€", tag: "tiras grandes x4 + patatas + bebida" },
    ],
  };
})();
