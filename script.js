(function () {
  "use strict";
  var WA_NUMBER = "923372523171";

  function waLink(product, size) {
    var sizeText = size ? " (" + size + ")" : "";
    var msg =
      "Assalam o Alaikum! Mujhe " + product + sizeText +
      " order karna hai. Meherbani karke price aur availability bata dein. Shukriya.";
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
  }

  /* Mobile navigation */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function closeNav() {
    if (!nav) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* Product filtering */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var groups = document.querySelectorAll(".menu-group");
  function applyFilter(cat, updateHash) {
    var valid = false;
    filterBtns.forEach(function (b) {
      if (b.dataset.filter === cat) valid = true;
    });
    if (!valid) cat = "all";
    filterBtns.forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.filter === cat ? "true" : "false");
    });
    groups.forEach(function (g) {
      g.hidden = !(cat === "all" || g.dataset.category === cat);
    });
    if (updateHash && history.replaceState) {
      history.replaceState(null, "", cat === "all" ? "#menu" : "#" + cat);
    }
  }
  filterBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      applyFilter(b.dataset.filter, true);
    });
  });
  document.querySelectorAll("[data-goto-filter]").forEach(function (c) {
    c.addEventListener("click", function (e) {
      e.preventDefault();
      applyFilter(c.dataset.gotoFilter, true);
      var menu = document.getElementById("menu");
      if (menu) menu.scrollIntoView({ behavior: "smooth" });
    });
  });
  var hash = (location.hash || "").replace("#", "");
  if (hash && hash !== "menu") applyFilter(hash, false);

  /* Size chips update WhatsApp message */
  document.querySelectorAll(".product-card").forEach(function (card) {
    var btn = card.querySelector(".order-btn");
    var chips = card.querySelectorAll(".size-chip");
    var name = card.dataset.product;
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var already = chip.getAttribute("aria-pressed") === "true";
        chips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
        if (already) {
          btn.href = waLink(name, card.dataset.allsizes);
        } else {
          chip.setAttribute("aria-pressed", "true");
          btn.href = waLink(name, chip.dataset.size);
        }
      });
    });
  });
})();
