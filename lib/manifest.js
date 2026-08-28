(function () {
  "use strict";

  window.__BRAND__ = {
    name: "FRY.",
    tagline: "HOT. CRISPY. LOUD.",
    manifesto: "FRY. es actitud. Es sabor sin filtros. Es crujiente, picante y real. No pedimos permiso. Solo freímos. Y lo hacemos bien.",
    est: "2026",
    zone: "Villaverde, Madrid",

    // TODO: sustituye por tu número real de WhatsApp antes de publicar (formato: 34XXXXXXXXX, sin +, sin espacios)
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
        id: "piezas",
        label: "Piezas de Pollo",
        note: "Pechuga entera marinada en buttermilk, doble rebozado bien picante.",
        items: [
          { name: "Pechuga Entera", desc: "220 g de pechuga, rebozado crujiente, glaseado picante de la casa.", price: "8,50€" },
          { name: "Menú 2 Piezas", desc: "2 pechugas enteras + patatas fritas + bebida de grifo.", price: "13,50€", highlight: true },
          { name: "Menú 3 Piezas", desc: "3 pechugas enteras + patatas fritas + bebida de grifo.", price: "17,50€" },
        ],
      },
      {
        id: "tiras",
        label: "Tiras Grandes",
        note: "Muslo deshuesado, doble rebozado, cortado en tiras grandes.",
        items: [
          { name: "Ración 4 Tiras", desc: "4 tiras grandes de pollo, rebozado crujiente y picante.", price: "7,50€" },
          { name: "Menú 2 Tiras", desc: "2 tiras + patatas fritas + bebida de grifo.", price: "6,50€" },
          { name: "Menú 3 Tiras", desc: "3 tiras + patatas fritas + bebida de grifo.", price: "7,50€" },
          { name: "Menú 4 Tiras", desc: "4 tiras + patatas fritas + bebida de grifo.", price: "8,50€", highlight: true },
        ],
      },
      {
        id: "hamburguesas",
        label: "Hamburguesas",
        note: "Filete de muslo entero rebozado, sin picar. Brioche, pepinillos, salsa ranchera.",
        items: [
          { name: "Hamburguesa FRY.", desc: "Filete de muslo rebozado, pepinillos agridulces, salsa ranchera, brioche.", price: "8,00€" },
          { name: "Combo 2 Hamburguesas", desc: "2 hamburguesas + 2 patatas + 2 bebidas + cubo de salsa FRY. de regalo.", price: "24,00€", promo: true },
        ],
      },
      {
        id: "guarniciones",
        label: "Guarniciones",
        items: [
          { name: "Patatas Fritas", desc: "Sazón propio, distinto al del pollo.", price: "3,40€" },
        ],
      },
      {
        id: "salsas",
        label: "Salsas Extra",
        note: "Para acompañar o hundir la pieza entera.",
        items: [
          { name: "Cubo de Salsa FRY.", desc: "Cremosa, con paprika, mostaza y un toque de miel. 227 g, cubo grande para sumergir la pieza entera.", price: "3,95€" },
          { name: "Salsa Bourbon", desc: "Glaseado dulce y ahumado con bourbon real, sirope de arce puro y un fondo de mostaza y soja. Porción de 80 g.", price: "4,50€" },
          { name: "Salsa Sweet Chilli", desc: "Guindilla fresca y ajo salteado, dulce con un toque picante de fondo. 227 g, cubo grande para sumergir.", price: "3,95€" },
        ],
        upcoming: ["Habanero Mango"],
      },
      {
        id: "bebidas",
        label: "Bebidas",
        items: [
          { name: "Refresco de Grifo", desc: "Vaso 500 ml.", price: "2,75€" },
          { name: "Refresco en Botella", desc: "500 ml.", price: "2,90€" },
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
