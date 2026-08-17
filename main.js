/* ============================================================
   Κοινή συμπεριφορά UI + εργαλεία προσβασιμότητας
   Γραμμένο σε ES5 ώστε να τρέχει και σε παλαιότερους browsers.
   ============================================================ */
(function () {
  "use strict";

  var body = document.body;
  var STORE = "a11y-prefs";

  /* ---------- Τρέχον έτος στο footer ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Μενού κινητού ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  var overlay = document.querySelector(".nav-overlay");

  function setNav(open) {
    body.classList.toggle("nav-open", open);
    if (overlay) overlay.hidden = !open;
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Κλείσιμο μενού" : "Άνοιγμα μενού");
    }
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = !body.classList.contains("nav-open");
      setNav(open);
      if (open) {
        var first = nav.querySelector("a");
        if (first) first.focus();
      }
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });

    if (overlay) {
      overlay.addEventListener("click", function () {
        setNav(false);
        toggle.focus();
      });
    }

    // Escape κλείνει το μενού και επιστρέφει την εστίαση στο κουμπί
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("nav-open")) {
        setNav(false);
        toggle.focus();
      }
    });
  }

  /* ============================================================
     Widget προσβασιμότητας
     ============================================================ */
  var prefs = { fs: 1, contrast: false, links: false, noanim: false };

  try {
    var saved = window.localStorage.getItem(STORE);
    if (saved) {
      var parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        if (typeof parsed.fs === "number") prefs.fs = parsed.fs;
        prefs.contrast = !!parsed.contrast;
        prefs.links = !!parsed.links;
        prefs.noanim = !!parsed.noanim;
      }
    }
  } catch (err) { /* το localStorage μπορεί να είναι απενεργοποιημένο */ }

  function save() {
    try { window.localStorage.setItem(STORE, JSON.stringify(prefs)); } catch (err) {}
  }

  var scaleOut = document.querySelector(".a11y-scale");

  function apply() {
    document.documentElement.style.setProperty("--fs", String(prefs.fs));
    body.classList.toggle("a11y-contrast", prefs.contrast);
    body.classList.toggle("a11y-links", prefs.links);
    body.classList.toggle("a11y-noanim", prefs.noanim);

    ["contrast", "links", "noanim"].forEach(function (key) {
      var btn = document.querySelector('[data-a11y="' + key + '"]');
      if (btn) btn.setAttribute("aria-pressed", prefs[key] ? "true" : "false");
    });

    if (scaleOut) scaleOut.textContent = "Μέγεθος κειμένου: " + Math.round(prefs.fs * 100) + "%";
  }

  var fab = document.querySelector(".a11y-fab");
  var panel = document.getElementById("a11y-panel");

  function setPanel(open) {
    if (!panel || !fab) return;
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      var first = panel.querySelector("button, a");
      if (first) first.focus();
    }
  }

  if (fab && panel) {
    fab.addEventListener("click", function () { setPanel(panel.hidden); });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) {
        setPanel(false);
        fab.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (panel.hidden) return;
      if (!panel.contains(e.target) && !fab.contains(e.target)) setPanel(false);
    });

    panel.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-a11y]");
      if (!btn) return;
      var action = btn.getAttribute("data-a11y");

      if (action === "fs-up") prefs.fs = Math.min(1.6, Math.round((prefs.fs + 0.1) * 10) / 10);
      else if (action === "fs-down") prefs.fs = Math.max(0.9, Math.round((prefs.fs - 0.1) * 10) / 10);
      else if (action === "reset") prefs = { fs: 1, contrast: false, links: false, noanim: false };
      else if (action === "close") { setPanel(false); fab.focus(); return; }
      else if (action === "contrast" || action === "links" || action === "noanim") prefs[action] = !prefs[action];

      apply();
      save();
    });
  }

  apply();

  /* ============================================================
     Εμφάνιση στοιχείων κατά την κύλιση
     ============================================================ */
  var revealEls = document.querySelectorAll(".reveal");

  if (location.hash === "#showall") {
    body.classList.add("showall");
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add("in"); });
    return;
  }

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || prefs.noanim || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add("in"); });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  Array.prototype.forEach.call(revealEls, function (el, i) {
    el.style.setProperty("--d", (i % 6) * 55 + "ms");
    io.observe(el);
  });
})();
