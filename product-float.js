(function () {
  "use strict";
  var media = document.querySelector(".product-split-media");
  if (!media) return;
  var mq = window.matchMedia("(max-width: 899px)");
  var backdrop = document.createElement("div");
  backdrop.className = "product-float-backdrop";
  document.body.appendChild(backdrop);

  function set(open) {
    media.classList.toggle("is-expanded", open);
    backdrop.classList.toggle("is-on", open);
  }
  media.addEventListener("click", function () { if (mq.matches) set(!media.classList.contains("is-expanded")); });
  backdrop.addEventListener("click", function () { set(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
  function onChange() { if (!mq.matches) set(false); }
  if (mq.addEventListener) mq.addEventListener("change", onChange); else if (mq.addListener) mq.addListener(onChange);
})();
