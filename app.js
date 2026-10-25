/* Flavours of FriedRice — menu app (vanilla JS, no dependencies) */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG;
  var MENU = window.MENU;
  // Restore locally saved availability overrides before rendering the menu.
  var AVAILABILITY_KEY = "ffr-item-availability-v1";
  try {
    var savedAvailability = JSON.parse(localStorage.getItem(AVAILABILITY_KEY) || "{}");
    MENU.forEach(function (item) {
      if (Object.prototype.hasOwnProperty.call(savedAvailability, item.id)) item.available = !!savedAvailability[item.id];
    });
  } catch (availabilityLoadError) {}
  var ORDERING = /^\d{8,15}$/.test(CFG.whatsappNumber || "");

  var ICON = {
    all: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2.2" fill="#FF741C"/><rect x="13" y="3" width="8" height="8" rx="2.2" fill="#F7B52C"/><rect x="3" y="13" width="8" height="8" rx="2.2" fill="#F7B52C"/><rect x="13" y="13" width="8" height="8" rx="2.2" fill="#FF741C"/></svg>',
    fork: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2v7a2.5 2.5 0 0 0 1.5 2.3V22h2V11.3A2.5 2.5 0 0 0 12 9V2h-1.5v5.5h-1V2H8v5.5H7.5V2H7zm9.5 0C14.6 3.7 14 6.2 14 8.5c0 1.8.8 3 2 3.4V22h2V2h-1.5z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 8h12l1 13H5L6 8zm3-1a3 3 0 0 1 6 0h-1.8a1.2 1.2 0 0 0-2.4 0H9z"/></svg>'
  };

  var CATS = [
    { id: "all",    label: "All Items", icon: ICON.all, test: function () { return true; } },
    { id: "veg",    label: "Veg",       icon: "🌿", test: function (m) { return m.vegetarian; } },
    { id: "nonveg", label: "Non-Veg",   icon: "🍗", test: function (m) { return !m.vegetarian; } },
    { id: "noodles",label: "Noodles",   icon: "🍜", test: function (m) { return m.category === "Noodles"; } },
    { id: "rice",   label: "Fried Rice",icon: "🍚", test: function (m) { return m.category === "Fried Rice"; } },
    { id: "others", label: "Others",    icon: "🥡", test: function (m) { return m.category === "Others"; } }
  ];

  var state = { cat: "all", q: "", sort: "default", view: "double", cart: [], favs: [], openItem: null, type: "dine", qty: 1 };
  try {
    var v = localStorage.getItem("ffr-view");
    if (v === "single" || v === "double" || v === "3d") state.view = v;
    state.favs = JSON.parse(localStorage.getItem("ffr-favs") || "[]");
  } catch (e) {}

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rupee = function (n) { return "₹" + Number(n).toLocaleString("en-IN"); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var grid = $("#grid"), catsEl = $("#cats"), countEl = $("#count"), emptyEl = $("#empty"), searchEl = $("#search");

  /* ---------- Categories ---------- */
  function renderCats() {
    catsEl.innerHTML = CATS.filter(function (c) { return c.id === "all" || MENU.some(c.test); }).map(function (c) {
      var ic = c.icon.charAt(0) === "<" ? c.icon : '<span aria-hidden="true">' + c.icon + "</span>";
      return '<button class="chip" data-cat="' + c.id + '" aria-pressed="' + (c.id === state.cat) + '">' + ic + c.label + "</button>";
    }).join("");
  }
  catsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    state.cat = b.dataset.cat;
    $$(".chip", catsEl).forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.cat === state.cat); });
    b.scrollIntoView({ inline: "center", block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
    renderMenu();
  });

  /* ---------- Search & sort ---------- */
  function matches(m) {
    var cat = CATS.filter(function (c) { return c.id === state.cat; })[0];
    if (!cat.test(m)) return false;
    var q = state.q.trim().toLowerCase();
    if (!q) return true;
    var hay = [m.name, m.subtitle || "", m.tag || "", m.category, m.description, m.keywords || "", m.vegetarian ? "veg vegetarian" : "non-veg nonveg non veg"].join(" ").toLowerCase();
    return q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }
  var t;
  searchEl.addEventListener("input", function () {
    clearTimeout(t);
    t = setTimeout(function () { state.q = searchEl.value; renderMenu(); }, 80);
  });
  $("#sort").addEventListener("change", function (e) { state.sort = e.target.value; renderMenu(); });
  $("#resetBtn").addEventListener("click", function () {
    state.q = ""; state.cat = "all"; searchEl.value = ""; renderCats(); renderMenu();
  });
  function sorted(list) {
    var l = list.slice();
    if (state.sort === "low")  l.sort(function (a, b) { return a.dineInPrice - b.dineInPrice; });
    if (state.sort === "high") l.sort(function (a, b) { return b.dineInPrice - a.dineInPrice; });
    if (state.sort === "best") l.sort(function (a, b) { return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0); });
    return l;
  }

  /* ---------- Cards ---------- */
  function priceBox(kind, amount) {
    return '<div class="price ' + kind + '">' + (kind === "dine" ? ICON.fork : ICON.bag) +
      '<span class="pt"><span class="pl">' + (kind === "dine" ? "DINE-IN" : "TAKEAWAY") + '</span><b>' + rupee(amount) + "</b></span></div>";
  }
  function heartBtn(m) {
    var on = state.favs.indexOf(m.id) !== -1;
    return '<button class="heart" data-fav="' + m.id + '" aria-pressed="' + on + '" aria-label="Favourite ' + esc(m.name) + '">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path stroke-linejoin="round" d="M12 20.5s-8-4.9-8-11A4.6 4.6 0 0 1 8.5 5c1.6 0 2.8.8 3.5 2 .7-1.200 1.900-2 3.500-2A4.600 4.600 0 0 1 20 9.500c0 6.100-8 11-8 11z"/></svg></button>';
  }
  var TAGS = {
    "Chef's Choice": { cls: "b-chef", icon: "👨‍🍳" },
    "Popular":       { cls: "b-pop",  icon: "🔥" },
    "Special":       { cls: "b-spec", icon: "✨" }
  };
  function badgeHTML(m, extra) {
    var t = TAGS[m.tag];
    if (m.tag && t) return '<span class="badge ' + t.cls + '"' + (extra || "") + '>' + t.icon + " " + esc(m.tag) + "</span>";
    if (m.bestseller) return '<span class="badge"' + (extra || "") + '>★ Bestseller</span>';
    return "";
  }
  function cardHTML(m, i) {
    var img = m.image ? '<img src="' + esc(m.image) + '" alt="" loading="' + (i < 4 ? "eager" : "lazy") + '" decoding="async" onerror="this.remove()">' : "";
    var emoji = m.category === "Noodles" ? "🍜" : m.category === "Others" ? "🥡" : "🍚";
    return '<article class="card' + (m.available ? "" : " sold") + '" data-id="' + m.id + '" style="animation-delay:' + Math.min(i, 10) * 35 + 'ms">' +
      '<div class="c-img"><div class="ph" aria-hidden="true">' + emoji + "</div>" + img +
      '<span class="vdot' + (m.vegetarian ? "" : " nonveg") + '" role="img" aria-label="' + (m.vegetarian ? "Vegetarian" : "Non-vegetarian") + '"></span>' +
      badgeHTML(m) + heartBtn(m) +
      (m.available ? "" : '<span class="soldout">Currently unavailable</span>') + "</div>" +
      '<div class="c-body"><h3 class="c-name"><button class="open" data-open="' + m.id + '">' + esc(m.name) + "</button></h3>" + (m.subtitle ? '<p class="c-sub">' + esc(m.subtitle) + "</p>" : "") +
      '<p class="c-desc">' + esc(m.description) + "</p>" +
      '<div class="c-prices">' + priceBox("dine", m.dineInPrice) + priceBox("take", m.takeawayPrice) + "</div></div></article>";
  }

  function renderMenu() {
    var list = sorted(MENU.filter(matches));
    grid.className = "grid view-" + state.view;
    grid.innerHTML = list.map(cardHTML).join("");
    emptyEl.hidden = list.length > 0;
    countEl.textContent = list.length ? list.length + (list.length === 1 ? " dish" : " dishes") : "";
    $$(".vbtn").forEach(function (b) { b.setAttribute("aria-checked", b.dataset.view === state.view); });
    schedule3D();
  }

  /* ---------- View switch (Double / Single / 3D) ---------- */
  $(".view-switch").addEventListener("click", function (e) {
    var b = e.target.closest(".vbtn"); if (!b) return;
    state.view = b.dataset.view;
    try { localStorage.setItem("ffr-view", state.view); } catch (err) {}
    renderMenu();
  });

  /* ---------- Favourites ---------- */
  grid.addEventListener("click", function (e) {
    var h = e.target.closest(".heart");
    if (h) {
      var id = +h.dataset.fav, i = state.favs.indexOf(id);
      if (i === -1) state.favs.push(id); else state.favs.splice(i, 1);
      h.setAttribute("aria-pressed", i === -1);
      try { localStorage.setItem("ffr-favs", JSON.stringify(state.favs)); } catch (err) {}
      return;
    }
    var o = e.target.closest(".open");
    if (o) showItem(MENU.filter(function (x) { return x.id == o.dataset.open; })[0]);
  });

  /* ---------- 3D: tilt on desktop hover (double/single), scroll-depth in 3D view ---------- */
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer && !reduceMotion) {
    grid.addEventListener("pointermove", function (e) {
      if (state.view === "3d") return;
      var c = e.target.closest(".card"); if (!c) return;
      var r = c.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = "translateY(-4px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg)";
    });
    grid.addEventListener("pointerout", function (e) {
      if (state.view === "3d") return;
      var c = e.target.closest(".card"); if (c) c.style.transform = "";
    });
  }
  var ticking = false;
  function update3D() {
    ticking = false;
    if (state.view !== "3d" || reduceMotion) return;
    var vh = window.innerHeight, mid = vh * 0.55;
    $$(".card", grid).forEach(function (c) {
      var r = c.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      var off = ((r.top + r.height / 2) - mid) / vh;          // -1 .. 1
      off = Math.max(-1, Math.min(1, off));
      c.style.setProperty("--rx", (off * 16).toFixed(2) + "deg");
      c.style.setProperty("--sc", (1 - Math.abs(off) * 0.07).toFixed(3));
    });
  }
  function schedule3D() { if (!ticking) { ticking = true; requestAnimationFrame(update3D); } }
  window.addEventListener("scroll", schedule3D, { passive: true });
  window.addEventListener("resize", schedule3D);

  /* ---------- Theme ---------- */
  var themeBtn = $("#themeBtn");
  function syncThemeBtn() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = dark ? "#000000" : "#171411";
  }
  themeBtn.addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("ffr-theme", next); } catch (e) {}
    syncThemeBtn();
  });
  syncThemeBtn();

  /* ---------- Detail modal ---------- */
  var modal = $("#modal"), lastFocus = null;
  function openModal(el) { lastFocus = document.activeElement; el.hidden = false; document.body.style.overflow = "hidden"; var c = $(".close", el); if (c) c.focus(); }
  function closeModal(el) { el.hidden = true; document.body.style.overflow = ""; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) { var m = e.target.closest(".modal"); if (m) closeModal(m); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") $$(".modal").forEach(function (m) { if (!m.hidden) closeModal(m); });
  });

  function showItem(m) {
    state.openItem = m; state.type = "dine"; state.qty = 1;
    $("#mImg").innerHTML = m.image ? '<img src="' + esc(m.image) + '" alt="' + esc(m.name) + '" onerror="this.remove()">' : "";
    $("#mVeg").className = "vdot" + (m.vegetarian ? "" : " nonveg");
    $("#mLabel").textContent = m.vegetarian ? "Vegetarian" : "Non-Vegetarian";
    var bh = badgeHTML(m), mb = $("#mBadge");
    mb.hidden = !bh;
    if (bh) { var tmp = document.createElement("div"); tmp.innerHTML = bh; mb.className = tmp.firstChild.className; mb.textContent = tmp.firstChild.textContent; }
    var sub = $("#mSub"); sub.textContent = m.subtitle || ""; sub.hidden = !m.subtitle;
    $("#mTitle").textContent = m.name;
    $("#mDesc").textContent = m.description;
    $("#mPrices").innerHTML = priceBox("dine", m.dineInPrice) + priceBox("take", m.takeawayPrice);
    $("#orderBox").hidden = !(ORDERING && m.available);
    syncOrderBox();
    openModal(modal);
  }

  /* ---------- Ordering (only when whatsappNumber is set) ---------- */
  function syncOrderBox() {
    $$(".seg button").forEach(function (b) { b.setAttribute("aria-checked", b.dataset.type === state.type); });
    $("#qVal").textContent = state.qty;
    var m = state.openItem; if (!m) return;
    var p = state.type === "dine" ? m.dineInPrice : m.takeawayPrice;
    $("#addBtn").textContent = "Add to order · " + rupee(p * state.qty);
  }
  $(".seg").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; state.type = b.dataset.type; syncOrderBox(); });
  $("#qMinus").addEventListener("click", function () { state.qty = Math.max(1, state.qty - 1); syncOrderBox(); });
  $("#qPlus").addEventListener("click", function () { state.qty = Math.min(50, state.qty + 1); syncOrderBox(); });
  $("#addBtn").addEventListener("click", function () {
    var m = state.openItem;
    var line = state.cart.filter(function (l) { return l.id === m.id && l.type === state.type; })[0];
    if (line) line.qty += state.qty; else state.cart.push({ id: m.id, type: state.type, qty: state.qty });
    closeModal(modal); updateCart();
  });

  function lineInfo(l) {
    var m = MENU.filter(function (x) { return x.id === l.id; })[0];
    var price = l.type === "dine" ? m.dineInPrice : m.takeawayPrice;
    return { m: m, price: price, total: price * l.qty };
  }
  function cartTotal() { return state.cart.reduce(function (s, l) { return s + lineInfo(l).total; }, 0); }
  function cartCount() { return state.cart.reduce(function (s, l) { return s + l.qty; }, 0); }
  function updateCart() {
    var n = cartCount();
    $("#cartBar").hidden = !ORDERING || n === 0;
    $("#cartCount").textContent = n;
    $("#cartTotalBar").textContent = rupee(cartTotal());
  }
  $("#cartBar").addEventListener("click", function () { renderCart(); openModal($("#cartModal")); });
  function renderCart() {
    $("#cartList").innerHTML = state.cart.map(function (l, i) {
      var x = lineInfo(l);
      return '<li><div><div class="ci-name">' + esc(x.m.name) + '</div><div class="ci-sub">' + (l.type === "dine" ? "Dine-in" : "Takeaway") + " · " + rupee(x.price) + ' each</div></div>' +
        '<div class="ci-price">' + rupee(x.total) + "</div>" +
        '<div class="ci-ctl"><button data-i="' + i + '" data-d="-1" aria-label="Decrease">−</button><b>' + l.qty + '</b><button data-i="' + i + '" data-d="1" aria-label="Increase">+</button></div></li>';
    }).join("");
    $("#cartTotal").textContent = rupee(cartTotal());
  }
  $("#cartList").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var l = state.cart[+b.dataset.i]; l.qty += +b.dataset.d;
    if (l.qty <= 0) state.cart.splice(+b.dataset.i, 1);
    updateCart();
    if (!state.cart.length) closeModal($("#cartModal")); else renderCart();
  });
  $("#clearBtn").addEventListener("click", function () { state.cart = []; updateCart(); closeModal($("#cartModal")); });
  $("#sendBtn").addEventListener("click", function () {
    var lines = state.cart.map(function (l) {
      var x = lineInfo(l);
      return "• " + x.m.name + " (" + (l.type === "dine" ? "Dine-in" : "Takeaway") + ") — " + l.qty + " × " + rupee(x.price) + " = " + rupee(x.total);
    });
    var msg = "Hello " + CFG.brand + "! I'd like to order:\n\n" + lines.join("\n") + "\n\nTotal: " + rupee(cartTotal());
    window.open("https://wa.me/" + CFG.whatsappNumber + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
  });

  /* ---------- PIN-protected availability manager ---------- */
  var ADMIN_PIN = "202610"; // Frontend demo PIN only; use server-side auth for production security.
  var pinModal = $("#availabilityPinModal");
  var managerModal = $("#availabilityManager");
  var pinInput = $("#availabilityPin");
  var pinError = $("#availabilityPinError");
  var adminUnlocked = false;

  function closeAvailabilityModals() {
    pinModal.hidden = true;
    managerModal.hidden = true;
    document.body.style.overflow = "";
    pinInput.value = "";
    pinError.hidden = true;
  }
  function saveAvailability() {
    var values = {};
    MENU.forEach(function (item) { values[item.id] = !!item.available; });
    try { localStorage.setItem(AVAILABILITY_KEY, JSON.stringify(values)); } catch (e) {}
  }
  function renderAvailabilityList() {
    var q = $("#availabilitySearch").value.trim().toLowerCase();
    var filter = $("#availabilityFilter").value;
    var list = MENU.filter(function (item) {
      var matchesText = item.name.toLowerCase().indexOf(q) !== -1;
      var matchesStatus = filter === "all" || (filter === "available" && item.available) || (filter === "unavailable" && !item.available);
      return matchesText && matchesStatus;
    });
    $("#availabilityList").innerHTML = list.map(function (item) {
      var image = item.image ? '<img src="' + esc(item.image) + '" alt="" onerror="this.style.visibility=\'hidden\'">' : '<div class="availability-thumb">🍚</div>';
      return '<div class="availability-row">' + image + '<div><strong>' + esc(item.name) + '</strong><small>' + esc(item.category) + ' · Dine-in ' + rupee(item.dineInPrice) + ' / Takeaway ' + rupee(item.takeawayPrice) + '</small></div>' +
        '<button type="button" class="availability-toggle ' + (item.available ? 'is-on' : 'is-off') + '" data-availability-toggle="' + item.id + '" aria-pressed="' + !!item.available + '">' + (item.available ? '● AVAILABLE' : '● UNAVAILABLE') + '</button></div>';
    }).join("") || '<p class="availability-empty">No matching menu items.</p>';
  }
  $("#availabilityLaunch").addEventListener("click", function () {
    pinModal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(function () { pinInput.focus(); }, 50);
  });
  $("#availabilityPinForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pinInput.value) || pinInput.value !== ADMIN_PIN) {
      pinError.hidden = false;
      pinInput.value = "";
      pinInput.focus();
      return;
    }
    adminUnlocked = true;
    pinModal.hidden = true;
    managerModal.hidden = false;
    pinError.hidden = true;
    pinInput.value = "";
    renderAvailabilityList();
    $("#availabilitySearch").focus();
  });
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-av-close]")) closeAvailabilityModals();
    if (e.target.classList && e.target.classList.contains("availability-overlay")) closeAvailabilityModals();
    var toggle = e.target.closest("[data-availability-toggle]");
    if (toggle && adminUnlocked) {
      var item = MENU.filter(function (m) { return m.id === Number(toggle.dataset.availabilityToggle); })[0];
      if (!item) return;
      item.available = !item.available;
      saveAvailability();
      renderMenu();
      renderAvailabilityList();
    }
  });
  $("#availabilitySearch").addEventListener("input", renderAvailabilityList);
  $("#availabilityFilter").addEventListener("change", renderAvailabilityList);
  $("#availabilityLogout").addEventListener("click", function () { adminUnlocked = false; closeAvailabilityModals(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && (!pinModal.hidden || !managerModal.hidden)) { adminUnlocked = false; closeAvailabilityModals(); }
  });

  /* ---------- Footer (only shows details you filled in) ---------- */
  var info = [];
  if (CFG.location) info.push("📍 " + esc(CFG.location));
  if (CFG.hours) info.push("🕒 " + esc(CFG.hours));
  if (CFG.phone) info.push('📞 <a href="tel:' + esc(CFG.phone.replace(/\s/g, "")) + '">' + esc(CFG.phone) + "</a>");
  if (ORDERING) info.push('💬 <a href="https://wa.me/' + CFG.whatsappNumber + '" rel="noopener">Order on WhatsApp</a>');
  $("#footInfo").innerHTML = info.map(function (s) { return "<li>" + s + "</li>"; }).join("");

  renderCats();
  renderMenu();
  updateCart();
})();
