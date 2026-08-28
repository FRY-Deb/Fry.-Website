(function () {
  "use strict";

  const data = window.__BRAND__ || {};
  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  // ---------------------------------------------------------------
  // Mount: WhatsApp links + delivery/social data from manifest
  // ---------------------------------------------------------------
  function mountBrandLinks() {
    if (!data.whatsapp) return;
    const msg = encodeURIComponent(data.whatsappMessage || "Hola!");
    const href = "https://wa.me/" + data.whatsapp + "?text=" + msg;
    $$("[data-whatsapp-link]").forEach(el => {
      if (el.dataset.bound) return;
      el.dataset.bound = "1";
      el.setAttribute("href", href);
    });
    $$("[data-instagram-link]").forEach(el => { el.setAttribute("href", data.social?.instagram || "#"); });
    $$("[data-tiktok-link]").forEach(el => { el.setAttribute("href", data.social?.tiktok || "#"); });
  }

  // ---------------------------------------------------------------
  // Mount: full menu (carta.html) — only fills if container is empty
  // ---------------------------------------------------------------
  function mountMenu() {
    const target = $("[data-menu-categories]");
    if (!target || target.children.length > 0 || !data.categories) return;
    target.innerHTML = data.categories.map(cat => `
      <div class="menu-category" data-reveal>
        <div class="menu-category-head">
          <h3 class="menu-category-label">${escHTML(cat.label)}</h3>
        </div>
        ${cat.note ? `<p class="menu-category-note">${escHTML(cat.note)}</p>` : ""}
        <div>
          ${cat.items.map(item => `
            <div class="menu-card">
              <span class="menu-card-name">${escHTML(item.name)}</span>
              <span class="menu-card-price">${escHTML(item.price)}</span>
              ${item.desc ? `<span class="menu-card-desc">${escHTML(item.desc)}</span>` : ""}
              ${item.highlight ? `<span class="menu-card-badge">Más pedido</span>` : ""}
              ${item.promo ? `<span class="menu-card-badge">Promo</span>` : ""}
            </div>
          `).join("")}
        </div>
        ${cat.upcoming ? `<div class="menu-upcoming"><strong>Próximamente:</strong> ${cat.upcoming.map(escHTML).join(" · ")}</div>` : ""}
      </div>
    `).join("");
  }

  function mountCombos() {
    const target = $("[data-combos]");
    if (!target || target.children.length > 0 || !data.combos) return;
    target.innerHTML = data.combos.map(c => `
      <a class="combo-card" href="carta.html" data-reveal>
        <span class="combo-card-name">${escHTML(c.name)}</span>
        <span class="combo-card-price">${escHTML(c.price)}</span>
        <span class="combo-card-tag">${escHTML(c.tag)}</span>
      </a>
    `).join("");
  }

  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // ---------------------------------------------------------------
  // Reveal on scroll
  // ---------------------------------------------------------------
  function initReveals() {
    const els = $$("[data-reveal]");
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("is-revealed");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(el => io.observe(el));

    setTimeout(() => {
      $$("[data-reveal]:not(.is-revealed)").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  // ---------------------------------------------------------------
  // Sticky nav — transparent -> solid on scroll
  // ---------------------------------------------------------------
  function initNavScroll() {
    const nav = $(".nav");
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 30) nav.classList.add("is-solid");
      else nav.classList.remove("is-solid");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ---------------------------------------------------------------
  // Mobile fullscreen nav
  // ---------------------------------------------------------------
  function initMobileNav() {
    const burger = $("[data-nav-burger]");
    const panel = $("[data-nav-mobile]");
    if (!burger || !panel) return;
    const close = () => { burger.setAttribute("aria-expanded", "false"); panel.setAttribute("aria-hidden", "true"); };
    const open = () => { burger.setAttribute("aria-expanded", "true"); panel.setAttribute("aria-hidden", "false"); };
    burger.addEventListener("click", () => {
      const expanded = burger.getAttribute("aria-expanded") === "true";
      expanded ? close() : open();
    });
    $$("a", panel).forEach(a => a.addEventListener("click", close));
  }

  // (Marquesina: ahora se anima solo con CSS — @keyframes marquee-scroll en styles.css)

  // (Animación del hero: gestionada por intro.js — ver ese archivo)

  // ---------------------------------------------------------------
  // Custom cursor dot (desktop, fine pointer only)
  // ---------------------------------------------------------------
  function initCursor() {
    if (!fineHover) return;
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    dot.setAttribute("aria-hidden", "true");
    document.body.appendChild(dot);

    let ready = false;
    window.addEventListener("mousemove", e => {
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (!ready) { ready = true; dot.classList.add("is-ready"); }
    });

    const hoverables = "a, button, .menu-card, .combo-card";
    document.addEventListener("mouseover", e => {
      if (e.target.closest(hoverables)) dot.classList.add("is-hover");
    });
    document.addEventListener("mouseout", e => {
      if (e.target.closest(hoverables) && !e.relatedTarget?.closest?.(hoverables)) dot.classList.remove("is-hover");
    });
  }

  // ---------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------
  function boot() {
    safe(mountBrandLinks, "mountBrandLinks");
    safe(mountMenu, "mountMenu");
    safe(mountCombos, "mountCombos");
    safe(initReveals, "initReveals");
    safe(initNavScroll, "initNavScroll");
    safe(initMobileNav, "initMobileNav");
    safe(initCursor, "initCursor");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
