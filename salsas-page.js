(function () {
  "use strict";
  var items = document.querySelectorAll(".salsa-item");
  var slots = document.querySelectorAll(".salsa-slot");
  if (!items.length) return;

  function activate(id, updateHash) {
    var found = false;
    for (var i = 0; i < items.length; i++) {
      var on = items[i].getAttribute("data-salsa") === id;
      if (on) found = true;
      items[i].classList.toggle("is-open", on);
      var head = items[i].querySelector(".salsa-head");
      if (head) head.setAttribute("aria-expanded", on ? "true" : "false");
    }
    if (!found) return;
    for (var j = 0; j < slots.length; j++) {
      var active = slots[j].getAttribute("data-salsa") === id;
      slots[j].classList.toggle("is-active", active);
      // si la salsa ya tiene vídeo, solo se reproduce el que se ve
      var v = slots[j].querySelector("video");
      if (v) { if (active) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else { v.pause(); } }
    }
    if (updateHash && window.history && history.replaceState) history.replaceState(null, "", "#" + id);
  }

  for (var k = 0; k < items.length; k++) {
    (function (item) {
      var head = item.querySelector(".salsa-head");
      if (head) head.addEventListener("click", function () { activate(item.getAttribute("data-salsa"), true); });
    })(items[k]);
  }

  // enlace directo: salsas.html#ranch · salsas.html#miel (por defecto, la primera)
  var h = (location.hash || "").replace("#", "");
  activate(h || items[0].getAttribute("data-salsa"), false);
})();
