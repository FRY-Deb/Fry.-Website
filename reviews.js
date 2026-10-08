(function () {
  "use strict";
  var grid = document.querySelector("[data-reviews]");
  if (!grid) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function stars(n) {
    var out = "";
    for (var i = 1; i <= 5; i++) out += i <= n ? "★" : "☆";
    return out;
  }

  var list = window.FRY_REVIEWS || [];
  if (!list.length) {
    grid.closest(".home-reviews").style.display = "none";
    return;
  }

  grid.innerHTML = list.map(function (r) {
    return (
      '<figure class="review-card" data-reveal>' +
        (r.image ? '<img class="review-img" loading="lazy" src="' + esc(r.image) + '" alt="Foto de la reseña de ' + esc(r.author) + '" />' : "") +
        '<div class="review-stars" aria-label="' + esc(r.stars) + ' de 5">' + stars(r.stars) + "</div>" +
        '<blockquote class="review-text">' + esc(r.text) + "</blockquote>" +
        '<figcaption class="review-author">' + esc(r.author) + (r.date ? " · " + esc(r.date) : "") + " · Google</figcaption>" +
      "</figure>"
    );
  }).join("");
})();
