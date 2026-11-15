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

  /* ---------- Mobile navigation ---------- */
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
  }

  /* ---------- Category filter + search (home menu) ---------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var groups = document.querySelectorAll(".menu-group");
  var searchInput = document.getElementById("menu-search");
  var noResults = document.getElementById("menu-empty");
  var currentFilter = "all";

  function refreshMenu() {
    var q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var anyVisible = false;
    groups.forEach(function (g) {
      var anyCard = false;
      g.querySelectorAll(".product-card").forEach(function (c) {
        var show = !q || (c.dataset.product || "").toLowerCase().indexOf(q) !== -1;
        c.hidden = !show;
        if (show) anyCard = true;
      });
      var showGroup = q ? anyCard : (currentFilter === "all" || g.dataset.category === currentFilter);
      g.hidden = !showGroup;
      if (showGroup) anyVisible = true;
    });
    if (noResults) noResults.hidden = anyVisible;
  }

  function applyFilter(cat, updateHash) {
    var valid = false;
    filterBtns.forEach(function (b) { if (b.dataset.filter === cat) valid = true; });
    if (!valid) cat = "all";
    currentFilter = cat;
    filterBtns.forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.filter === cat ? "true" : "false");
    });
    refreshMenu();
    if (updateHash && history.replaceState) {
      history.replaceState(null, "", cat === "all" ? "#menu" : "#" + cat);
    }
  }
  filterBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      if (searchInput) searchInput.value = "";
      applyFilter(b.dataset.filter, true);
    });
  });
  if (searchInput) searchInput.addEventListener("input", refreshMenu);
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

  /* ---------- Size chips update the WhatsApp order message ---------- */
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

  /* ---------- My list (enquiry list sent as ONE WhatsApp message) ---------- */
  var KEY = "slp_enquiry_list_v1";
  var list = [];

  function validItem(i) {
    return i && typeof i.name === "string" && typeof i.size === "string" &&
      typeof i.qty === "number" && i.qty >= 1 && i.qty <= 99 &&
      Object.prototype.toString.call(i.sizes) === "[object Array]" && i.sizes.length;
  }
  function loadList() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "[]");
      list = Object.prototype.toString.call(v) === "[object Array]" ? v.filter(validItem) : [];
    } catch (e) { list = []; }
  }
  function saveList() {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* storage may be blocked */ }
  }
  function totalQty() {
    return list.reduce(function (n, i) { return n + i.qty; }, 0);
  }
  function listMessage() {
    var lines = ["Assalam o Alaikum! Mujhe in products ke baare mein price aur availability chahiye:"];
    list.forEach(function (i, idx) {
      lines.push((idx + 1) + ". " + i.name + " (" + i.size + ") x " + i.qty);
    });
    lines.push("Shukriya.");
    return lines.join("\n");
  }

  var fab, overlay, panel, itemsEl, emptyEl, sendEl, clearBtn, closeBtn, countEl, toastEl, toastTimer;

  function buildUI() {
    fab = document.createElement("button");
    fab.type = "button";
    fab.className = "list-fab";
    fab.setAttribute("aria-haspopup", "dialog");
    fab.setAttribute("aria-controls", "list-panel");
    fab.innerHTML = '<span>My list</span><span class="list-count" aria-label="items in list">0</span>';
    countEl = fab.querySelector(".list-count");
    document.body.appendChild(fab);

    overlay = document.createElement("div");
    overlay.className = "list-overlay";
    overlay.hidden = true;
    document.body.appendChild(overlay);

    panel = document.createElement("aside");
    panel.id = "list-panel";
    panel.className = "list-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "list-title");
    panel.hidden = true;
    panel.innerHTML =
      '<div class="list-head"><h2 id="list-title">My list</h2>' +
      '<button type="button" class="list-close" aria-label="Close list">&times;</button></div>' +
      '<p class="list-empty">Your list is empty. Tap <strong>+ Add to my list</strong> on any product.</p>' +
      '<ul class="list-items"></ul>' +
      '<div class="list-foot"><a class="btn btn-wa list-send" target="_blank" rel="noopener" href="#">Send list on WhatsApp</a>' +
      '<button type="button" class="list-clear">Clear list</button>' +
      '<p class="list-note">We reply with price and availability. Nothing is ordered until you confirm on WhatsApp.</p></div>';
    document.body.appendChild(panel);
    itemsEl = panel.querySelector(".list-items");
    emptyEl = panel.querySelector(".list-empty");
    sendEl = panel.querySelector(".list-send");
    clearBtn = panel.querySelector(".list-clear");
    closeBtn = panel.querySelector(".list-close");

    toastEl = document.createElement("div");
    toastEl.className = "toast";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    document.body.appendChild(toastEl);

    fab.addEventListener("click", openPanel);
    overlay.addEventListener("click", closePanel);
    closeBtn.addEventListener("click", closePanel);
    clearBtn.addEventListener("click", function () { list = []; saveList(); renderList(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closePanel(); closeNav(); }
    });

    itemsEl.addEventListener("click", function (e) {
      var t = e.target.closest("button");
      if (!t) return;
      var idx = parseInt(t.getAttribute("data-idx"), 10);
      if (isNaN(idx) || !list[idx]) return;
      var act = t.getAttribute("data-act");
      if (act === "inc" && list[idx].qty < 99) list[idx].qty++;
      else if (act === "dec" && list[idx].qty > 1) list[idx].qty--;
      else if (act === "del") list.splice(idx, 1);
      saveList(); renderList();
    });
    itemsEl.addEventListener("change", function (e) {
      var s = e.target.closest("select");
      if (!s) return;
      var idx = parseInt(s.getAttribute("data-idx"), 10);
      if (!list[idx] || list[idx].sizes.indexOf(s.value) === -1) return;
      list[idx].size = s.value;
      mergeDuplicates();
      saveList(); renderList();
    });
  }

  function mergeDuplicates() {
    var out = [];
    list.forEach(function (i) {
      var found = out.filter(function (o) { return o.name === i.name && o.size === i.size; })[0];
      if (found) found.qty = Math.min(99, found.qty + i.qty); else out.push(i);
    });
    list = out;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderList() {
    var n = totalQty();
    countEl.textContent = n;
    fab.classList.toggle("has-items", n > 0);
    emptyEl.hidden = list.length > 0;
    sendEl.hidden = clearBtn.hidden = list.length === 0;
    itemsEl.innerHTML = list.map(function (i, idx) {
      var sizeCtl = i.sizes.length > 1
        ? '<select data-idx="' + idx + '" aria-label="Pack size for ' + esc(i.name) + '">' +
          i.sizes.map(function (s) {
            return '<option' + (s === i.size ? " selected" : "") + ">" + esc(s) + "</option>";
          }).join("") + "</select>"
        : '<span class="list-size">' + esc(i.size) + "</span>";
      return '<li><div class="list-name">' + esc(i.name) + "</div>" +
        '<div class="list-row">' + sizeCtl +
        '<div class="qty"><button type="button" data-act="dec" data-idx="' + idx + '" aria-label="Decrease quantity of ' + esc(i.name) + '">&minus;</button>' +
        "<span>" + i.qty + "</span>" +
        '<button type="button" data-act="inc" data-idx="' + idx + '" aria-label="Increase quantity of ' + esc(i.name) + '">+</button></div>' +
        '<button type="button" class="list-del" data-act="del" data-idx="' + idx + '" aria-label="Remove ' + esc(i.name) + '">Remove</button></div></li>';
    }).join("");
    sendEl.href = list.length ? "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(listMessage()) : "#";
  }

  function openPanel() {
    renderList();
    clearTimeout(toastTimer); toastEl.classList.remove("show");
    overlay.hidden = false; panel.hidden = false;
    document.body.classList.add("list-open");
    closeBtn.focus();
  }
  function closePanel() {
    if (!panel || panel.hidden) return;
    overlay.hidden = true; panel.hidden = true;
    document.body.classList.remove("list-open");
    fab.focus();
  }
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }
  function addToList(name, sizes, size) {
    var found = list.filter(function (i) { return i.name === name && i.size === size; })[0];
    if (found) { if (found.qty < 99) found.qty++; }
    else list.push({ name: name, size: size, qty: 1, sizes: sizes });
    saveList(); renderList();
    toast(name + " (" + size + ") added to your list");
  }

  loadList();
  buildUI();
  renderList();

  document.addEventListener("click", function (e) {
    var add = e.target.closest("[data-add]");
    if (add) {
      var box = add.closest("[data-product]");
      if (!box || !box.dataset.sizes) return;
      var sizes = box.dataset.sizes.split(",");
      var chip = box.querySelector('.size-chip[aria-pressed="true"]');
      var size = chip && sizes.indexOf(chip.dataset.size) !== -1 ? chip.dataset.size : sizes[0];
      addToList(box.dataset.product, sizes, size);
      return;
    }
    var share = e.target.closest("[data-share]");
    if (share) {
      var title = document.title;
      var url = location.href.split("#")[0];
      if (navigator.share) {
        navigator.share({ title: title, url: url }).catch(function () {});
      } else {
        window.open("https://wa.me/?text=" + encodeURIComponent(title + " " + url), "_blank", "noopener");
      }
    }
  });

  /* ---------- Back to top ---------- */
  var top = document.createElement("button");
  top.type = "button";
  top.className = "to-top";
  top.setAttribute("aria-label", "Back to top");
  top.innerHTML = "&uarr;";
  top.hidden = true;
  document.body.appendChild(top);
  top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      top.hidden = window.pageYOffset < 700;
      ticking = false;
    });
  }, { passive: true });
})();
