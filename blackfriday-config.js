// Black Friday FRY.: del viernes 27 al domingo 29 de noviembre de 2026 (hora de Madrid).
// Todo se enciende y se apaga solo: pasada la fecha de fin, la web vuelve sola a los precios
// de siempre y los puntos vuelven a 100 por cada 1. Para cambiar las fechas, edita START y END.
(function () {
  "use strict";

  // 27 nov 2026 00:00 (Madrid, UTC+1)  ->  29 nov 2026 23:59:59 (Madrid)
  var START = Date.UTC(2026, 10, 26, 23, 0, 0);
  var END = Date.UTC(2026, 10, 29, 22, 59, 59);

  var BF = {
    start: START,
    end: END,
    pointsMultiplier: 2,           // doble de puntos
    fiestaPrice: 54.9,             // Fiesta Mixta en Black Friday
    fiestaOldPrice: 61.9,          // precio de siempre
    comboName: "Combo Black",
    comboPrice: 36,

    inRange: function (ts) {
      var t = Number(ts);
      if (!t) t = Date.now();
      return t >= START && t <= END;
    },
    active: function () { return BF.inRange(Date.now()); },

    // Precio que corresponde a cada producto ahora mismo.
    fiesta: function () { return BF.active() ? BF.fiestaPrice : BF.fiestaOldPrice; }
  };
  window.FRY_BF = BF;

  // Mostrar / ocultar bloques de la web según esté activo.
  function apply() {
    var on = BF.active();
    var show = document.querySelectorAll("[data-bf-show]");
    for (var i = 0; i < show.length; i++) show[i].hidden = !on;
    var hide = document.querySelectorAll("[data-bf-hide]");
    for (var j = 0; j < hide.length; j++) hide[j].hidden = on;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
