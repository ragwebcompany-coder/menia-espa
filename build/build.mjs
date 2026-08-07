// ============================================================
//  Static-site generator
//  Εκτέλεση:  node build/build.mjs
// ============================================================
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE, BIZ, BIO, CREDS, SERVICES, AREAS, POSTS, FUNDING } from "./data.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = (p, html) => {
  const full = resolve(ROOT, p);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html.trimStart() + "\n");
};

const rel = (depth, p) => "../".repeat(depth) + p;
const abs = (p) => `${BASE}/${p}`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => esc(s).replace(/"/g, "&quot;");
const pad = (i) => String(i + 1).padStart(2, "0");

const mapQuery = encodeURIComponent(`${BIZ.street}, ${BIZ.area} ${BIZ.postal}`);
const mapUrl = `https://www.google.com/maps?q=${mapQuery}`;

// ---- structured data ------------------------------------------------
const bizLD = {
  "@type": ["Dietitian", "MedicalBusiness", "LocalBusiness"],
  "@id": `${BASE}/#praxis`,
  name: BIZ.name,
  alternateName: BIZ.brand,
  slogan: BIZ.tagline,
  url: BASE + "/",
  telephone: BIZ.phoneIntl,
  email: BIZ.email,
  priceRange: "€€",
  currenciesAccepted: "EUR",
  areaServed: AREAS.map((a) => a.name),
  isAccessibleForFree: false,
  publicAccess: true,
  openingHoursSpecification: [{
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00", closes: "21:00",
  }],
  sameAs: [BIZ.instagram, BIZ.facebook, BIZ.tiktok],
  founder: { "@type": "Person", name: BIZ.person, jobTitle: BIZ.role },
  availableService: SERVICES.map((s) => ({ "@type": "MedicalTherapy", name: s.h1 })),
};

const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;

const breadcrumbLD = (trail) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    item: t.path ? abs(t.path) : undefined,
  })),
});

const faqLD = (faq) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

// ============================================================
//  <head>
//  Σημείωση προσβασιμότητας: το inline script εφαρμόζει τις
//  αποθηκευμένες προτιμήσεις ΠΡΙΝ την πρώτη ζωγραφική, ώστε ο
//  χρήστης να μη βλέπει «αναλαμπή» της προεπιλεγμένης εμφάνισης.
// ============================================================
function head({ depth, title, desc, canonical, keywords, ld = [], type = "website" }) {
  const r = (p) => rel(depth, p);
  const ldTags = ld.map(jsonLd).join("\n  ");
  return `
<!DOCTYPE html>
<html lang="el" class="no-js">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${attr(desc)}" />
  ${keywords ? `<meta name="keywords" content="${attr(keywords)}" />` : ""}
  <meta name="author" content="${attr(BIZ.legalName)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="theme-color" content="#4a1e47" />
  <link rel="canonical" href="${abs(canonical)}" />

  <meta property="og:site_name" content="${attr(BIZ.brand)}" />
  <meta property="og:locale" content="el_GR" />
  <meta property="og:type" content="${type}" />
  <meta property="og:title" content="${attr(title)}" />
  <meta property="og:description" content="${attr(desc)}" />
  <meta property="og:url" content="${abs(canonical)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${attr(title)}" />
  <meta name="twitter:description" content="${attr(desc)}" />

  <link rel="icon" href="${r("assets/favicon.svg")}" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=Jost:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${r("styles.css")}?v=2" />
  <script>
    document.documentElement.classList.remove("no-js");
    try {
      var p = JSON.parse(localStorage.getItem("a11y-prefs") || "{}");
      if (p.fs) document.documentElement.style.setProperty("--fs", p.fs);
      var c = [];
      if (p.contrast) c.push("a11y-contrast");
      if (p.links) c.push("a11y-links");
      if (p.noanim) c.push("a11y-noanim");
      if (c.length) document.documentElement.setAttribute("data-a11y-boot", c.join(" "));
    } catch (e) {}
  </script>${ldTags ? "\n  " + ldTags : ""}
</head>
<body>
  <script>
    (function () {
      var boot = document.documentElement.getAttribute("data-a11y-boot");
      if (boot) document.body.className = boot;
    })();
  </script>`;
}

// ============================================================
//  Header + πλοήγηση
// ============================================================
function header(depth, active = "") {
  const r = (p) => rel(depth, p);
  const on = (k) => (active === k ? ' aria-current="page"' : "");
  const svcLinks = SERVICES.map(
    (s) => `<li><a href="${r("ypiresies/" + s.slug + ".html")}">${esc(s.nav)}</a></li>`
  ).join("\n            ");

  return `
  <nav class="skip-links" aria-label="Σύνδεσμοι παράλειψης">
    <a href="#main">Μετάβαση στο περιεχόμενο</a>
    <a href="#site-nav">Μετάβαση στην πλοήγηση</a>
    <a href="${r("prosvasimotita.html")}">Δήλωση προσβασιμότητας</a>
  </nav>
  <header class="site-header" id="top">
    <nav class="nav container" id="site-nav" aria-label="Κύρια πλοήγηση">
      <a href="${r("index.html")}" class="brand" aria-label="${attr(BIZ.brand)} — Αρχική σελίδα">
        <img src="${r("assets/logo.webp")}" alt="Λογότυπο Μένια Καρανάσιου" class="brand-logo" width="48" height="48" />
        <span>
          <span class="brand-name">${esc(BIZ.brand)}</span>
          <span class="brand-role">${esc(BIZ.role)}</span>
        </span>
      </a>
      <button type="button" class="nav-toggle" aria-label="Άνοιγμα μενού" aria-expanded="false" aria-controls="nav-links">
        <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
      </button>
      <ul class="nav-links" id="nav-links">
        <li><a href="${r("index.html")}"${on("home")}>Αρχική</a></li>
        <li><a href="${r("i-diaitologos.html")}"${on("about")}>Η Διαιτολόγος</a></li>
        <li class="has-sub">
          <a href="${r("ypiresies/index.html")}"${on("services")}>Υπηρεσίες</a>
          <ul class="sub">
            ${svcLinks}
          </ul>
        </li>
        <li><a href="${r("perioches/index.html")}"${on("areas")}>Περιοχές</a></li>
        <li><a href="${r("blog/index.html")}"${on("blog")}>Blog</a></li>
        <li><a href="${r("epikoinonia.html")}"${on("contact")}>Επικοινωνία</a></li>
        <li><a href="${r("epikoinonia.html")}" class="btn btn-nav">Ραντεβού</a></li>
      </ul>
    </nav>
  </header>`;
}

function crumbs(depth, trail) {
  const r = (p) => rel(depth, p);
  const items = trail
    .map((t, i) =>
      i === trail.length - 1
        ? `<span aria-current="page">${esc(t.name)}</span>`
        : `<a href="${r(t.rel)}">${esc(t.name)}</a><span class="sep" aria-hidden="true">/</span>`
    )
    .join(" ");
  return `<nav class="crumbs container" aria-label="Διαδρομή πλοήγησης">${items}</nav>`;
}

function ctaBand(depth) {
  const r = (p) => rel(depth, p);
  return `
  <section class="cta-band" aria-labelledby="cta-title">
    <div class="container cta-inner">
      <div>
        <p class="eyebrow">Κλείστε το ραντεβού σας</p>
        <h2 class="cta-title" id="cta-title">Ας ξεκινήσουμε από το δικό σας πιάτο.</h2>
        <p class="cta-sub">Online, κατόπιν ραντεβού.</p>
      </div>
      <div class="cta-actions">
        <a href="[CALENDLY_URL]" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Κλείστε Ραντεβού (Calendly)</a>
        <a href="tel:${attr(BIZ.phoneIntl)}" class="btn btn-ghost">Καλέστε ${esc(BIZ.phoneDisplay)}</a>
        <a href="${r("epikoinonia.html")}" class="btn btn-ghost">Επικοινωνία</a>
      </div>
    </div>
  </section>`;
}

// ============================================================
//  Footer (με σήματα ΔΥΠΑ + προσβασιμότητας)
// ============================================================
function footer(depth) {
  const r = (p) => rel(depth, p);
  const svcCols = SERVICES.map(
    (s) => `<a href="${r("ypiresies/" + s.slug + ".html")}">${esc(s.nav)}</a>`
  ).join("\n          ");

  return `
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <p class="footer-brand-name">${esc(BIZ.brand)}</p>
        <p class="footer-tag">${esc(BIZ.tagline)}</p>
        <address class="footer-addr">
          Online Συνεδρίες<br />
          Πανελλαδικά &amp; Εξωτερικό
        </address>
        <div class="footer-social">
          <a href="${attr(BIZ.instagram)}" target="_blank" rel="noopener noreferrer">Instagram<span class="visually-hidden"> (ανοίγει σε νέα καρτέλα)</span></a>
          <a href="${attr(BIZ.facebook)}" target="_blank" rel="noopener noreferrer">Facebook<span class="visually-hidden"> (ανοίγει σε νέα καρτέλα)</span></a>
          <a href="${attr(BIZ.tiktok)}" target="_blank" rel="noopener noreferrer">TikTok<span class="visually-hidden"> (ανοίγει σε νέα καρτέλα)</span></a>
        </div>
      </div>

      <div class="footer-col">
        <h2>Υπηρεσίες</h2>
        <nav aria-label="Υπηρεσίες" class="footer-links">
          ${svcCols}
        </nav>
      </div>

      <div class="footer-col">
        <h2>Εξερεύνηση</h2>
        <nav aria-label="Δευτερεύουσα πλοήγηση" class="footer-links">
          <a href="${r("index.html")}">Αρχική</a>
          <a href="${r("i-diaitologos.html")}">Η Διαιτολόγος</a>
          <a href="${r("ypiresies/index.html")}">Όλες οι Υπηρεσίες</a>
          <a href="${r("perioches/index.html")}">Περιοχές</a>
          <a href="${r("blog/index.html")}">Blog</a>
          <a href="${r("prosvasimotita.html")}">Προσβασιμότητα</a>
          <a href="${r("chrimatodotisi.html")}">Χρηματοδότηση</a>
        </nav>
      </div>

      <div class="footer-col">
        <h2>Επικοινωνία</h2>
        <nav aria-label="Στοιχεία επικοινωνίας" class="footer-links">
          <a href="tel:${attr(BIZ.phoneIntl)}">${esc(BIZ.phoneDisplay)}</a>
          <a href="mailto:${attr(BIZ.email)}">${esc(BIZ.email)}</a>
          <a href="${r("epikoinonia.html")}">Φόρμα επικοινωνίας</a>
        </nav>
        <p class="footer-hours">${esc(BIZ.hours)}</p>
      </div>
    </div>

    <div class="footer-marks">
      <div class="footer-mark">
        <img src="${r("assets/accessibility.png")}" alt="" width="44" height="44" class="a11y-keep" />
        <p>Ιστότοπος σχεδιασμένος κατά <strong>WCAG 2.1 επιπέδου AA</strong>. <a href="${r("prosvasimotita.html")}">Δήλωση προσβασιμότητας</a></p>
      </div>
      <div class="footer-mark">
        <img src="${r("assets/dypa-poster.jpg")}" alt="" width="42" height="59" />
        <p>Με τη χρηματοδότηση της Ευρωπαϊκής Ένωσης — NextGenerationEU. <a href="${r("chrimatodotisi.html")}">Στοιχεία χρηματοδότησης &amp; αφίσα</a></p>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="footer-copy">© <span id="year">2026</span> ${esc(BIZ.legalName)}. Με επιφύλαξη παντός δικαιώματος.</p>
      <p class="cb-credit">Made by <a href="https://clinicbrain.gr/?utm_source=client-site&amp;utm_medium=footer&amp;utm_campaign=made-by" target="_blank" rel="noopener noreferrer">CLINICBRAIN</a></p>
    </div>
  </footer>

  ${a11yWidget(depth)}
  <script src="${r("main.js")}" defer></script>
</body>
</html>`;
}

// ============================================================
//  Widget προσβασιμότητας
// ============================================================
function a11yWidget(depth) {
  const r = (p) => rel(depth, p);
  return `<button type="button" class="a11y-fab" aria-expanded="false" aria-controls="a11y-panel" aria-label="Εργαλεία προσβασιμότητας">
    <img src="${r("assets/accessibility.png")}" alt="" width="56" height="56" class="a11y-keep" />
  </button>
  <div class="a11y-panel" id="a11y-panel" role="dialog" aria-label="Εργαλεία προσβασιμότητας" hidden>
    <h2>Προσβασιμότητα</h2>
    <p>Οι ρυθμίσεις αποθηκεύονται στη συσκευή σας.</p>

    <div class="a11y-group">
      <h3>Μέγεθος κειμένου</h3>
      <div class="a11y-row">
        <button type="button" class="a11y-btn" data-a11y="fs-down">A− <span class="visually-hidden">Μείωση μεγέθους κειμένου</span></button>
        <button type="button" class="a11y-btn" data-a11y="fs-up">A+ <span class="visually-hidden">Αύξηση μεγέθους κειμένου</span></button>
      </div>
      <p class="a11y-scale" role="status">Μέγεθος κειμένου: 100%</p>
    </div>

    <div class="a11y-group">
      <h3>Εμφάνιση</h3>
      <div class="a11y-row">
        <button type="button" class="a11y-btn" data-a11y="contrast" aria-pressed="false">Υψηλή αντίθεση</button>
        <button type="button" class="a11y-btn" data-a11y="links" aria-pressed="false">Υπογράμμιση συνδέσμων</button>
        <button type="button" class="a11y-btn" data-a11y="noanim" aria-pressed="false">Χωρίς κινήσεις</button>
      </div>
    </div>

    <div class="a11y-row">
      <button type="button" class="a11y-btn" data-a11y="reset">Επαναφορά</button>
    </div>
    <a class="a11y-panel-link" href="${r("prosvasimotita.html")}">Πλήρης δήλωση προσβασιμότητας</a>
    <button type="button" class="a11y-btn a11y-panel-close" data-a11y="close">Κλείσιμο</button>
  </div>`;
}

// ============================================================
//  ΣΕΛΙΔΑ: ΑΡΧΙΚΗ
// ============================================================
function pageHome() {
  const depth = 0;
  const r = (p) => rel(depth, p);
  const svcCards = SERVICES.map(
    (s, i) => `
          <a class="svc reveal" href="${r("ypiresies/" + s.slug + ".html")}">
            <span class="svc-icon" aria-hidden="true">${s.icon}</span>
            <span class="svc-num">${pad(i)}</span>
            <h3>${esc(s.h1)}</h3>
            <p>${esc(s.lead)}</p>
            <span class="svc-more">Μάθετε περισσότερα<span class="visually-hidden"> για ${esc(s.h1)}</span> →</span>
          </a>`
  ).join("");

  const ld = [
    { "@context": "https://schema.org", ...bizLD },
    { "@context": "https://schema.org", "@type": "WebSite", name: BIZ.brand, url: BASE + "/", inLanguage: "el" },
    breadcrumbLD([{ name: "Αρχική", path: "index.html" }]),
  ];

  return head({
    depth,
    title: `Διαιτολόγος ${BIZ.city} | ${BIZ.brand} — Διατροφολόγος`,
    desc: `${BIZ.name}. Εξατομικευμένα προγράμματα διατροφής, κλινική διατροφή, παιδική & αθλητική διατροφή. Αποκλειστικά online συνεδρίες.`,
    canonical: "index.html",
    keywords: `διαιτολόγος ${BIZ.city}, διατροφολόγος ${BIZ.area}, πρόγραμμα διατροφής, κλινική διατροφή, online διαιτολόγος`,
    ld,
  }) +
    header(depth, "home") +
    `
  <main id="main">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-inner container">
        <p class="eyebrow reveal">${esc(BIZ.role)} · ${esc(BIZ.area)}</p>
        <h1 class="hero-title reveal" id="hero-title">Η διατροφή που<br /><em>σου ταιριάζει.</em></h1>
        <p class="hero-lead reveal">Χωρίς στερήσεις, ενοχές και «απαγορευμένα» τρόφιμα. Ένα πρόγραμμα χτισμένο γύρω από την καθημερινότητα, τις προτιμήσεις και τους στόχους σας.</p>
        <div class="hero-actions reveal">
          <a href="${r("epikoinonia.html")}" class="btn btn-primary">Κλείστε Ραντεβού</a>
          <a href="${r("ypiresies/index.html")}" class="btn btn-ghost">Οι Υπηρεσίες</a>
        </div>
        <div class="hero-badges reveal">
          <p class="hero-badge">
            <img src="${r("assets/accessibility.png")}" alt="" width="32" height="32" class="a11y-keep" />
            <span>Προσβάσιμος ιστότοπος κατά WCAG 2.1 AA — <a href="${r("prosvasimotita.html")}">δήλωση προσβασιμότητας</a></span>
          </p>
        </div>
      </div>
    </section>

    <div class="strip">
      <div class="strip-track" aria-hidden="true">
        <span>Εξατομικευμένα προγράμματα</span><span class="dot">•</span>
        <span>Κλινική διατροφή</span><span class="dot">•</span>
        <span>Προσβάσιμη φροντίδα</span><span class="dot">•</span>
        <span>Online συνεδρίες</span><span class="dot">•</span>
        <span>Εξατομικευμένα προγράμματα</span><span class="dot">•</span>
        <span>Κλινική διατροφή</span><span class="dot">•</span>
        <span>Προσβάσιμη φροντίδα</span><span class="dot">•</span>
        <span>Online συνεδρίες</span><span class="dot">•</span>
      </div>
      <button type="button" class="strip-pause" aria-pressed="false" aria-label="Παύση κίνησης κειμένου">❚❚</button>
    </div>

    <section class="about" aria-labelledby="about-title">
      <div class="container about-grid">
        <div class="about-media reveal">
          <img src="${r(BIZ.portrait)}" alt="${attr(BIZ.person)}, ${attr(BIZ.role)}, στο γραφείο της" width="984" height="1050" />
          <p class="about-badge">
            <span class="about-badge-num" aria-hidden="true">✓</span>
            <span class="about-badge-label">Εξατομικευμένη προσέγγιση<br />σε κάθε περιστατικό</span>
          </p>
        </div>
        <div class="about-copy">
          <p class="eyebrow reveal">Η Διαιτολόγος</p>
          <h2 class="section-title reveal" id="about-title">${esc(BIZ.person)}</h2>
          <p class="about-role reveal">${esc(BIZ.role)}</p>
          <p class="reveal">${esc(BIO[0])}</p>
          <p class="reveal">${esc(BIO[1])}</p>
          <p class="reveal"><a href="${r("i-diaitologos.html")}" class="btn btn-ghost">Το πλήρες βιογραφικό →</a></p>
        </div>
      </div>
    </section>

    <section class="services" aria-labelledby="services-title">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Υπηρεσίες</p>
          <h2 class="section-title" id="services-title">Διατροφική φροντίδα<br />για κάθε στάδιο της ζωής</h2>
        </div>
        <div class="services-grid">${svcCards}
        </div>
      </div>
    </section>

    <section class="process" aria-labelledby="process-title">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Πώς δουλεύουμε</p>
          <h2 class="section-title" id="process-title">Τέσσερα απλά βήματα</h2>
        </div>
        <ol class="steps">
          <li class="step reveal"><p class="step-num" aria-hidden="true">1</p><h3>Πρώτη συνεδρία</h3><p>Παίρνουμε αναλυτικό ιστορικό: συνήθειες, ωράριο, εξετάσεις, στόχοι. Χωρίς κρίση για το πού βρίσκεστε σήμερα.</p></li>
          <li class="step reveal"><p class="step-num" aria-hidden="true">2</p><h3>Αξιολόγηση</h3><p>Αξιολογούμε τη διατροφική σας κατάσταση με βάση εξετάσεις, ημερολόγιο διατροφής και μετρήσεις που μπορείτε να κάνετε στο σπίτι.</p></li>
          <li class="step reveal"><p class="step-num" aria-hidden="true">3</p><h3>Το πρόγραμμά σας</h3><p>Ένα πλάνο με εναλλακτικές, συνταγές και λύσεις για τις δύσκολες μέρες — όχι μια λίστα απαγορεύσεων.</p></li>
          <li class="step reveal"><p class="step-num" aria-hidden="true">4</p><h3>Παρακολούθηση</h3><p>Τακτικοί επανέλεγχοι και προσαρμογές, μέχρι το πρόγραμμα να γίνει απλώς ο τρόπος που τρώτε.</p></li>
        </ol>
      </div>
    </section>

    <section class="philosophy" aria-labelledby="philosophy-title">
      <div class="container philosophy-inner reveal">
        <p class="eyebrow" id="philosophy-title">Η Φιλοσοφία μου</p>
        <span class="philosophy-mark" aria-hidden="true">&ldquo;</span>
        <blockquote>Δεν υπάρχει μία δίαιτα που ταιριάζει σε όλους. Υπάρχει <em>το δικό σας πρόγραμμα</em> — αυτό που μπορείτε να ακολουθήσετε και μετά τον τρίτο μήνα.</blockquote>
        <cite class="philosophy-cite">${esc(BIZ.person)} · ${esc(BIZ.role)}</cite>
      </div>
    </section>

    <section class="areas-teaser" aria-labelledby="areas-title">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Περιοχές</p>
          <h2 class="section-title" id="areas-title">Κοντά σας — ή online</h2>
        </div>
        <div class="chips reveal">
          ${AREAS.map((a) => `<a href="${r("perioches/" + a.slug + ".html")}" class="chip">${esc(a.name)}</a>`).join("\n          ")}
        </div>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ============================================================
//  ΣΕΛΙΔΑ: Η ΔΙΑΙΤΟΛΟΓΟΣ
// ============================================================
function pageAbout() {
  const depth = 0;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Η Διαιτολόγος", rel: "i-diaitologos.html", path: "i-diaitologos.html" },
  ];
  const ld = [
    breadcrumbLD(trail),
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: BIZ.person,
      jobTitle: BIZ.role,
      url: abs("i-diaitologos.html"),
      worksFor: { "@id": `${BASE}/#praxis` },
      sameAs: [BIZ.instagram, BIZ.facebook, BIZ.tiktok],
    },
  ];

  return head({
    depth,
    title: `${BIZ.person} — ${BIZ.role} | Βιογραφικό`,
    desc: `Γνωρίστε τη ${BIZ.person}, ${BIZ.role}. Εξειδίκευση στην κλινική διατροφή, τη διαχείριση βάρους και τη διατροφική υποστήριξη σε κάθε ηλικία.`,
    canonical: "i-diaitologos.html",
    keywords: `${BIZ.person}, διαιτολόγος βιογραφικό, διατροφολόγος ${BIZ.city}`,
    ld,
    type: "profile",
  }) +
    header(depth, "about") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="about" aria-labelledby="bio-title">
      <div class="container about-grid">
        <div class="about-media reveal">
          <img src="${r(BIZ.portrait)}" alt="Πορτρέτο της ${attr(BIZ.person)}, ${attr(BIZ.role)}" width="984" height="1050" />
        </div>
        <div class="about-copy">
          <p class="eyebrow reveal">Η Διαιτολόγος</p>
          <h1 class="section-title reveal" id="bio-title">${esc(BIZ.person)}</h1>
          <p class="about-role reveal">${esc(BIZ.role)}</p>
          ${BIO.map((p) => `<p class="reveal">${esc(p)}</p>`).join("\n          ")}
        </div>
      </div>
    </section>

    <section class="creds" aria-labelledby="creds-title">
      <div class="container">
        <h2 class="section-title reveal" id="creds-title">Σπουδές &amp; εξειδίκευση</h2>
        <div class="creds-grid">
          ${CREDS.map(([k, v]) => `<div class="cred reveal"><span class="cred-k">${esc(k)}</span><span class="cred-v">${esc(v)}</span></div>`).join("\n          ")}
        </div>
      </div>
    </section>

    <section class="philosophy" aria-labelledby="phil2-title">
      <div class="container philosophy-inner reveal">
        <p class="eyebrow" id="phil2-title">Η Φιλοσοφία μου</p>
        <span class="philosophy-mark" aria-hidden="true">&ldquo;</span>
        <blockquote>Στόχος δεν είναι η <em>τέλεια εβδομάδα</em>, αλλά οι αλλαγές που αντέχουν στον χρόνο.</blockquote>
        <cite class="philosophy-cite">${esc(BIZ.person)} · ${esc(BIZ.role)}</cite>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ============================================================
//  ΣΕΛΙΔΑ: ΥΠΗΡΕΣΙΕΣ (hub)
// ============================================================
function pageServicesHub() {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Υπηρεσίες", rel: "ypiresies/index.html", path: "ypiresies/index.html" },
  ];
  const cards = SERVICES.map(
    (s, i) => `
          <a class="svc reveal" href="${r("ypiresies/" + s.slug + ".html")}">
            <span class="svc-icon" aria-hidden="true">${s.icon}</span>
            <span class="svc-num">${pad(i)}</span>
            <h2>${esc(s.h1)}</h2>
            <p>${esc(s.lead)}</p>
            <span class="svc-more">Μάθετε περισσότερα<span class="visually-hidden"> για ${esc(s.h1)}</span> →</span>
          </a>`
  ).join("");

  const ld = [
    breadcrumbLD(trail),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: SERVICES.map((s, i) => ({
        "@type": "ListItem", position: i + 1, name: s.h1, url: abs("ypiresies/" + s.slug + ".html"),
      })),
    },
  ];

  return head({
    depth,
    title: `Υπηρεσίες Διατροφής | ${BIZ.brand}`,
    desc: "Όλες οι υπηρεσίες: εξατομικευμένο πρόγραμμα διατροφής, λιπομέτρηση, κλινική διατροφή, εγκυμοσύνη, παιδιά, αθλητική διατροφή, γαστρεντερικά, ΑμεΑ & online συνεδρίες.",
    canonical: "ypiresies/index.html",
    keywords: "υπηρεσίες διαιτολόγου, πρόγραμμα διατροφής, λιπομέτρηση, κλινική διατροφή, αθλητική διατροφή",
    ld,
  }) +
    header(depth, "services") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Υπηρεσίες</p>
        <h1 class="page-title reveal">Ολοκληρωμένη διατροφική υποστήριξη</h1>
        <p class="page-lead reveal">Από τη διαχείριση βάρους και την κλινική διατροφή μέχρι την εγκυμοσύνη, τα παιδιά και τον αθλητισμό — με εξατομικευμένο σχεδιασμό σε κάθε περίπτωση.</p>
      </div>
    </section>
    <section class="services services--hub" aria-label="Κατάλογος υπηρεσιών">
      <div class="container">
        <div class="services-grid">${cards}
        </div>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ============================================================
//  ΣΕΛΙΔΑ: ΥΠΗΡΕΣΙΑ (detail)
// ============================================================
function pageService(s, idx) {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Υπηρεσίες", rel: "ypiresies/index.html", path: "ypiresies/index.html" },
    { name: s.nav, rel: "ypiresies/" + s.slug + ".html", path: "ypiresies/" + s.slug + ".html" },
  ];
  const related = SERVICES.filter((x) => x.slug !== s.slug).slice(0, 4);
  const ld = [
    breadcrumbLD(trail),
    {
      "@context": "https://schema.org",
      "@type": "MedicalTherapy",
      name: s.h1,
      description: s.desc,
      url: abs("ypiresies/" + s.slug + ".html"),
      provider: { "@id": `${BASE}/#praxis` },
    },
    faqLD(s.faq),
  ];

  return head({
    depth,
    title: `${s.metaTitle} | ${BIZ.brand}`,
    desc: s.desc,
    canonical: "ypiresies/" + s.slug + ".html",
    keywords: s.keywords,
    ld,
    type: "article",
  }) +
    header(depth, "services") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <span class="svc-hero-icon" aria-hidden="true">${s.icon}</span>
        <p class="eyebrow reveal">Υπηρεσία ${pad(idx)}</p>
        <h1 class="page-title reveal">${esc(s.h1)}</h1>
        <p class="page-lead reveal">${esc(s.lead)}</p>
        <p class="hero-actions reveal"><a href="${r("epikoinonia.html")}" class="btn btn-primary">Κλείστε Ραντεβού</a></p>
      </div>
    </section>

    <section class="svc-detail">
      <div class="container svc-detail-grid">
        <article class="svc-body">
          ${s.body.map((p) => `<p class="reveal">${esc(p)}</p>`).join("\n          ")}

          <h2 class="reveal">Τι περιλαμβάνει</h2>
          <ul class="ticks">
            ${s.includes.map((i) => `<li class="reveal">${esc(i)}</li>`).join("\n            ")}
          </ul>

          <h2 class="reveal">Συχνές ερωτήσεις</h2>
          <div class="faq">
            ${s.faq.map(([q, a]) => `<details class="faq-item reveal"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n            ")}
          </div>

          <p class="article-disclaimer">Οι πληροφορίες της σελίδας έχουν ενημερωτικό χαρακτήρα και δεν υποκαθιστούν την εξατομικευμένη διατροφική ή ιατρική συμβουλή.</p>
        </article>

        <aside class="svc-aside" aria-label="Πλαϊνές πληροφορίες">
          <div class="aside-card reveal">
            <h2>Κλείστε ραντεβού</h2>
            <p>Αποκλειστικά διαδικτυακά, κατόπιν ραντεβού.</p>
            <a href="[CALENDLY_URL]" class="btn btn-primary btn-block" target="_blank" rel="noopener noreferrer">Κλείστε Ραντεβού</a>
            <a href="tel:${attr(BIZ.phoneIntl)}" class="btn btn-ghost btn-block">${esc(BIZ.phoneDisplay)}</a>
            <a href="mailto:${attr(BIZ.email)}" class="btn btn-ghost btn-block">${esc(BIZ.email)}</a>
            <p class="aside-meta">Online Συνεδρίες<br />Πανελλαδικά &amp; Εξωτερικό</p>
          </div>
          <div class="aside-card reveal">
            <h2>Άλλες υπηρεσίες</h2>
            <nav class="aside-links" aria-label="Σχετικές υπηρεσίες">
              ${related.map((x) => `<a href="${r("ypiresies/" + x.slug + ".html")}">${esc(x.nav)} →</a>`).join("\n              ")}
            </nav>
          </div>
        </aside>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ============================================================
//  ΣΕΛΙΔΕΣ: ΠΕΡΙΟΧΕΣ
// ============================================================
function pageAreasHub() {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Περιοχές", rel: "perioches/index.html", path: "perioches/index.html" },
  ];
  const cards = AREAS.map(
    (a) => `
          <a class="area-card reveal" href="${r("perioches/" + a.slug + ".html")}">
            <h2>${esc(a.name)}</h2>
            <p>${esc(a.blurb)}</p>
            <span class="svc-more">Δείτε περισσότερα<span class="visually-hidden"> για ${esc(a.name)}</span> →</span>
          </a>`
  ).join("");

  return head({
    depth,
    title: `Περιοχές που Εξυπηρετούμε | ${BIZ.brand}`,
    desc: `Διαιτολόγος – Διατροφολόγος με έδρα στην ${BIZ.area}, ${BIZ.city}. Δια ζώσης ραντεβού και διαδικτυακές συνεδρίες σε όλη την Ελλάδα και το εξωτερικό.`,
    canonical: "perioches/index.html",
    keywords: `διαιτολόγος ${BIZ.city}, διατροφολόγος ${BIZ.area}, online διαιτολόγος`,
    ld: [breadcrumbLD(trail)],
  }) +
    header(depth, "areas") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Περιοχές</p>
        <h1 class="page-title reveal">Κοντά σας — ή όπου κι αν βρίσκεστε</h1>
        <p class="page-lead reveal">Με έδρα στην ${esc(BIZ.area)}, εξυπηρετούμε δια ζώσης τις γύρω περιοχές και, μέσω διαδικτυακών συνεδριών, όλη την Ελλάδα και το εξωτερικό.</p>
      </div>
    </section>
    <section class="areas" aria-label="Περιοχές εξυπηρέτησης">
      <div class="container">
        <div class="areas-grid">${cards}
        </div>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

function pageArea(a) {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Περιοχές", rel: "perioches/index.html", path: "perioches/index.html" },
    { name: a.name, rel: "perioches/" + a.slug + ".html", path: "perioches/" + a.slug + ".html" },
  ];
  const localFaq = [
    ["Πού βρίσκεται το γραφείο;", `Το γραφείο βρίσκεται στην οδό ${BIZ.street}, ${BIZ.area}, ${BIZ.city}, Τ.Κ. ${BIZ.postal}, με εύκολη πρόσβαση από ${a.name}.`],
    ["Πώς κλείνω ραντεβού;", `Καλέστε στο ${BIZ.phoneDisplay}, στείλτε email στο ${BIZ.email} ή συμπληρώστε τη φόρμα επικοινωνίας. Λειτουργούμε κατόπιν ραντεβού.`],
    ["Μπορώ να κάνω τη συνεδρία online;", "Ναι. Οι διαδικτυακές συνεδρίες έχουν την ίδια δομή με τις δια ζώσης και είναι ιδανικές αν δυσκολεύεστε να μετακινηθείτε."],
  ];

  return head({
    depth,
    title: a.title,
    desc: a.desc,
    canonical: "perioches/" + a.slug + ".html",
    keywords: a.keywords,
    ld: [breadcrumbLD(trail), { "@context": "https://schema.org", ...bizLD, areaServed: a.name }, faqLD(localFaq)],
  }) +
    header(depth, "areas") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Περιοχή εξυπηρέτησης</p>
        <h1 class="page-title reveal">${esc(a.h1)}</h1>
        <p class="page-lead reveal">${esc(a.blurb)}</p>
        <p class="hero-actions reveal">
          <a href="tel:${attr(BIZ.phoneIntl)}" class="btn btn-primary">Καλέστε ${esc(BIZ.phoneDisplay)}</a>
          <a href="${r("epikoinonia.html")}" class="btn btn-ghost">Επικοινωνία &amp; Χάρτης</a>
        </p>
      </div>
    </section>

    <section class="svc-detail">
      <div class="container svc-detail-grid">
        <article class="svc-body">
          <h2 class="reveal">Υπηρεσίες για κατοίκους ${esc(a.name)}</h2>
          <ul class="ticks two-col">
            ${SERVICES.map((s) => `<li class="reveal"><a href="${r("ypiresies/" + s.slug + ".html")}">${esc(s.h1)}</a></li>`).join("\n            ")}
          </ul>
          <h2 class="reveal">Συχνές ερωτήσεις</h2>
          <div class="faq">
            ${localFaq.map(([q, ans]) => `<details class="faq-item reveal"><summary>${esc(q)}</summary><p>${esc(ans)}</p></details>`).join("\n            ")}
          </div>
        </article>
        <aside class="svc-aside" aria-label="Στοιχεία επικοινωνίας">
          <div class="aside-card reveal">
            <h2>Στοιχεία επικοινωνίας</h2>
            <p class="aside-meta">${esc(BIZ.street)}, ${esc(BIZ.area)}<br />${esc(BIZ.city)}, ${esc(BIZ.postal)}</p>
            <a href="[CALENDLY_URL]" class="btn btn-primary btn-block" target="_blank" rel="noopener noreferrer">Κλείστε Ραντεβού</a>
            <a href="tel:${attr(BIZ.phoneIntl)}" class="btn btn-ghost btn-block">${esc(BIZ.phoneDisplay)}</a>
            <a href="mailto:${attr(BIZ.email)}" class="btn btn-ghost btn-block">${esc(BIZ.email)}</a>
            <p class="aside-meta">Online Συνεδρίες</p>
          </div>
        </aside>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ============================================================
//  ΣΕΛΙΔΕΣ: BLOG
// ============================================================
function fmtDate(iso) {
  const months = ["Ιανουαρίου","Φεβρουαρίου","Μαρτίου","Απριλίου","Μαΐου","Ιουνίου","Ιουλίου","Αυγούστου","Σεπτεμβρίου","Οκτωβρίου","Νοεμβρίου","Δεκεμβρίου"];
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${months[m - 1]} ${y}`;
}

function pageBlogHub() {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Blog", rel: "blog/index.html", path: "blog/index.html" },
  ];
  const posts = [...POSTS].sort((x, y) => (x.date < y.date ? 1 : -1));
  const cards = posts.map(
    (p) => `
          <a class="post-card reveal" href="${r("blog/" + p.slug + ".html")}">
            <span class="post-cat">${esc(p.cat)}</span>
            <h2>${esc(p.title)}</h2>
            <p>${esc(p.excerpt)}</p>
            <time datetime="${p.date}">${fmtDate(p.date)}</time>
          </a>`
  ).join("");

  return head({
    depth,
    title: `Blog Διατροφής | ${BIZ.brand}`,
    desc: "Άρθρα και οδηγοί για τη διατροφή: πρωτεΐνη, διαχείριση βάρους, διαβήτης, φούσκωμα, παιδική διατροφή και διατροφική φροντίδα ατόμων με αναπηρία.",
    canonical: "blog/index.html",
    keywords: "blog διατροφής, άρθρα διαιτολόγου, οδηγοί διατροφής",
    ld: [breadcrumbLD(trail), { "@context": "https://schema.org", "@type": "Blog", name: `${BIZ.brand} — Blog`, url: abs("blog/index.html"), inLanguage: "el" }],
  }) +
    header(depth, "blog") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Blog</p>
        <h1 class="page-title reveal">Τεκμηριωμένη ενημέρωση για τη διατροφή</h1>
        <p class="page-lead reveal">Πρακτικοί οδηγοί και απαντήσεις σε ερωτήσεις που ακούω καθημερινά στο γραφείο.</p>
      </div>
    </section>
    <section class="posts" aria-label="Άρθρα">
      <div class="container">
        <div class="posts-grid">${cards}
        </div>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

function pagePost(p) {
  const depth = 1;
  const r = (pp) => rel(depth, pp);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Blog", rel: "blog/index.html", path: "blog/index.html" },
    { name: p.title, rel: "blog/" + p.slug + ".html", path: "blog/" + p.slug + ".html" },
  ];
  const relatedSvc = SERVICES.find((s) => s.slug === p.related);
  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 3);
  const bodyHtml = p.body
    .map(([h, t]) => (h ? `<h2 class="reveal">${esc(h)}</h2>\n          <p class="reveal">${esc(t)}</p>` : `<p class="reveal lead-p">${esc(t)}</p>`))
    .join("\n          ");

  return head({
    depth,
    title: `${p.metaTitle} | ${BIZ.brand}`,
    desc: p.desc,
    canonical: "blog/" + p.slug + ".html",
    keywords: p.keywords,
    ld: [
      breadcrumbLD(trail),
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: p.title,
        description: p.desc,
        datePublished: p.date,
        dateModified: p.date,
        inLanguage: "el",
        mainEntityOfPage: abs("blog/" + p.slug + ".html"),
        author: { "@type": "Person", name: BIZ.person },
        publisher: { "@id": `${BASE}/#praxis` },
      },
      faqLD(p.faq),
    ],
    type: "article",
  }) +
    header(depth, "blog") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <article class="article">
      <header class="article-head">
        <div class="container article-head-inner">
          <p><span class="post-cat">${esc(p.cat)}</span></p>
          <h1 class="page-title reveal">${esc(p.title)}</h1>
          <p class="article-meta reveal"><time datetime="${p.date}">${fmtDate(p.date)}</time> · ${esc(BIZ.person)}</p>
        </div>
      </header>
      <div class="container article-body">
        <div class="article-copy">
          ${bodyHtml}

          <h2 class="reveal">Συχνές ερωτήσεις</h2>
          <div class="faq">
            ${p.faq.map(([q, a]) => `<details class="faq-item reveal"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n            ")}
          </div>

          ${relatedSvc ? `<div class="article-cta reveal">
            <p>Σχετική υπηρεσία: <a href="${r("ypiresies/" + relatedSvc.slug + ".html")}"><strong>${esc(relatedSvc.h1)}</strong></a>. Κλείστε ραντεβού στο <a href="tel:${attr(BIZ.phoneIntl)}">${esc(BIZ.phoneDisplay)}</a>.</p>
          </div>` : ""}

          <p class="article-disclaimer">Το άρθρο έχει ενημερωτικό χαρακτήρα και δεν υποκαθιστά την εξατομικευμένη διατροφική ή ιατρική συμβουλή. Για την περίπτωσή σας, απευθυνθείτε σε επαγγελματία υγείας.</p>
        </div>
        <aside class="article-aside" aria-label="Σχετικά άρθρα">
          <div class="aside-card reveal">
            <h2>Διαβάστε επίσης</h2>
            <nav class="aside-links" aria-label="Άλλα άρθρα">
              ${others.map((o) => `<a href="${r("blog/" + o.slug + ".html")}">${esc(o.title)} →</a>`).join("\n              ")}
            </nav>
          </div>
        </aside>
      </div>
    </article>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ============================================================
//  ΣΕΛΙΔΑ: ΕΠΙΚΟΙΝΩΝΙΑ (με προσβάσιμη φόρμα)
// ============================================================
function pageContact() {
  const depth = 0;
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Επικοινωνία", rel: "epikoinonia.html", path: "epikoinonia.html" },
  ];

  return head({
    depth,
    title: `Επικοινωνία & Ραντεβού | ${BIZ.brand}`,
    desc: `Επικοινωνήστε με τη ${BIZ.person}, ${BIZ.role}. ${BIZ.street}, ${BIZ.area} ${BIZ.postal}. Τηλέφωνο ${BIZ.phoneDisplay}, ${BIZ.email}. Δια ζώσης & online ραντεβού.`,
    canonical: "epikoinonia.html",
    keywords: `επικοινωνία διαιτολόγος ${BIZ.city}, ραντεβού διατροφολόγος, τηλέφωνο διαιτολόγου`,
    ld: [breadcrumbLD(trail), { "@context": "https://schema.org", ...bizLD }],
  }) +
    header(depth, "contact") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="contact" aria-labelledby="contact-title">
      <div class="container contact-grid">
        <div class="contact-copy">
          <p class="eyebrow reveal">Επικοινωνία</p>
          <h1 class="section-title reveal" id="contact-title">Κλείστε το ραντεβού σας</h1>
          <p class="contact-note reveal">Το γραφείο λειτουργεί <strong>κατόπιν ραντεβού</strong>. Καλέστε, στείλτε email ή συμπληρώστε τη φόρμα και θα επικοινωνήσω μαζί σας.</p>

          <ul class="contact-list">
            <li class="reveal"><span class="contact-label">Ωράριο</span><span class="contact-value">${esc(BIZ.hoursShort)}<br /><em>κατόπιν ραντεβού</em></span></li>
            <li class="reveal"><span class="contact-label">Διεύθυνση</span><span class="contact-value">Online Συνεδρίες<br /><em>Πανελλαδικά &amp; Εξωτερικό</em></span></li>
            <li class="reveal"><span class="contact-label">Τηλέφωνο</span><span class="contact-value"><a href="tel:${attr(BIZ.phoneIntl)}">${esc(BIZ.phoneDisplay)}</a></span></li>
            <li class="reveal"><span class="contact-label">Email</span><span class="contact-value"><a href="mailto:${attr(BIZ.email)}">${esc(BIZ.email)}</a></span></li>
            <li class="reveal"><span class="contact-label">Social</span><span class="contact-value"><a href="${attr(BIZ.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a> · <a href="${attr(BIZ.facebook)}" target="_blank" rel="noopener noreferrer">Facebook</a> · <a href="${attr(BIZ.tiktok)}" target="_blank" rel="noopener noreferrer">TikTok</a><br /><em>${esc(BIZ.social)}</em></span></li>
            <li class="reveal"><span class="contact-label">Προσβασιμότητα</span><span class="contact-value">Δείτε τις <a href="prosvasimotita.html">πληροφορίες πρόσβασης στον χώρο</a>.</span></li>
          </ul>

          <div class="contact-actions reveal">
            <a href="tel:${attr(BIZ.phoneIntl)}" class="btn btn-primary">Καλέστε μας</a>
            <a href="mailto:${attr(BIZ.email)}" class="btn btn-ghost">Στείλτε Email</a>
          </div>
        </div>

        <div>
          <h2 class="section-title reveal" id="form-title">Φόρμα επικοινωνίας</h2>
          <form class="form" data-validate data-mailto="${attr(BIZ.email)}" aria-labelledby="form-title" novalidate>
            <p class="form-status" role="alert" aria-live="assertive"></p>

            <p class="field-hint">Τα πεδία με <span class="req" aria-hidden="true">*</span> είναι υποχρεωτικά.</p>

            <div class="field">
              <label for="f-name">Ονοματεπώνυμο <span class="req" aria-hidden="true">*</span><span class="visually-hidden">(υποχρεωτικό)</span></label>
              <input type="text" id="f-name" name="name" autocomplete="name" required
                     data-error="Συμπληρώστε το ονοματεπώνυμό σας."
                     aria-describedby="f-name-error" />
              <p class="field-error" id="f-name-error"></p>
            </div>

            <div class="field">
              <label for="f-email">Email <span class="req" aria-hidden="true">*</span><span class="visually-hidden">(υποχρεωτικό)</span></label>
              <input type="email" id="f-email" name="email" autocomplete="email" required
                     data-error="Συμπληρώστε μια έγκυρη διεύθυνση email, π.χ. onoma@example.gr."
                     aria-describedby="f-email-hint f-email-error" />
              <p class="hint" id="f-email-hint">Θα χρησιμοποιηθεί μόνο για να σας απαντήσω.</p>
              <p class="field-error" id="f-email-error"></p>
            </div>

            <div class="field">
              <label for="f-phone">Τηλέφωνο</label>
              <input type="tel" id="f-phone" name="phone" autocomplete="tel" aria-describedby="f-phone-hint" />
              <p class="hint" id="f-phone-hint">Προαιρετικό, αν προτιμάτε τηλεφωνική επικοινωνία.</p>
            </div>

            <div class="field">
              <label for="f-subject">Θέμα</label>
              <select id="f-subject" name="subject">
                <option>Ραντεβού στο γραφείο</option>
                <option>Online συνεδρία</option>
                <option>Πληροφορίες για υπηρεσία</option>
                <option>Άλλο</option>
              </select>
            </div>

            <div class="field">
              <label for="f-message">Μήνυμα <span class="req" aria-hidden="true">*</span><span class="visually-hidden">(υποχρεωτικό)</span></label>
              <textarea id="f-message" name="message" required rows="6"
                        data-error="Γράψτε μας λίγα λόγια για το αίτημά σας."
                        aria-describedby="f-message-error"></textarea>
              <p class="field-error" id="f-message-error"></p>
            </div>

            <div class="field checkbox">
              <input type="checkbox" id="f-consent" name="consent" required
                     data-error="Χρειάζεται η συγκατάθεσή σας για να επεξεργαστούμε το αίτημα."
                     aria-describedby="f-consent-error" />
              <label for="f-consent">Συναινώ στην επεξεργασία των στοιχείων μου για να απαντηθεί το αίτημά μου. <span class="req" aria-hidden="true">*</span></label>
            </div>
            <p class="field-error" id="f-consent-error"></p>

            <p><button type="submit" class="btn btn-primary">Αποστολή μηνύματος</button></p>
          </form>
        </div>
      </div>
    </section>

    <section class="contact" style="padding-top:0" aria-labelledby="calendly-title">
      <div class="container">
        <h2 class="section-title reveal" id="calendly-title">Ή κλείστε ραντεβού online</h2>
        <p class="reveal">Κλείστε απευθείας ραντεβού μέσω Calendly, χωρίς αναμονή.</p>
        <div class="contact-actions reveal" style="margin-top:2rem">
          <a href="[CALENDLY_URL]" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Κλείστε ραντεβού (Calendly)</a>
          <a href="#form-title" class="btn btn-ghost">Φόρμα επικοινωνίας</a>
        </div>
      </div>
    </section>
  </main>` +
    footer(depth);
}

// ============================================================
//  ΣΕΛΙΔΑ: ΔΗΛΩΣΗ ΠΡΟΣΒΑΣΙΜΟΤΗΤΑΣ
// ============================================================
function pageAccessibility() {
  const depth = 0;
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Προσβασιμότητα", rel: "prosvasimotita.html", path: "prosvasimotita.html" },
  ];
  const today = new Date().toISOString().slice(0, 10);

  return head({
    depth,
    title: `Δήλωση Προσβασιμότητας | ${BIZ.brand}`,
    desc: "Δήλωση προσβασιμότητας: συμμόρφωση με WCAG 2.1 επιπέδου AA, μέτρα προσβασιμότητας του ιστότοπου, πρόσβαση στον χώρο και τρόποι υποβολής παρατηρήσεων.",
    canonical: "prosvasimotita.html",
    keywords: "δήλωση προσβασιμότητας, WCAG 2.1 AA, προσβασιμότητα ιστότοπου, ΑμεΑ",
    ld: [breadcrumbLD(trail)],
  }) +
    header(depth) +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Προσβασιμότητα</p>
        <h1 class="page-title reveal">Δήλωση Προσβασιμότητας</h1>
        <p class="page-lead reveal">Δεσμευόμαστε να καθιστούμε τον ιστότοπο και τις υπηρεσίες μας προσβάσιμες σε όλους, ανεξαρτήτως αναπηρίας ή τεχνολογίας πρόσβασης.</p>
      </div>
    </section>

    <section class="svc-detail">
      <div class="container svc-detail-grid">
        <article class="svc-body">
          <h2>Βαθμός συμμόρφωσης</h2>
          <p>Ο ιστότοπος έχει σχεδιαστεί ώστε να συμμορφώνεται με το <strong>Ευρωπαϊκό Εναρμονισμένο Πρότυπο EN 301 549</strong>, όπως αντικαθίσταται και ισχύει κάθε φορά, και κατά συνέπεια με τις <strong>Οδηγίες για την Προσβασιμότητα του Περιεχομένου του Ιστού (WCAG) έκδοση 2.1 του W3C, στο επίπεδο «AA»</strong>.</p>
          <p><strong>Δήλωση συμμόρφωσης:</strong> πλήρης συμμόρφωση με το WCAG 2.1 επίπεδο AA. Δεν έχουν εντοπιστεί μη συμμορφούμενα στοιχεία, πέραν όσων αναφέρονται ρητά στην ενότητα «Γνωστοί περιορισμοί».</p>

          <h3>Γιατί επίπεδο AA και όχι AAA</h3>
          <p>Το ανώτατο επίπεδο «AAA» απαιτείται για ιστότοπους και εφαρμογές που <em>απευθύνονται ειδικά σε άτομα με αναπηρία</em>. Ο παρών ιστότοπος αφορά υπηρεσίες διαιτολογίας προς το γενικό κοινό· η διατροφική υποστήριξη ατόμων με αναπηρία είναι μία από τις προσφερόμενες υπηρεσίες και δεν αποτελεί τον αποκλειστικό σκοπό του ιστότοπου. Ως εκ τούτου, το εφαρμοστέο επίπεδο είναι το «AA».</p>
          <p>Πέραν του απαιτούμενου επιπέδου, πληρούνται και τα ακόλουθα κριτήρια επιπέδου AAA: 1.4.8 (οπτική παρουσίαση), 2.1.3 (πληκτρολόγιο χωρίς εξαίρεση), 2.2.3 (χωρίς χρονικά όρια), 2.2.4 (χωρίς διακοπές), 2.3.1/2.3.2 (χωρίς αναλαμπές), 2.4.8 (θέση χρήστη — διαδρομή πλοήγησης), 2.4.9 (σκοπός συνδέσμου από τον ίδιο τον σύνδεσμο), 2.4.10 (επικεφαλίδες ενοτήτων), 3.2.5 (αλλαγές μόνο κατόπιν αιτήματος) και 3.3.5 (βοήθεια στις φόρμες). Το κείμενο σώματος ξεπερνά επίσης το κατώφλι 7:1 του κριτηρίου 1.4.6.</p>

          <h2>Μέτρα προσβασιμότητας που έχουν ληφθεί</h2>

          <h3>Πλοήγηση αποκλειστικά με πληκτρολόγιο</h3>
          <p>Κάθε σύνδεσμος, κουμπί, πεδίο φόρμας και πτυσσόμενο στοιχείο είναι προσβάσιμο με τα πλήκτρα <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>, <kbd>Enter</kbd>, <kbd>Space</kbd> και <kbd>Esc</kbd>, χωρίς παγίδευση εστίασης. Η σειρά εστίασης ακολουθεί τη λογική σειρά ανάγνωσης και το εστιασμένο στοιχείο επισημαίνεται πάντοτε με ευδιάκριτο περίγραμμα υψηλής αντίθεσης.</p>
          <ul class="ticks">
            <li>Σύνδεσμοι παράλειψης στην αρχή κάθε σελίδας (μετάβαση στο περιεχόμενο και στην πλοήγηση)</li>
            <li>Το μενού του κινητού αποκρύπτεται πλήρως όταν είναι κλειστό, ώστε η εστίαση να μη «χάνεται» εκτός οθόνης</li>
            <li>Το πλήκτρο <kbd>Esc</kbd> κλείνει το μενού και τα αναδυόμενα παράθυρα και επαναφέρει την εστίαση</li>
            <li>Το υπομενού υπηρεσιών ανοίγει και με εστίαση πληκτρολογίου, όχι μόνο με το ποντίκι</li>
          </ul>

          <h3>Εναλλακτικό κείμενο εικόνων</h3>
          <p>Όλες οι πληροφοριακές εικόνες συνοδεύονται από περιγραφικό εναλλακτικό κείμενο (<code>alt</code>) για τους χρήστες αναγνωστών οθόνης. Οι διακοσμητικές εικόνες φέρουν κενό <code>alt=""</code>, ώστε να αγνοούνται από τις υποστηρικτικές τεχνολογίες. Η αφίσα δημοσιότητας της Δ.ΥΠ.Α. συνοδεύεται από πλήρη μεταγραφή του κειμένου της.</p>

          <h3>Χρωματική αντίθεση</h3>
          <p>Όλοι οι συνδυασμοί κειμένου και φόντου έχουν ελεγχθεί ώστε ο λόγος αντίθεσης να είναι τουλάχιστον <strong>4,5:1</strong> για το κανονικό κείμενο και <strong>3:1</strong> για το μεγάλο κείμενο και τα στοιχεία διεπαφής. Η πληροφορία δεν μεταδίδεται ποτέ αποκλειστικά μέσω χρώματος: οι σύνδεσμοι εντός κειμένου είναι και υπογραμμισμένοι, ενώ τα σφάλματα φόρμας συνοδεύονται από γραπτό μήνυμα.</p>

          <h3>Σημασιολογική δομή</h3>
          <p>Οι σελίδες χρησιμοποιούν σωστά σημασιολογικά στοιχεία HTML — <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;article&gt;</code>, <code>&lt;aside&gt;</code>, <code>&lt;footer&gt;</code> — και ιεραρχία επικεφαλίδων <code>&lt;h1&gt;</code> έως <code>&lt;h6&gt;</code> χωρίς κενά επίπεδα. Κάθε σελίδα έχει μία μοναδική <code>&lt;h1&gt;</code>, μοναδικό τίτλο και δηλωμένη γλώσσα (<code>lang="el"</code>). Οι περιοχές πλοήγησης φέρουν διακριτές ετικέτες.</p>

          <h3>Μέγεθος γραμματοσειράς &amp; μεγέθυνση</h3>
          <p>Το κείμενο μπορεί να μεγεθυνθεί έως <strong>200%</strong> από τον browser χωρίς απώλεια περιεχομένου ή λειτουργικότητας και χωρίς οριζόντια κύλιση. Όλα τα μεγέθη ορίζονται σε σχετικές μονάδες (<code>rem</code>), ενώ η διάταξη αναδιατάσσεται σε πλάτος ισοδύναμο με 320 pixel. Επιπλέον, το εργαλείο προσβασιμότητας του ιστότοπου επιτρέπει ρύθμιση του μεγέθους κειμένου έως 160% ανεξάρτητα από τον browser.</p>

          <h3>Εργαλείο προσβασιμότητας</h3>
          <p>Το κουμπί προσβασιμότητας κάτω δεξιά σε κάθε σελίδα προσφέρει: αύξηση/μείωση μεγέθους κειμένου, λειτουργία υψηλής αντίθεσης, υπογράμμιση όλων των συνδέσμων και απενεργοποίηση των κινήσεων. Οι επιλογές αποθηκεύονται στη συσκευή σας και διατηρούνται κατά την πλοήγηση.</p>

          <h3>Κίνηση &amp; χρονικοί περιορισμοί</h3>
          <p>Η κινούμενη ταινία κειμένου διαθέτει χειριστήριο παύσης, ενώ όλες οι κινήσεις απενεργοποιούνται αυτόματα όταν το λειτουργικό σύστημα δηλώνει προτίμηση για μειωμένη κίνηση. Δεν υπάρχει περιεχόμενο που αναβοσβήνει και δεν επιβάλλονται χρονικά όρια σε καμία ενέργεια.</p>

          <h3>Φόρμες</h3>
          <p>Κάθε πεδίο συνδέεται με ορατή ετικέτα, τα υποχρεωτικά πεδία επισημαίνονται και σε κείμενο, ενώ τα σφάλματα περιγράφονται με σαφήνεια, συνδέονται προγραμματιστικά με το πεδίο και ανακοινώνονται στους αναγνώστες οθόνης. Η εστίαση μεταφέρεται αυτόματα στο πρώτο πεδίο με σφάλμα.</p>

          <h2>Αναρτημένα έγγραφα (non-web documents)</h2>
          <p>Το EN 301 549 (Κεφάλαιο 10) επεκτείνει τις απαιτήσεις προσβασιμότητας και στα έγγραφα που αναρτώνται στον ιστότοπο, όχι μόνο στις ιστοσελίδες. Για κάθε αναρτημένο αρχείο εφαρμόζεται η εξής πολιτική:</p>
          <ul class="ticks">
            <li>Το περιεχόμενο κάθε εγγράφου δημοσιεύεται <strong>και</strong> ως κείμενο HTML στον ιστότοπο, ώστε να είναι πλήρως προσβάσιμο ανεξάρτητα από τη μορφή του αρχείου.</li>
            <li>Τα αρχεία PDF παρέχονται σε <strong>επισημασμένη (tagged) μορφή</strong>, με δηλωμένη γλώσσα, τίτλο εγγράφου, λογική σειρά ανάγνωσης, δομή επικεφαλίδων και εναλλακτικό κείμενο στις εικόνες.</li>
            <li>Δεν αναρτώνται σαρωμένα έγγραφα ή εικόνες κειμένου χωρίς αντίστοιχο επίπεδο πραγματικού κειμένου.</li>
            <li>Ο τύπος και το μέγεθος κάθε αρχείου δηλώνονται στον σύνδεσμο λήψης.</li>
          </ul>
          <p>Η αφίσα δημοσιότητας της Δ.ΥΠ.Α. παραδόθηκε ως PDF με μετατροπή γραμματοσειρών σε καμπύλες (χωρίς κανέναν αναγνώσιμο χαρακτήρα). Για τον λόγο αυτό παράχθηκε προσβάσιμη εκδοχή, οπτικά ταυτόσημη με το πρωτότυπο, η οποία διαθέτει επίπεδο πραγματικού κειμένου, σήμανση δομής και περιγραφή της εικονογράφησης. Δείτε την στη <a href="chrimatodotisi.html">σελίδα χρηματοδότησης</a>.</p>

          <h2>Πρόσβαση στον χώρο</h2>
          <p>${BIZ.wheelchairAccessible
            ? "Το γραφείο είναι προσβάσιμο σε άτομα με κινητική αναπηρία. Για ειδικές ανάγκες πρόσβασης, παρακαλούμε ενημερώστε μας κατά τον προγραμματισμό του ραντεβού, ώστε να γίνουν οι απαραίτητες διευκολύνσεις."
            : "Για πληροφορίες σχετικά με την πρόσβαση στον χώρο, παρακαλούμε επικοινωνήστε μαζί μας πριν το ραντεβού σας."}</p>
          <p>Εναλλακτικά, όλες οι υπηρεσίες προσφέρονται και μέσω <a href="ypiresies/online-synedries-diatrofis.html">διαδικτυακών συνεδριών</a>, ώστε η μετακίνηση να μην αποτελεί εμπόδιο. Κατόπιν συνεννόησης εξετάζεται και η δυνατότητα κατ' οίκον επίσκεψης.</p>

          <h2>Γνωστοί περιορισμοί</h2>
          <ul class="ticks">
            <li>Ο ενσωματωμένος χάρτης των Χαρτών Google παρέχεται από τρίτο μέρος και ενδέχεται να μην πληροί πλήρως τα κριτήρια AA. Για τον λόγο αυτό η διεύθυνση παρατίθεται πάντοτε και σε μορφή κειμένου, ενώ δίνεται και εναλλακτικός σύνδεσμος εκτός πλαισίου.</li>
            <li>Η αφίσα δημοσιότητας αποτελεί εξ ορισμού εικόνα κειμένου, καθώς πρόκειται για τυποποιημένο έντυπο τρίτου φορέα που δεν επιτρέπεται να τροποποιηθεί εικαστικά. Ολόκληρο το περιεχόμενό της διατίθεται σε μορφή HTML, ενώ το PDF έχει καταστεί επισημασμένο και αναγνώσιμο από υποστηρικτικές τεχνολογίες.</li>
            <li>Οι γραμματοσειρές φορτώνονται από το Google Fonts. Σε περίπτωση αποτυχίας φόρτωσης, ο ιστότοπος εμφανίζεται κανονικά με τις εναλλακτικές γραμματοσειρές του συστήματος.</li>
          </ul>

          <h2>Υποβολή παρατηρήσεων &amp; διαδικασία εκτέλεσης</h2>
          <p>Αν συναντήσετε εμπόδιο προσβασιμότητας ή χρειάζεστε κάποιο περιεχόμενο σε εναλλακτική μορφή (π.χ. απλό κείμενο, μεγαλύτερη γραμματοσειρά, ηχητική περιγραφή), επικοινωνήστε μαζί μας:</p>
          <ul class="ticks">
            <li>Email: <a href="mailto:${attr(BIZ.email)}">${esc(BIZ.email)}</a></li>
            <li>Τηλέφωνο: <a href="tel:${attr(BIZ.phoneIntl)}">${esc(BIZ.phoneDisplay)}</a></li>
            <li><a href="epikoinonia.html">Φόρμα επικοινωνίας</a></li>
          </ul>
          <p>Απαντάμε σε αιτήματα προσβασιμότητας το συντομότερο δυνατό και το αργότερο εντός δέκα εργάσιμων ημερών. Αν η απάντηση δεν σας ικανοποιεί, μπορείτε να απευθυνθείτε στον <a href="https://www.synigoros.gr/" target="_blank" rel="noopener noreferrer">Συνήγορο του Πολίτη</a> (ανοίγει σε νέα καρτέλα).</p>

          <p class="article-disclaimer">Η παρούσα δήλωση αφορά τον ιστότοπο ${esc(BASE.replace(/^https?:\/\//, ""))} και συντάχθηκε βάσει αυτοαξιολόγησης, με συνδυασμό αυτοματοποιημένου ελέγχου, υπολογιστικής επαλήθευσης των λόγων αντίθεσης και χειροκίνητης δοκιμής πλοήγησης με πληκτρολόγιο. Τελευταία ενημέρωση: <time datetime="${today}">${fmtDate(today)}</time>.</p>
        </article>

        <aside class="svc-aside" aria-label="Συνοπτικά">
          <div class="aside-card">
            <h2>Με μια ματιά</h2>
            <p class="aside-meta">Πρότυπο: EN 301 549<br />Οδηγίες: WCAG 2.1 — επίπεδο AA<br />Κατάσταση: πλήρης συμμόρφωση<br />Έγγραφα: επισημασμένα (tagged) PDF<br />Μέθοδος: αυτοαξιολόγηση</p>
            <a href="epikoinonia.html" class="btn btn-primary btn-block">Αναφορά προβλήματος</a>
          </div>
          <div class="aside-card">
            <h2>Συντομεύσεις πληκτρολογίου</h2>
            <p class="aside-meta"><kbd>Tab</kbd> — επόμενο στοιχείο<br /><kbd>Shift</kbd>+<kbd>Tab</kbd> — προηγούμενο<br /><kbd>Enter</kbd> — ενεργοποίηση<br /><kbd>Esc</kbd> — κλείσιμο μενού/παραθύρου</p>
          </div>
        </aside>
      </div>
    </section>
  </main>` +
    footer(depth);
}

// ============================================================
//  ΣΕΛΙΔΑ: ΧΡΗΜΑΤΟΔΟΤΗΣΗ (ΔΥΠΑ / NextGenerationEU)
// ============================================================
function pageFunding() {
  const depth = 0;
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Χρηματοδότηση", rel: "chrimatodotisi.html", path: "chrimatodotisi.html" },
  ];

  return head({
    depth,
    title: `Χρηματοδότηση — Δ.ΥΠ.Α. & NextGenerationEU | ${BIZ.brand}`,
    desc: FUNDING.body,
    canonical: "chrimatodotisi.html",
    keywords: "ΔΥΠΑ, NextGenerationEU, Ελλάδα 2.0, Ταμείο Ανάκαμψης, δημοσιότητα, αφίσα",
    ld: [breadcrumbLD(trail)],
  }) +
    header(depth) +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Δημοσιότητα</p>
        <h1 class="page-title reveal">Στοιχεία χρηματοδότησης</h1>
        <p class="page-lead reveal">Η επιχείρηση εντάσσεται σε συγχρηματοδοτούμενη δράση της Δημόσιας Υπηρεσίας Απασχόλησης (Δ.ΥΠ.Α.). Παρακάτω δημοσιεύεται η προβλεπόμενη αφίσα δημοσιότητας, μαζί με πλήρη μεταγραφή του περιεχομένου της σε προσβάσιμη μορφή.</p>
      </div>
    </section>

    <section class="funding" aria-labelledby="funding-title">
      <div class="container funding-grid">
        <div class="funding-copy">
          <h2 id="funding-title">${esc(FUNDING.title)}</h2>
          <p>${esc(FUNDING.subtitle)}</p>

          <h2>Φορέας υλοποίησης</h2>
          <p>${esc(FUNDING.implementer)}</p>

          <h2>Πλαίσιο χρηματοδότησης</h2>
          <p>${esc(FUNDING.body)}</p>

          <ul class="ticks">
            <li>${esc(FUNDING.ministry)}</li>
            <li>${esc(FUNDING.programme)}</li>
            <li>Με τη χρηματοδότηση της Ευρωπαϊκής Ένωσης — NextGenerationEU</li>
          </ul>

          <div class="a11y-note">
            <img src="assets/accessibility.png" alt="" width="48" height="48" class="a11y-keep" />
            <p>Το πρωτότυπο αρχείο της αφίσας δεν περιείχε κανέναν αναγνώσιμο χαρακτήρα (οι γραμματοσειρές είχαν μετατραπεί σε καμπύλες). Το PDF που διατίθεται εδώ είναι <strong>επισημασμένο (tagged)</strong>, οπτικά ταυτόσημο με το πρωτότυπο, με επίπεδο πραγματικού κειμένου, δηλωμένη γλώσσα, λογική σειρά ανάγνωσης και περιγραφή της εικονογράφησης — σύμφωνα με το EN 301 549, Κεφ. 10. Δείτε τη <a href="prosvasimotita.html">δήλωση προσβασιμότητας</a>.</p>
          </div>
        </div>

        <figure class="poster-figure">
          <img src="assets/dypa-poster.jpg" width="910" height="1287"
               alt="${attr(FUNDING.posterAlt)}" />
          <figcaption>
            Αφίσα δημοσιότητας Δ.ΥΠ.Α.<br />
            <a href="assets/dypa-poster.pdf" target="_blank" rel="noopener noreferrer">Λήψη προσβάσιμου PDF (2 MB, ανοίγει σε νέα καρτέλα)</a><br />
            <a href="assets/dypa-poster-original.pdf" target="_blank" rel="noopener noreferrer">Λήψη πρωτότυπου αρχείου όπως παραδόθηκε (2 MB, ανοίγει σε νέα καρτέλα)</a>
          </figcaption>
        </figure>
      </div>
    </section>
  </main>` +
    footer(depth);
}

// ============================================================
//  SITEMAP + ROBOTS
// ============================================================
function buildSitemap() {
  const urls = [
    { loc: "index.html", pr: "1.0", cf: "weekly" },
    { loc: "i-diaitologos.html", pr: "0.8", cf: "monthly" },
    { loc: "ypiresies/index.html", pr: "0.9", cf: "monthly" },
    ...SERVICES.map((s) => ({ loc: "ypiresies/" + s.slug + ".html", pr: "0.9", cf: "monthly" })),
    { loc: "perioches/index.html", pr: "0.7", cf: "monthly" },
    ...AREAS.map((a) => ({ loc: "perioches/" + a.slug + ".html", pr: "0.7", cf: "monthly" })),
    { loc: "blog/index.html", pr: "0.7", cf: "weekly" },
    ...POSTS.map((p) => ({ loc: "blog/" + p.slug + ".html", pr: "0.6", cf: "monthly", lm: p.date })),
    { loc: "epikoinonia.html", pr: "0.8", cf: "yearly" },
    { loc: "prosvasimotita.html", pr: "0.5", cf: "yearly" },
    { loc: "chrimatodotisi.html", pr: "0.5", cf: "yearly" },
  ];
  const today = new Date().toISOString().slice(0, 10);
  const body = urls
    .map((u) => `  <url><loc>${abs(u.loc)}</loc><lastmod>${u.lm || today}</lastmod><changefreq>${u.cf}</changefreq><priority>${u.pr}</priority></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

const buildRobots = () => `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`;

const favicon = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="${attr(BIZ.brand)}">
  <rect width="64" height="64" rx="14" fill="#2c4426"/>
  <text x="32" y="45" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="#f8f7f2">${esc(BIZ.initials)}</text>
</svg>
`;

// ============================================================
//  RUN
// ============================================================
let n = 0;
const write = (p, html) => { out(p, html); n++; };

write("index.html", pageHome());
write("i-diaitologos.html", pageAbout());
write("epikoinonia.html", pageContact());
write("prosvasimotita.html", pageAccessibility());
write("chrimatodotisi.html", pageFunding());
write("ypiresies/index.html", pageServicesHub());
SERVICES.forEach((s, i) => write("ypiresies/" + s.slug + ".html", pageService(s, i)));
write("perioches/index.html", pageAreasHub());
AREAS.forEach((a) => write("perioches/" + a.slug + ".html", pageArea(a)));
write("blog/index.html", pageBlogHub());
POSTS.forEach((p) => write("blog/" + p.slug + ".html", pagePost(p)));
out("sitemap.xml", buildSitemap());
out("robots.txt", buildRobots());
out("assets/favicon.svg", favicon());

console.log(`✓ Δημιουργήθηκαν ${n} σελίδες HTML + sitemap.xml + robots.txt + favicon.svg`);

// Προειδοποίηση για placeholders που δεν έχουν συμπληρωθεί
const pending = JSON.stringify({ BASE, BIZ, BIO, CREDS, AREAS: AREAS.map((a) => a.name) }).match(/\[[^\[\]{}",]+\]/g);
if (pending) {
  const unique = [...new Set(pending)];
  console.warn(`\n⚠  Εκκρεμούν ${unique.length} στοιχεία πελάτη στο build/data.mjs:\n   ${unique.join("  ")}\n`);
}
