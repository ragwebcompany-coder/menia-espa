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
  var links = document.querySelector(".nav-links");

  function setNav(open) {
    body.classList.toggle("nav-open", open);
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Κλείσιμο μενού" : "Άνοιγμα μενού");
    }
  }

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = !body.classList.contains("nav-open");
      setNav(open);
      if (open) {
        var first = links.querySelector("a");
        if (first) first.focus();
      }
    });

    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });

    // Escape κλείνει το μενού και επιστρέφει την εστίαση στο κουμπί
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("nav-open")) {
        setNav(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Σκιά κεφαλίδας κατά την κύλιση ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Κινούμενη ταινία: χειριστήριο παύσης (WCAG 2.2.2) ---------- */
  var strip = document.querySelector(".strip");
  var stripBtn = document.querySelector(".strip-pause");
  if (strip && stripBtn) {
    stripBtn.addEventListener("click", function () {
      var paused = strip.classList.toggle("is-paused");
      stripBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      stripBtn.setAttribute("aria-label", paused ? "Συνέχιση κίνησης κειμένου" : "Παύση κίνησης κειμένου");
      stripBtn.textContent = paused ? "▶" : "❚❚";
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
     Φόρμα επικοινωνίας — validation με ανακοίνωση σε screen readers
     ============================================================ */
  var form = document.querySelector("form[data-validate]");
  if (form) {
    var status = form.querySelector(".form-status");

    var showError = function (input, message) {
      var box = document.getElementById(input.id + "-error");
      input.setAttribute("aria-invalid", "true");
      if (box) box.textContent = message;
    };
    var clearError = function (input) {
      var box = document.getElementById(input.id + "-error");
      input.removeAttribute("aria-invalid");
      if (box) box.textContent = "";
    };

    form.addEventListener("submit", function (e) {
      var fields = form.querySelectorAll("[required]");
      var invalid = [];

      Array.prototype.forEach.call(fields, function (input) {
        clearError(input);
        var value = (input.value || "").trim();
        var ok = input.type === "checkbox" ? input.checked : value !== "";
        if (ok && input.type === "email") ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
        if (!ok) {
          invalid.push(input);
          showError(input, input.getAttribute("data-error") || "Το πεδίο είναι υποχρεωτικό.");
        }
      });

      if (invalid.length) {
        e.preventDefault();
        if (status) {
          status.className = "form-status err";
          status.textContent = "Το μήνυμα δεν στάλθηκε: ελέγξτε " + invalid.length +
            (invalid.length === 1 ? " πεδίο που επισημαίνεται παρακάτω." : " πεδία που επισημαίνονται παρακάτω.");
        }
        invalid[0].focus();
        return;
      }

      // Χωρίς ρυθμισμένο endpoint, το μήνυμα ανοίγει στο πρόγραμμα
      // ηλεκτρονικού ταχυδρομείου του χρήστη.
      var mailto = form.getAttribute("data-mailto");
      if (mailto && !form.getAttribute("action")) {
        e.preventDefault();
        var get = function (name) {
          var el = form.querySelector("[name='" + name + "']");
          return el ? (el.value || "").trim() : "";
        };
        var subject = "Αίτημα από τον ιστότοπο — " + (get("subject") || "Επικοινωνία");
        var lines = [
          "Ονοματεπώνυμο: " + get("name"),
          "Email: " + get("email"),
          "Τηλέφωνο: " + (get("phone") || "—"),
          "Θέμα: " + get("subject"),
          "",
          get("message"),
        ];
        window.location.href = "mailto:" + mailto +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(lines.join("\n"));

        if (status) {
          status.className = "form-status ok";
          status.textContent = "Άνοιξε το πρόγραμμα email σας με συμπληρωμένο το μήνυμα. " +
            "Αν δεν άνοιξε, στείλτε το μήνυμά σας απευθείας στο " + mailto + ".";
        }
      }
    });

    // Καθαρισμός σφάλματος μόλις ο χρήστης διορθώσει το πεδίο
    form.addEventListener("input", function (e) {
      if (e.target.hasAttribute("required") && e.target.getAttribute("aria-invalid") === "true") {
        var value = (e.target.value || "").trim();
        var ok = e.target.type === "checkbox" ? e.target.checked : value !== "";
        if (ok) clearError(e.target);
      }
    });
  }

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
