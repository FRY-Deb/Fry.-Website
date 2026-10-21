(function () {
  "use strict";
  var BASE = "https://www.gstatic.com/firebasejs/10.7.1/";
  var overlay = null, listRef = null, firstOpen = true;

  function loadScript(src) {
    return new Promise(function (ok, fail) {
      var s = document.createElement("script");
      s.src = src; s.onload = ok; s.onerror = fail;
      document.head.appendChild(s);
    });
  }

  // Carga Firebase solo cuando alguien abre el ranking (en las páginas que no lo traen ya).
  function ensureFirebase() {
    var p = Promise.resolve();
    if (typeof firebase === "undefined") p = p.then(function () { return loadScript(BASE + "firebase-app-compat.js"); });
    p = p.then(function () { if (!firebase.database) return loadScript(BASE + "firebase-database-compat.js"); });
    p = p.then(function () { if (typeof FRY_FIREBASE_CONFIG === "undefined") return loadScript("firebase-config.js"); });
    return p.then(function () {
      if (!firebase.apps.length) firebase.initializeApp(FRY_FIREBASE_CONFIG);
      return firebase.database();
    });
  }

  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function buildModal() {
    var o = el("div", "rk-overlay"); o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.setAttribute("aria-labelledby", "rkTitle");
    var box = el("div", "rk-box");
    var close = el("button", "rk-close", "×"); close.type = "button"; close.setAttribute("aria-label", "Cerrar");
    box.appendChild(close);
    box.appendChild(el("span", "eyebrow rk-eyebrow", "Clientes FRY."));
    var h = el("h3", "rk-title", "Ranking de puntos"); h.id = "rkTitle"; box.appendChild(h);
    var pod = el("div", "rk-podium"); pod.setAttribute("data-rk-podium", ""); box.appendChild(pod);
    var more = el("button", "rk-more", "Ver listado completo"); more.type = "button"; more.setAttribute("data-rk-more", ""); box.appendChild(more);
    var ol = el("ol", "rk-list"); ol.setAttribute("data-rk-list", ""); box.appendChild(ol);
    box.appendChild(el("p", "rk-note", "Puntos totales acumulados con pedidos, se hayan gastado o no. Si tienes cuenta, puedes aparecer activándolo en «Mi cuenta»."));
    o.appendChild(box); document.body.appendChild(o);

    close.addEventListener("click", closeModal);
    o.addEventListener("click", function (e) { if (e.target === o) closeModal(); });
    more.addEventListener("click", function () {
      var open = o.classList.toggle("is-full");
      more.textContent = open ? "Ocultar listado" : "Ver listado completo";
    });
    return o;
  }

  function render(rows) {
    var pod = overlay.querySelector("[data-rk-podium]"), ol = overlay.querySelector("[data-rk-list]"), more = overlay.querySelector("[data-rk-more]");
    pod.innerHTML = ""; ol.innerHTML = "";
    if (!rows.length) {
      pod.appendChild(el("p", "rk-empty", "Todavía no hay nadie en el ranking. ¡Pide con tu cuenta y sé el primero!"));
      more.style.display = "none";
      return;
    }
    var order = [1, 0, 2];   // plata, oro, bronce (el oro va en el centro)
    order.forEach(function (i) {
      var r = rows[i];
      var col = el("div", "rk-col rk-pos" + (i + 1) + (r ? "" : " is-empty"));
      col.appendChild(el("span", "rk-name", r ? r.name : "—"));
      col.appendChild(el("span", "rk-pts", r ? fmt(r.pts) + " pts" : ""));
      var bar = el("div", "rk-bar"); bar.appendChild(el("span", "rk-num", String(i + 1)));
      col.appendChild(bar); pod.appendChild(col);
    });
    rows.slice(3).forEach(function (r, k) {
      var li = el("li", "rk-item"); li.value = k + 4;
      li.appendChild(el("span", "rk-item-pos", String(k + 4)));
      li.appendChild(el("span", "rk-item-name", r.name));
      li.appendChild(el("span", "rk-item-pts", fmt(r.pts) + " pts"));
      ol.appendChild(li);
    });
    more.style.display = rows.length > 3 ? "" : "none";
  }

  function openModal() {
    if (!overlay) overlay = buildModal();
    overlay.classList.remove("is-full");
    overlay.querySelector("[data-rk-more]").textContent = "Ver listado completo";
    requestAnimationFrame(function () { overlay.classList.add("is-open"); });
    setTimeout(function () { overlay.classList.add("is-open"); }, 30);
    document.body.classList.add("rk-lock");
    overlay.querySelector("[data-rk-podium]").innerHTML = "";
    overlay.querySelector("[data-rk-podium]").appendChild(el("p", "rk-empty", "Cargando…"));
    ensureFirebase().then(function (db) {
      if (listRef) listRef.off();
      listRef = db.ref("ranking").orderByChild("pts").limitToLast(20);
      listRef.on("value", function (snap) {
        var rows = [];
        snap.forEach(function (c) { var v = c.val(); if (v && v.name) rows.push({ name: String(v.name), pts: Number(v.pts) || 0 }); });
        rows.sort(function (a, b) { return b.pts - a.pts; });     // más puntos primero
        render(rows.slice(0, 20));
      }, function () {
        overlay.querySelector("[data-rk-podium]").innerHTML = "";
        overlay.querySelector("[data-rk-podium]").appendChild(el("p", "rk-empty", "No se ha podido cargar el ranking. Inténtalo de nuevo."));
      });
    }).catch(function () {
      overlay.querySelector("[data-rk-podium]").innerHTML = "";
      overlay.querySelector("[data-rk-podium]").appendChild(el("p", "rk-empty", "No se ha podido cargar el ranking. Revisa tu conexión."));
    });
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.classList.remove("rk-lock");
    if (listRef) { try { listRef.off(); } catch (e) {} listRef = null; }
  }

  var PODIUM_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><circle cx="12" cy="3.6" r="2"/><rect x="8.5" y="7" width="7" height="13" rx="1"/><rect x="1.5" y="11.5" width="7" height="8.5" rx="1"/><rect x="15.5" y="14.5" width="7" height="5.5" rx="1"/></svg>';

  function mountButtons() {
    var inner = document.querySelector(".nav-inner");
    if (inner && !inner.querySelector("[data-rank-open]")) {
      var b = el("button", "nav-rank"); b.type = "button"; b.setAttribute("data-rank-open", ""); b.setAttribute("aria-label", "Ver el ranking de clientes");
      b.innerHTML = PODIUM_SVG;
      var cart = inner.querySelector(".nav-cart");
      if (cart) inner.insertBefore(b, cart); else inner.appendChild(b);
    }
    var mob = document.querySelector("[data-nav-mobile]");
    if (mob && !mob.querySelector("[data-rank-open]")) {
      var a = el("a", null, "Ranking de clientes"); a.href = "#ranking"; a.setAttribute("data-rank-open", "");
      var mc = mob.querySelector(".nav-mobile-cart");
      if (mc) mob.insertBefore(a, mc); else mob.appendChild(a);
    }
    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-rank-open]") : null;
      if (!t) return;
      e.preventDefault();
      var burger = document.querySelector("[data-nav-burger][aria-expanded='true']");
      if (burger) burger.click();
      openModal();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountButtons); else mountButtons();
})();
