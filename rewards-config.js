// Sistema de puntos de FRY.
// 100 puntos por cada 1€ gastado (sin contar el envío), tras descuentos.
var FRY_POINTS_PER_EURO = 100;
var FRY_POINTS_EXPIRY_MONTHS = 12;

// Recompensas canjeables. "points" = puntos necesarios.
//   freeitem: añade ese producto al pedido a 0€
//   percent:  descuento sobre el subtotal de productos, con tope en euros
var FRY_REWARDS = {
  patatas: {
    label: "Patatas pequeñas gratis",
    points: 3000,
    type: "freeitem",
    itemName: "Patatas Fritas — Pequeña (canje de puntos)"
  },
  bebida: {
    label: "Refresco 2 L gratis",
    points: 3500,
    type: "freeitem",
    itemName: "Refresco 2 L (canje de puntos)"
  },
  hamburguesa: {
    label: "Hamburguesa FRY. gratis",
    points: 7500,
    type: "freeitem",
    itemName: "Hamburguesa FRY. (canje de puntos)"
  },
  mitad: {
    label: "50% en tu pedido (máx. 10€ de descuento)",
    points: 15000,
    type: "percent",
    rate: 0.5,
    maxDiscount: 10
  }
};

// Orden en que se muestran las recompensas.
var FRY_REWARD_ORDER = ["patatas", "bebida", "hamburguesa", "mitad"];

// Calcula los puntos disponibles a partir del historial (log) de un cliente.
// log: objeto { clave: { type: "earn"|"redeem"|"adjust", points, ts, ... } }
// Los puntos ganados caducan a los FRY_POINTS_EXPIRY_MONTHS meses; lo gastado
// se resta del total vigente.
function FRY_computeBalance(log, now) {
  now = now || Date.now();
  var limit = new Date(now);
  limit.setMonth(limit.getMonth() - FRY_POINTS_EXPIRY_MONTHS);
  var limitTs = limit.getTime();
  var earned = 0, spent = 0, nextExpiry = null;
  Object.keys(log || {}).forEach(function (k) {
    var e = log[k] || {};
    var p = Number(e.points) || 0;
    var ts = Number(e.ts) || 0;
    var gains = e.type === "earn" || (e.type === "adjust" && p > 0);
    if (gains) {
      if (ts >= limitTs) {
        earned += p;
        var exp = new Date(ts); exp.setMonth(exp.getMonth() + FRY_POINTS_EXPIRY_MONTHS);
        if (nextExpiry === null || exp.getTime() < nextExpiry) nextExpiry = exp.getTime();
      }
    } else if (e.type === "redeem") {
      spent += Math.abs(p);
    } else if (e.type === "adjust" && p < 0) {
      spent += Math.abs(p);
    }
  });
  return { available: Math.max(0, earned - spent), earned: earned, spent: spent, nextExpiry: nextExpiry };
}

function FRY_formatPoints(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
