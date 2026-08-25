/* ============================================================
   Generator ιστότοπου — Μένια Καρανάσιου
   Παράγει 8 σελίδες + sitemap.xml + robots.txt.

   Εκτέλεση:  node build/build.mjs
   ============================================================ */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  SITE, IMG, NAV, FOOTER_NAV, HOME, ABOUT, BIO, METHOD, SERVICES, CONTACT,
  FAQ, PRIVACY, PENDING, A11Y, FUNDING, FOOTER,
} from "./data.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const warnings = [];

/* ============================================================
   Βοηθητικά
   ============================================================ */
const url = (file) => `${SITE.BASE}/${file === "index.html" ? "" : file}`;
/* Το & πρέπει να γράφεται &amp; μέσα σε HTML attribute (π.χ. query strings). */
const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
/* Σταθερά id ενοτήτων για τον πίνακα περιεχομένων της πολιτικής απορρήτου. */
const slug = (h) => "sec-" + (h.match(/^\d+/) || ["1"])[0];
const pending = (v) => typeof v === "string" && /\[[A-Z_]+\]/.test(v);

function check(label, value) {
  if (pending(value)) warnings.push(`${label}: ${value}`);
  return value;
}

/* ---------- κεφαλίδα ---------- */
function header(current) {
  const items = NAV.map((n) => {
    const active = n.file === current ? ' aria-current="page"' : "";
    const cls = `nav-link${n.cta ? " nav-cta" : ""}`;
    if (n.external) {
      /* Ο σκοπός του συνδέσμου και το άνοιγμα σε νέα καρτέλα δηλώνονται
         και στους αναγνώστες οθόνης (WCAG 2.4.4 / 3.2.5). */
      return `<li><a class="${cls}" href="${esc(n.href)}" target="_blank" rel="noopener noreferrer">${n.label}<span class="visually-hidden"> (ανοίγει σε νέα καρτέλα)</span></a></li>`;
    }
    return `<li><a class="${cls}" href="${n.file}"${active}>${n.label}</a></li>`;
  }).join("\n            ");

  return `  <header class="site-header" id="top">
    <div class="sheet header-inner">
      <a class="brand" href="index.html">
        <img class="brand-logo" src="${IMG.logo}" width="126" height="76"
             alt="Λογότυπο ΜΚ — Μένια Καρανάσιου" />
        <span class="brand-text">
          <span class="brand-name">${SITE.name}</span>
          <span class="brand-role">${SITE.role}</span>
        </span>
      </a>
      <button type="button" class="nav-toggle" aria-expanded="false"
              aria-controls="site-nav" aria-label="Άνοιγμα μενού">
        <span></span><span></span><span></span>
      </button>
      <nav class="main-nav" id="site-nav" aria-label="Κύρια πλοήγηση">
        <ul class="nav-list">
            ${items}
        </ul>
        <img class="nav-panel-logo" src="${IMG.logoFooter}" alt="" width="104" height="104" />
      </nav>
      <div class="nav-overlay" hidden></div>
    </div>
  </header>`;
}

/* ---------- υποσέλιδο ---------- */
function footer() {
  return `  <footer class="site-footer">
    <div class="sheet">
      <a href="index.html" aria-label="${SITE.name} — Αρχική σελίδα">
        <img class="footer-logo" src="${IMG.logoFooter}" width="152" height="123"
             alt="Λογότυπο ΜΚ — Μένια Καρανάσιου" />
      </a>
      <p class="footer-tag">${FOOTER.tag}</p>

      <nav aria-label="Δευτερεύουσα πλοήγηση">
        <ul class="footer-nav">
          ${FOOTER_NAV.map((n) => `<li><a href="${n.file}">${n.label}</a></li>`).join("\n          ")}
        </ul>
      </nav>

      <div class="footer-marks">
        <div class="footer-mark">
          <img src="${IMG.accessibility}" alt="" width="44" height="44" class="a11y-keep" />
          <p>${FOOTER.a11yMark} <a href="prosvasimotita.html">${FOOTER.a11yMarkLink}</a></p>
        </div>
        <div class="footer-mark">
          <img src="${IMG.poster}" alt="" width="42" height="59" />
          <p>${FOOTER.euMark} <a href="chrimatodotisi.html">${FOOTER.euMarkLink}</a></p>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="footer-copy">© <span id="year">2026</span> ${SITE.name}, Διαιτολόγος – Διατροφολόγος. Με επιφύλαξη παντός δικαιώματος.</p>
        <p class="cb-credit">Κατασκευή ιστοσελίδας — Made by
          <a href="https://clinicbrain.gr/?utm_source=client-site&amp;utm_medium=footer&amp;utm_campaign=made-by"
             target="_blank" rel="noopener noreferrer">CLINICBRAIN</a>
        </p>
      </div>
    </div>
  </footer>`;
}

/* ---------- widget προσβασιμότητας ---------- */
function a11yWidget() {
  return `  <button type="button" class="a11y-fab" aria-expanded="false" aria-controls="a11y-panel"
          aria-label="Εργαλεία προσβασιμότητας">
    <img src="${IMG.accessibility}" alt="" width="56" height="56" class="a11y-keep" />
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
    <a class="a11y-panel-link" href="prosvasimotita.html">Πλήρης δήλωση προσβασιμότητας</a>
    <button type="button" class="a11y-btn a11y-panel-close" data-a11y="close">Κλείσιμο</button>
  </div>`;
}

/* ---------- σκελετός σελίδας ---------- */
function shell({ file, title, desc, keywords = "", main, schema = [], extraHead = "", noindex = false }) {
  const canonical = url(file);
  const jsonld = schema.map((s) => `  <script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n");

  return `<!DOCTYPE html>
<html lang="${SITE.lang}" class="no-js">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />${keywords ? `\n  <meta name="keywords" content="${keywords}" />` : ""}
  <meta name="author" content="${SITE.name}, Διαιτολόγος – Διατροφολόγος" />
  <meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}" />
  <meta name="theme-color" content="#9a1cab" />
  <link rel="canonical" href="${canonical}" />

  <meta property="og:site_name" content="${SITE.name}" />
  <meta property="og:locale" content="el_GR" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${SITE.BASE}/${IMG.logo}" />
  <meta name="twitter:card" content="summary_large_image" />

  <link rel="icon" href="assets/favicon.ico" sizes="any" />
  <link rel="apple-touch-icon" href="${IMG.logo}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600;700&display=swap" />
  <link rel="stylesheet" href="styles.css?v=6" />
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
  </script>
${jsonld}${extraHead}
</head>
<body>
  <script>
    (function () {
      var boot = document.documentElement.getAttribute("data-a11y-boot");
      if (boot) document.body.className = boot;
    })();
  </script>
  <nav class="skip-links" aria-label="Σύνδεσμοι παράλειψης">
    <a href="#main">Μετάβαση στο περιεχόμενο</a>
    <a href="#site-nav">Μετάβαση στην πλοήγηση</a>
    <a href="prosvasimotita.html">Δήλωση προσβασιμότητας</a>
  </nav>
${header(file)}
${main}
${footer()}

${a11yWidget()}
  <script src="main.js?v=6" defer></script>
</body>
</html>
`;
}

/* ---------- κοινά τμήματα ---------- */
const banner = () =>
  `    <div class="banner" style="--hero-img: url('${IMG.banner}')" role="presentation"></div>`;

const contactColumn = (level = "h2") => `        <div>
          <p class="eyebrow">${CONTACT.eyebrow}</p>
          <${level} class="section-title" id="contact-title">${CONTACT.h1}</${level}>
          <p class="contact-hours">${SITE.hours}</p>
          <ul class="contact-list">
            <li>
              <img src="${IMG.iconPhone}" alt="" width="20" height="20" />
              <a href="tel:${SITE.phoneIntl}">${SITE.phoneDisplay}</a>
            </li>
            <li>
              <img src="${IMG.iconMail}" alt="" width="20" height="20" />
              <a href="mailto:${SITE.email}">${SITE.email}</a>
            </li>
          </ul>
          <ul class="social-links">
            <li>
              <a href="${SITE.instagram}" target="_blank" rel="noopener noreferrer">
                <img src="${IMG.iconInstagram}" alt="" width="27" height="27" />
                <span class="visually-hidden">Instagram (ανοίγει σε νέα καρτέλα)</span>
              </a>
            </li>
            <li>
              <a href="${esc(SITE.facebook)}" target="_blank" rel="noopener noreferrer">
                <img src="${IMG.iconFacebook}" alt="" width="27" height="27" />
                <span class="visually-hidden">Facebook (ανοίγει σε νέα καρτέλα)</span>
              </a>
            </li>
            <li>
              <a href="${SITE.linkedin}" target="_blank" rel="noopener noreferrer">
                <img src="${IMG.iconLinkedin}" alt="" width="26" height="26" />
                <span class="visually-hidden">LinkedIn (ανοίγει σε νέα καρτέλα)</span>
              </a>
            </li>
          </ul>
        </div>`;

/* Ενσωματωμένο ημερολόγιο Calendly — ή εναλλακτικά κανάλια όσο εκκρεμεί ο σύνδεσμος. */
function bookingBlock(headingLevel = "h3") {
  const H = headingLevel;
  const ready = !pending(SITE.calendly);

  const intro = ready ? CONTACT.bookingIntro : CONTACT.bookingIntroPending;
  const embed = ready
    ? `          <div class="booking">
            <div class="calendly-inline-widget booking-frame" data-url="${SITE.calendly}"
                 role="region" aria-label="Ημερολόγιο ραντεβού"></div>
            <p class="booking-fallback">Το ημερολόγιο ραντεβού παρέχεται από την υπηρεσία Calendly.
              Αν δεν φορτώσει ή δυσκολεύεστε στη χρήση του, καλέστε στο
              <a href="tel:${SITE.phoneIntl}">${SITE.phoneDisplay}</a> ή στείλτε email στο
              <a href="mailto:${SITE.email}">${SITE.email}</a> και κλείνουμε το ραντεβού μαζί.</p>
          </div>`
    : "";

  return `        <div>
          <${H} class="section-title">${CONTACT.bookingTitle}</${H}>
          <p>${intro}</p>
${embed}
          <div class="panel-actions">
            <a class="btn btn-round" href="tel:${SITE.phoneIntl}">Τηλεφώνησέ μου</a>
            <a class="btn btn-outline" href="mailto:${SITE.email}">Στείλε email</a>
          </div>
${consentBlock()}
        </div>`;
}

/* Ενημέρωση συγκατάθεσης για δεδομένα υγείας (GDPR άρθρο 9 §2α).
   Το πεδίο επιλογής είναι απενεργοποιημένο και επεξηγηματικό: η
   συγκατάθεση δίνεται γραπτώς πριν την πρώτη συνεδρία, όχι εδώ. */
function consentBlock() {
  return `          <div class="consent">
            <h3 class="consent-title">${PRIVACY.consentTitle}</h3>
            <p>${PRIVACY.consentText}</p>
            <p class="consent-sample">
              <span class="consent-box" aria-hidden="true"></span>
              <span>${PRIVACY.consentCheckbox}</span>
            </p>
            <p class="consent-note">Δείγμα της δήλωσης που θα σου ζητηθεί να υπογράψεις.
              Διάβασε αναλυτικά την <a href="politiki-aporritou.html">Πολιτική Απορρήτου</a>.</p>
          </div>`;
}

/* ============================================================
   Σελίδες
   ============================================================ */

function pageHome() {
  const main = `  <main id="main">
    <section class="hero" style="--hero-img: url('${IMG.hero}')" aria-labelledby="hero-title">
      <div class="sheet">
        <h1 class="hero-title reveal" id="hero-title">${HOME.heroTitle}</h1>
        <p class="hero-sub reveal">${HOME.heroSub}</p>
        <a class="btn btn-primary reveal" href="liga-logia.html">Περισσότερα</a>
      </div>
    </section>

    <section class="section section-white intro" aria-labelledby="welcome-title">
      <div class="sheet">
        <div class="portrait reveal" style="--portrait-img: url('${IMG.portrait}')"
             role="img" aria-label="Η Μένια Καρανάσιου, διαιτολόγος – διατροφολόγος"></div>
        <h2 class="reveal" id="welcome-title">${HOME.welcomeTitle}</h2>
        <p class="intro-text reveal">${HOME.welcomeText}</p>
        <a class="btn btn-primary reveal" href="liga-logia.html">Περισσότερα</a>
      </div>
    </section>

    <section class="section section-grey" aria-labelledby="contact-title">
      <div class="sheet">
        <div class="duo">
${contactColumn()}
        <div>
          <div class="panel">
            <h3>${CONTACT.bookingTitle}</h3>
            <p>${CONTACT.homeIntro}</p>
            <div class="panel-actions">
              <a class="btn btn-round" href="epikoinonia.html">Κλείσε ραντεβού</a>
              <a class="btn btn-outline" href="mailto:${SITE.email}">Στείλε email</a>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  </main>`;

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": ["Dietitian", "MedicalBusiness"],
      "@id": `${SITE.BASE}/#praxis`,
      name: `${SITE.name} — Διαιτολόγος Διατροφολόγος`,
      slogan: SITE.tagline,
      url: `${SITE.BASE}/`,
      logo: `${SITE.BASE}/${IMG.logo}`,
      image: `${SITE.BASE}/${IMG.hero}`,
      telephone: SITE.phoneIntl,
      email: SITE.email,
      priceRange: "€€",
      currenciesAccepted: "EUR",
      areaServed: ["Ελλάδα", "Παγκοσμίως"],
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "21:00",
        },
      ],
      sameAs: [SITE.instagram, SITE.linkedin],
      founder: { "@type": "Person", name: SITE.name, jobTitle: "Διαιτολόγος – Διατροφολόγος" },
      availableService: SERVICES.items.map((s) => ({ "@type": "MedicalTherapy", name: s.title })),
    },
    { "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: `${SITE.BASE}/`, inLanguage: "el" },
  ];

  return shell({
    file: "index.html",
    title: HOME.title,
    desc: HOME.desc,
    keywords: HOME.keywords,
    main,
    schema,
  });
}

function pageAbout() {
  const main = `  <main id="main">
${banner()}
    <section class="section section-white">
      <div class="sheet">
        <div class="duo duo-1-2">
          <div>
            <div class="portrait portrait-low reveal" style="--portrait-img: url('${IMG.portraitAlt}')"
                 role="img" aria-label="Πορτρέτο της Μένιας Καρανάσιου"></div>
          </div>
          <div>
            <h1 class="page-title reveal">${ABOUT.h1}</h1>
            ${ABOUT.intro.map((p) => `<p class="lead reveal">${p}</p>`).join("\n            ")}
          </div>
        </div>
      </div>
    </section>

    <section class="section section-white">
      <div class="sheet prose">
        ${ABOUT.body.map((p) => `<p class="reveal">${p}</p>`).join("\n        ")}
        <a class="btn btn-round" href="epikoinonia.html">Επικοινώνησε μαζί μου</a>
      </div>
    </section>
  </main>`;

  return shell({ file: "liga-logia.html", title: ABOUT.title, desc: ABOUT.desc, keywords: ABOUT.keywords, main });
}

function pageBio() {
  const main = `  <main id="main">
${banner()}
    <section class="section section-white">
      <div class="sheet prose">
        <h1 class="page-title text-center reveal">${BIO.h1}</h1>
        ${BIO.paragraphs.map((p) => `<p class="reveal">${p}</p>`).join("\n        ")}
        <a class="btn btn-round" href="epikoinonia.html">Επικοινώνησε μαζί μου</a>
      </div>
    </section>
  </main>`;

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: SITE.name,
      jobTitle: "Διαιτολόγος – Διατροφολόγος",
      url: url("biografiko.html"),
      alumniOf: { "@type": "CollegeOrUniversity", name: "Ανώτατο Τεχνολογικό Εκπαιδευτικό Ίδρυμα Θεσσαλονίκης" },
      memberOf: { "@type": "Organization", name: SITE.hdnaName, url: SITE.hdna },
      worksFor: { "@id": `${SITE.BASE}/#praxis` },
    },
  ];

  return shell({ file: "biografiko.html", title: BIO.title, desc: BIO.desc, keywords: BIO.keywords, main, schema });
}

function pageMethod() {
  const main = `  <main id="main">
${banner()}
    <section class="section section-white">
      <div class="sheet prose">
        <h1 class="page-title text-center reveal">${METHOD.h1}</h1>
        <p class="text-justify reveal">${METHOD.intro}</p>
        <h2 class="reveal">${METHOD.advantagesTitle}</h2>
        <dl class="advantages reveal">
          ${METHOD.advantages
            .map((a) => `<dt>${a.term}</dt>\n          <dd>${a.text}</dd>`)
            .join("\n          ")}
        </dl>
        <a class="btn btn-round" href="epikoinonia.html">Επικοινώνησε μαζί μου</a>
      </div>
    </section>
  </main>`;

  return shell({ file: "methodos.html", title: METHOD.title, desc: METHOD.desc, keywords: METHOD.keywords, main });
}

function pageServices() {
  const cards = SERVICES.items
    .map(
      (s) => `          <li class="svc-card reveal">
            <span class="svc-icon"><img src="${IMG[s.icon]}" alt="" width="44" height="44" /></span>
            <h2>${s.title}</h2>
            <p>${s.text}</p>
          </li>`
    )
    .join("\n");

  const prices = SERVICES.prices
    .map(
      (p) => `          <li><span class="price-term">${p.term}</span><span class="price-arrow" aria-hidden="true">→</span><span class="price-value">${p.value}</span></li>`
    )
    .join("\n");

  const main = `  <main id="main">
${banner()}
    <section class="section section-white section-bordered" aria-labelledby="svc-title">
      <div class="sheet text-center">
        <h1 class="page-title reveal" id="svc-title">${SERVICES.h1}</h1>
        <ul class="svc-grid">
${cards}
        </ul>
      </div>
    </section>

    <section class="section section-white" aria-labelledby="price-title">
      <div class="sheet text-center">
        <h2 class="reveal" id="price-title">${SERVICES.priceTitle}</h2>
        <ul class="price-list reveal">
${prices}
        </ul>
        <p class="price-note reveal">${SERVICES.priceNote}</p>
        <a class="btn btn-round" href="epikoinonia.html">Επικοινώνησε μαζί μου</a>
      </div>
    </section>
  </main>`;

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "OfferCatalog",
      name: SERVICES.priceTitle,
      itemListElement: SERVICES.prices.map((p) => ({
        "@type": "Offer",
        name: `Διαιτολογική παρακολούθηση — ${p.term}`,
        price: p.value.replace(/[^\d]/g, ""),
        priceCurrency: "EUR",
      })),
    },
  ];

  return shell({ file: "ypiresies.html", title: SERVICES.title, desc: SERVICES.desc, keywords: SERVICES.keywords, main, schema });
}

function pageContact() {
  const extraHead = pending(SITE.calendly)
    ? ""
    : `\n  <script src="https://assets.calendly.com/assets/external/widget.js" async></script>`;

  const main = `  <main id="main">
${banner()}
    <section class="section section-white" aria-labelledby="contact-title">
      <div class="sheet">
        <div class="duo">
${contactColumn("h1")}
${bookingBlock("h2")}
        </div>
      </div>
    </section>
  </main>`;

  return shell({
    file: "epikoinonia.html",
    title: CONTACT.title,
    desc: CONTACT.desc,
    keywords: CONTACT.keywords,
    main,
    extraHead,
  });
}

/* Μετατροπή απάντησης HTML σε καθαρό κείμενο για το schema.org.
   Οι παύλες λίστας/παραγράφων γίνονται σημεία στίξης, ώστε το κείμενο
   να μη «κολλάει» σε μία πρόταση. */
function plain(htmlText) {
  return htmlText
    .replace(/<\/li>/g, "; ")
    .replace(/<\/p>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*;\s*$/, "")
    .replace(/;\s*\./g, ".")
    .trim();
}

/* ---------- Συχνές ερωτήσεις ---------- */
/* Ακορντεόν με <details>/<summary>: λειτουργεί με πληκτρολόγιο και
   αναγνώστες οθόνης χωρίς JavaScript (WCAG 2.1.1 / 4.1.2). */
function pageFaq() {
  const items = FAQ.items
    .map(
      (it, i) => `          <details class="faq-item" name="faq">
            <summary><span class="faq-num" aria-hidden="true">${i + 1}.</span> ${it.q}</summary>
            <div class="faq-answer">${it.a}</div>
          </details>`
    )
    .join("\n");

  const main = `  <main id="main">
${banner()}
    <section class="section section-white" aria-labelledby="faq-title">
      <div class="sheet prose">
        <h1 class="page-title text-center" id="faq-title">${FAQ.h1}</h1>
        <p class="lead text-center">${FAQ.lead}</p>

        <div class="faq-list">
${items}
        </div>

        <p class="faq-cta-text">Δεν βρήκες την απάντηση που έψαχνες;</p>
        <div class="panel-actions">
          <a class="btn btn-round" href="epikoinonia.html">Επικοινώνησε μαζί μου</a>
          <a class="btn btn-outline" href="${esc(SITE.calendly)}" target="_blank" rel="noopener noreferrer">Κλείσε ραντεβού<span class="visually-hidden"> (ανοίγει σε νέα καρτέλα)</span></a>
        </div>
      </div>
    </section>
  </main>`;

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.items.map((it) => ({
        "@type": "Question",
        name: it.q,
        acceptedAnswer: { "@type": "Answer", text: plain(it.a) },
      })),
    },
  ];

  return shell({
    file: "syxnes-erotiseis.html",
    title: FAQ.title,
    desc: FAQ.desc,
    keywords: FAQ.keywords,
    main,
    schema,
  });
}

/* ---------- Πολιτική απορρήτου ---------- */
function privacyBlock(b) {
  if (b.type === "h3") return `            <h3>${b.text}</h3>`;
  if (b.type === "p") return `            <p>${b.text}</p>`;
  if (b.type === "ul")
    return `            <ul class="ticks">\n              ${b.items
      .map((i) => `<li>${i}</li>`)
      .join("\n              ")}\n            </ul>`;
  if (b.type === "table")
    return `            <div class="table-scroll">
              <table class="data-table">
                <caption class="visually-hidden">${b.caption}</caption>
                <thead>
                  <tr>${b.head.map((h) => `<th scope="col">${h}</th>`).join("")}</tr>
                </thead>
                <tbody>
                  ${b.rows
                    .map(
                      (r) =>
                        `<tr><th scope="row">${r[0]}</th>${r
                          .slice(1)
                          .map((c) => `<td>${c}</td>`)
                          .join("")}</tr>`
                    )
                    .join("\n                  ")}
                </tbody>
              </table>
            </div>`;
  return "";
}

function pagePrivacy() {
  const toc = PRIVACY.sections
    .map((sec) => `<li><a href="#${sec.id || slug(sec.h)}">${sec.h}</a></li>`)
    .join("\n                ");

  /* Τα id των ενοτήτων παράγονται ντετερμινιστικά ώστε να δουλεύει ο πίνακας
     περιεχομένων· όσες ενότητες έχουν δικό τους id το διατηρούν. */
  const sectionsWithIds = PRIVACY.sections
    .map(
      (sec) => `            <h2 id="${sec.id || slug(sec.h)}">${sec.h}</h2>
${sec.blocks.map(privacyBlock).join("\n")}`
    )
    .join("\n\n");

  const main = `  <main id="main">
${banner()}
    <section class="section section-white">
      <div class="sheet">
        <div class="doc-grid">
          <article class="prose">
            <h1 class="page-title">${PRIVACY.h1}</h1>
            <p class="lead">${PRIVACY.lead}</p>
            <p class="privacy-updated">Τελευταία ενημέρωση:
              <time datetime="${SITE.privacyUpdated}">${SITE.privacyUpdatedText}</time></p>

${sectionsWithIds}
          </article>

          <aside aria-label="Συνοπτικά">
            <div class="aside-card">
              <h2>Περιεχόμενα</h2>
              <ul class="toc">
                ${toc}
              </ul>
            </div>
            <div class="aside-card">
              <h2>Άσκηση δικαιωμάτων</h2>
              <p>Email: <a href="mailto:${SITE.email}">${SITE.email}</a><br />
                 Τηλέφωνο: <a href="tel:${SITE.phoneIntl}">${SITE.phoneDisplay}</a></p>
              <a href="epikoinonia.html" class="btn btn-round">Επικοινωνία</a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </main>`;

  return shell({ file: "politiki-aporritou.html", title: PRIVACY.title, desc: PRIVACY.desc, main });
}

/* ---------- Σελίδες σε αναμονή (Blog, Κριτικές) ---------- */
/* Κάρτα «Γράψε κριτική στο Google».
   Ο σύνδεσμος ανοίγει σε νέα καρτέλα· ο σκοπός και το άνοιγμα δηλώνονται
   και στους αναγνώστες οθόνης (WCAG 2.4.4 / 3.2.5). */
function reviewCta(r) {
  return `        <div class="review-cta">
          <p class="review-stars" aria-hidden="true">★★★★★</p>
          <h2>${r.h2}</h2>
          <p>${r.text}</p>
          <a class="btn btn-round" href="${esc(check("SITE.googleReview (σύνδεσμος κριτικής Google)", SITE.googleReview))}"
             target="_blank" rel="noopener noreferrer">${r.cta}<span class="visually-hidden"> (ανοίγει σε νέα καρτέλα)</span></a>
          <p class="review-note">${r.note}</p>
        </div>
`;
}

function pagePending(cfg) {
  const main = `  <main id="main">
${banner()}
    <section class="section section-white">
      <div class="sheet prose text-center">
        <p class="eyebrow">Σύντομα κοντά σου</p>
        <h1 class="page-title">${cfg.h1}</h1>
        <p class="lead">${cfg.lead}</p>
        <div class="pending-card">
          ${cfg.body.map((b) => `<p>${b}</p>`).join("\n          ")}
        </div>
${cfg.review ? reviewCta(cfg.review) : ""}        <div class="panel-actions panel-actions-center">
          ${cfg.links
            .map(
              /* Όταν υπάρχει η κάρτα κριτικής, εκείνη κρατά το κύριο κουμπί. */
              (l, i) =>
                `<a class="btn ${!cfg.review && i === 0 ? "btn-round" : "btn-outline"}" href="${l.href}">${l.label}</a>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>
  </main>`;

  return shell({
    file: cfg.file,
    title: cfg.title,
    desc: cfg.desc,
    main,
    noindex: true,
  });
}

/* ---------- Δήλωση προσβασιμότητας ---------- */
function pageAccessibility() {
  const main = `  <main id="main">
${banner()}
    <section class="section section-white">
      <div class="sheet">
        <div class="doc-grid">
          <article class="prose">
            <h1 class="page-title">${A11Y.h1}</h1>
            <p class="lead">${A11Y.lead}</p>

            <h2>Βαθμός συμμόρφωσης</h2>
            <p>Ο ιστότοπος έχει σχεδιαστεί ώστε να συμμορφώνεται με το <strong>Ευρωπαϊκό Εναρμονισμένο Πρότυπο EN 301 549</strong>, όπως αντικαθίσταται και ισχύει κάθε φορά, και κατά συνέπεια με τις <strong>Οδηγίες για την Προσβασιμότητα του Περιεχομένου του Ιστού (WCAG) έκδοση 2.1 του W3C, στο επίπεδο «AA»</strong>.</p>
            <p><strong>Δήλωση συμμόρφωσης:</strong> πλήρης συμμόρφωση με το WCAG 2.1 επίπεδο AA. Δεν έχουν εντοπιστεί μη συμμορφούμενα στοιχεία, πέραν όσων αναφέρονται ρητά στην ενότητα «Γνωστοί περιορισμοί».</p>

            <h3>Γιατί επίπεδο AA και όχι AAA</h3>
            <p>Το ανώτατο επίπεδο «AAA» απαιτείται για ιστότοπους και εφαρμογές που <em>απευθύνονται ειδικά σε άτομα με αναπηρία</em>. Ο παρών ιστότοπος αφορά υπηρεσίες διαιτολογίας προς το γενικό κοινό· η διατροφική υποστήριξη ατόμων με αναπηρία είναι μία από τις προσφερόμενες υπηρεσίες και δεν αποτελεί τον αποκλειστικό σκοπό του ιστότοπου. Ως εκ τούτου, το εφαρμοστέο επίπεδο είναι το «AA».</p>
            <p>Πέραν του απαιτούμενου επιπέδου, πληρούνται και τα ακόλουθα κριτήρια επιπέδου AAA: 1.4.8 (οπτική παρουσίαση), 2.1.3 (πληκτρολόγιο χωρίς εξαίρεση), 2.2.3 (χωρίς χρονικά όρια), 2.2.4 (χωρίς διακοπές), 2.3.1/2.3.2 (χωρίς αναλαμπές), 2.4.9 (σκοπός συνδέσμου από τον ίδιο τον σύνδεσμο), 2.4.10 (επικεφαλίδες ενοτήτων), 3.2.5 (αλλαγές μόνο κατόπιν αιτήματος) και 3.3.5 (βοήθεια στις φόρμες). Το κείμενο σώματος ξεπερνά επίσης το κατώφλι 7:1 του κριτηρίου 1.4.6.</p>

            <h2>Μέτρα προσβασιμότητας που έχουν ληφθεί</h2>

            <h3>Πλοήγηση αποκλειστικά με πληκτρολόγιο</h3>
            <p>Κάθε σύνδεσμος, κουμπί και πτυσσόμενο στοιχείο είναι προσβάσιμο με τα πλήκτρα <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>, <kbd>Enter</kbd>, <kbd>Space</kbd> και <kbd>Esc</kbd>, χωρίς παγίδευση εστίασης. Η σειρά εστίασης ακολουθεί τη λογική σειρά ανάγνωσης και το εστιασμένο στοιχείο επισημαίνεται πάντοτε με ευδιάκριτο περίγραμμα 3px υψηλής αντίθεσης.</p>
            <ul class="ticks">
              <li>Σύνδεσμοι παράλειψης στην αρχή κάθε σελίδας (περιεχόμενο, πλοήγηση, δήλωση προσβασιμότητας)</li>
              <li>Το μενού του κινητού αποκρύπτεται πλήρως (<code>visibility: hidden</code>) όταν είναι κλειστό, ώστε η εστίαση να μη «χάνεται» εκτός οθόνης</li>
              <li>Το πλήκτρο <kbd>Esc</kbd> κλείνει το μενού και το πάνελ προσβασιμότητας και επαναφέρει την εστίαση στο κουμπί που τα άνοιξε</li>
              <li>Η τρέχουσα σελίδα δηλώνεται προγραμματιστικά με <code>aria-current="page"</code></li>
              <li>Κάθε σύνδεσμος που ανοίγει σε νέα καρτέλα — όπως το «Κλείσε ραντεβού» της πλοήγησης — το δηλώνει ρητά στο προσβάσιμο όνομά του (WCAG 3.2.5)</li>
            </ul>

            <h3>Εναλλακτικό κείμενο εικόνων</h3>
            <p>Όλες οι πληροφοριακές εικόνες συνοδεύονται από περιγραφικό εναλλακτικό κείμενο (<code>alt</code>) για τους χρήστες αναγνωστών οθόνης. Οι διακοσμητικές εικόνες φέρουν κενό <code>alt=""</code>, ώστε να αγνοούνται από τις υποστηρικτικές τεχνολογίες, ενώ οι διακοσμητικές ταινίες εικόνας δηλώνονται με <code>role="presentation"</code>. Η αφίσα δημοσιότητας της Δ.ΥΠ.Α. συνοδεύεται από πλήρη μεταγραφή του κειμένου της.</p>

            <h3>Χρωματική αντίθεση</h3>
            <p>Όλοι οι συνδυασμοί κειμένου και φόντου έχουν ελεγχθεί υπολογιστικά ώστε ο λόγος αντίθεσης να είναι τουλάχιστον <strong>4,5:1</strong> για το κανονικό κείμενο και <strong>3:1</strong> για το μεγάλο κείμενο και τα στοιχεία διεπαφής. Το ανοιχτό λιλά της παλέτας (<code>#bf7eba</code>) χρησιμοποιείται <em>αποκλειστικά</em> διακοσμητικά και για περιγράμματα — ποτέ για κείμενο. Στα κουμπιά με λευκό κείμενο εφαρμόζεται σκουρότερη απόχρωση, ώστε να πληρούται το κατώφλι 4,5:1. Στον ήρωα της αρχικής η επικάλυψη της φωτογραφίας είναι εντονότερη από το εικαστικό πρότυπο, ώστε το λευκό κείμενο να παραμένει αναγνώσιμο. Η πληροφορία δεν μεταδίδεται ποτέ αποκλειστικά μέσω χρώματος.</p>

            <h3>Σημασιολογική δομή</h3>
            <p>Οι σελίδες χρησιμοποιούν σωστά σημασιολογικά στοιχεία HTML — <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;article&gt;</code>, <code>&lt;aside&gt;</code>, <code>&lt;footer&gt;</code> — και ιεραρχία επικεφαλίδων <code>&lt;h1&gt;</code> έως <code>&lt;h6&gt;</code> χωρίς κενά επίπεδα. Κάθε σελίδα έχει μία μοναδική <code>&lt;h1&gt;</code>, μοναδικό τίτλο και δηλωμένη γλώσσα (<code>lang="el"</code>). Οι λίστες υπηρεσιών και τιμών αποδίδονται με πραγματικές λίστες, όχι με αλλαγές γραμμής.</p>

            <h3>Πτυσσόμενες ερωτήσεις &amp; πίνακες</h3>
            <p>Οι συχνές ερωτήσεις αποδίδονται με τα εγγενή στοιχεία <code>&lt;details&gt;</code>/<code>&lt;summary&gt;</code>: ανοίγουν και κλείνουν με <kbd>Enter</kbd> ή <kbd>Space</kbd>, η κατάστασή τους ανακοινώνεται αυτόματα από τους αναγνώστες οθόνης και το περιεχόμενό τους παραμένει διαθέσιμο ακόμη και χωρίς JavaScript. Ο πίνακας νομικών βάσεων στην πολιτική απορρήτου χρησιμοποιεί πραγματικά <code>&lt;th scope&gt;</code> για γραμμές και στήλες, με λεζάντα για τους αναγνώστες οθόνης, και κυλίεται οριζόντια μέσα στο δικό του πλαίσιο ώστε η σελίδα να μη χρειάζεται ποτέ οριζόντια κύλιση.</p>

            <h3>Μέγεθος γραμματοσειράς &amp; μεγέθυνση</h3>
            <p>Το κείμενο μπορεί να μεγεθυνθεί έως <strong>200%</strong> από τον browser χωρίς απώλεια περιεχομένου ή λειτουργικότητας και χωρίς οριζόντια κύλιση. Όλα τα μεγέθη ορίζονται σε σχετικές μονάδες (<code>rem</code>) και τα σημεία θραύσης της διάταξης σε <code>em</code>, ώστε το layout να αναδιατάσσεται σωστά κατά τη μεγέθυνση. Η διάταξη λειτουργεί σε πλάτος ισοδύναμο με 320 pixel.</p>

            <h3>Εργαλείο προσβασιμότητας</h3>
            <p>Το κουμπί προσβασιμότητας κάτω δεξιά σε κάθε σελίδα προσφέρει: αύξηση/μείωση μεγέθους κειμένου (90–160%), λειτουργία υψηλής αντίθεσης, υπογράμμιση όλων των συνδέσμων και απενεργοποίηση των κινήσεων. Οι επιλογές αποθηκεύονται στη συσκευή σας, εφαρμόζονται πριν την πρώτη ζωγραφική της σελίδας (χωρίς αναλαμπή) και διατηρούνται κατά την πλοήγηση.</p>

            <h3>Κίνηση &amp; χρονικοί περιορισμοί</h3>
            <p>Οι μόνες κινήσεις του ιστότοπου είναι διακριτικές εμφανίσεις περιεχομένου κατά την κύλιση· απενεργοποιούνται αυτόματα όταν το λειτουργικό σύστημα δηλώνει προτίμηση για μειωμένη κίνηση (<code>prefers-reduced-motion</code>) και χειροκίνητα από το εργαλείο προσβασιμότητας. Δεν υπάρχει αυτόματα κινούμενο ή αναβοσβήνον περιεχόμενο και δεν επιβάλλονται χρονικά όρια σε καμία ενέργεια.</p>

            <h2>Αναρτημένα έγγραφα (non-web documents)</h2>
            <p>Το EN 301 549 (Κεφάλαιο 10) επεκτείνει τις απαιτήσεις προσβασιμότητας και στα έγγραφα που αναρτώνται στον ιστότοπο, όχι μόνο στις ιστοσελίδες. Για κάθε αναρτημένο αρχείο εφαρμόζεται η εξής πολιτική:</p>
            <ul class="ticks">
              <li>Το περιεχόμενο κάθε εγγράφου δημοσιεύεται <strong>και</strong> ως κείμενο HTML στον ιστότοπο, ώστε να είναι πλήρως προσβάσιμο ανεξάρτητα από τη μορφή του αρχείου.</li>
              <li>Τα αρχεία PDF παρέχονται σε <strong>επισημασμένη (tagged) μορφή</strong>, με δηλωμένη γλώσσα, τίτλο εγγράφου, λογική σειρά ανάγνωσης, δομή επικεφαλίδων και εναλλακτικό κείμενο στις εικόνες.</li>
              <li>Δεν αναρτώνται σαρωμένα έγγραφα ή εικόνες κειμένου χωρίς αντίστοιχο επίπεδο πραγματικού κειμένου.</li>
              <li>Ο τύπος και το μέγεθος κάθε αρχείου δηλώνονται στον σύνδεσμο λήψης.</li>
            </ul>
            <p>Η αφίσα δημοσιότητας της Δ.ΥΠ.Α. παραδόθηκε ως PDF με μετατροπή γραμματοσειρών σε καμπύλες (χωρίς κανέναν αναγνώσιμο χαρακτήρα). Για τον λόγο αυτό παράχθηκε προσβάσιμη εκδοχή, οπτικά ταυτόσημη με το πρωτότυπο, η οποία διαθέτει επίπεδο πραγματικού κειμένου, σήμανση δομής και περιγραφή της εικονογράφησης. Δείτε την στη <a href="chrimatodotisi.html">σελίδα χρηματοδότησης</a>.</p>

            <h2>Πρόσβαση στην υπηρεσία</h2>
            <p>Το διαιτολογικό γραφείο λειτουργεί <strong>αποκλειστικά διαδικτυακά</strong>: δεν απαιτείται μετακίνηση, επίσκεψη ή αναμονή σε φυσικό χώρο, γεγονός που αίρει από την αρχή τα εμπόδια πρόσβασης για άτομα με κινητική αναπηρία. Οι συνεδρίες πραγματοποιούνται με τον τρόπο που εξυπηρετεί κάθε άτομο — βιντεοκλήση, τηλεφωνική συνεδρία ή γραπτή επικοινωνία.</p>
            <p>Αν χρειάζεστε τα διατροφικά πλάνα ή τις οδηγίες σε εναλλακτική μορφή (μεγαλύτερη γραμματοσειρά, απλό κείμενο συμβατό με αναγνώστη οθόνης, ηχητική περιγραφή, απλοποιημένη γλώσσα), ενημερώστε μας κατά τον προγραμματισμό του ραντεβού και παρέχονται χωρίς επιπλέον κόστος.</p>

            <h2>Γνωστοί περιορισμοί</h2>
            <ul class="ticks">
              <li>Το ημερολόγιο online ραντεβού στη σελίδα Επικοινωνίας παρέχεται από τρίτο μέρος (Calendly) μέσα σε ενσωματωμένο πλαίσιο και <strong>δεν βρίσκεται υπό τον έλεγχό μας</strong>· ενδέχεται να μην πληροί πλήρως τα κριτήρια AA. Για τον λόγο αυτό δίνεται πάντοτε ισοδύναμη εναλλακτική διαδρομή: κλείσιμο ραντεβού τηλεφωνικά ή με email, με τα στοιχεία σε μορφή κειμένου διπλά στο πλαίσιο.</li>
              <li>Η αφίσα δημοσιότητας αποτελεί εξ ορισμού εικόνα κειμένου, καθώς πρόκειται για τυποποιημένο έντυπο τρίτου φορέα που δεν επιτρέπεται να τροποποιηθεί εικαστικά. Ολόκληρο το περιεχόμενό της διατίθεται σε μορφή HTML, ενώ το PDF έχει καταστεί επισημασμένο και αναγνώσιμο από υποστηρικτικές τεχνολογίες.</li>
              <li>Οι ενότητες «Blog» και «Κριτικές» βρίσκονται σε αναμονή περιεχομένου. Οι σελίδες τους είναι πλήρως προσβάσιμες, εξηγούν την κατάστασή τους σε κείμενο και προσφέρουν εναλλακτικές διαδρομές, ενώ παραμένουν εκτός ευρετηρίασης (<code>noindex</code>) μέχρι να δημοσιευτεί περιεχόμενο.</li>
              <li>Η γραμματοσειρά Comfortaa φορτώνεται από το Google Fonts. Σε περίπτωση αποτυχίας φόρτωσης, ο ιστότοπος εμφανίζεται κανονικά με τις εναλλακτικές γραμματοσειρές του συστήματος.</li>
            </ul>

            <h2>Προσωπικά δεδομένα</h2>
            <p>Ο τρόπος συλλογής και επεξεργασίας των προσωπικών σας δεδομένων — και ιδίως των δεδομένων υγείας — περιγράφεται αναλυτικά στην <a href="politiki-aporritou.html">Πολιτική Απορρήτου</a>. Αν χρειάζεστε το κείμενό της σε εναλλακτική μορφή, μας το ζητάτε και σας το στέλνουμε.</p>

            <h2>Υποβολή παρατηρήσεων &amp; διαδικασία εκτέλεσης</h2>
            <p>Αν συναντήσετε εμπόδιο προσβασιμότητας ή χρειάζεστε κάποιο περιεχόμενο σε εναλλακτική μορφή, επικοινωνήστε μαζί μας:</p>
            <ul class="ticks">
              <li>Email: <a href="mailto:${SITE.email}">${SITE.email}</a></li>
              <li>Τηλέφωνο: <a href="tel:${SITE.phoneIntl}">${SITE.phoneDisplay}</a></li>
              <li><a href="epikoinonia.html">Σελίδα επικοινωνίας</a></li>
            </ul>
            <p>Απαντάμε σε αιτήματα προσβασιμότητας το συντομότερο δυνατό και το αργότερο εντός δέκα εργάσιμων ημερών. Αν η απάντηση δεν σας ικανοποιεί, μπορείτε να απευθυνθείτε στον <a href="https://www.synigoros.gr/" target="_blank" rel="noopener noreferrer">Συνήγορο του Πολίτη</a> (ανοίγει σε νέα καρτέλα).</p>

            <p class="disclaimer">Η παρούσα δήλωση αφορά τον ιστότοπο ${SITE.BASE.replace("https://", "")} και συντάχθηκε βάσει αυτοαξιολόγησης, με συνδυασμό αυτοματοποιημένου ελέγχου, υπολογιστικής επαλήθευσης των λόγων αντίθεσης και χειροκίνητης δοκιμής πλοήγησης με πληκτρολόγιο. Τελευταία ενημέρωση: <time datetime="${SITE.a11yUpdated}">${SITE.a11yUpdatedText}</time>.</p>
          </article>

          <aside aria-label="Συνοπτικά">
            <div class="aside-card">
              <h2>Με μια ματιά</h2>
              <p>Πρότυπο: EN 301 549<br />Οδηγίες: WCAG 2.1 — επίπεδο AA<br />Κατάσταση: πλήρης συμμόρφωση<br />Έγγραφα: επισημασμένα (tagged) PDF<br />Μέθοδος: αυτοαξιολόγηση</p>
              <a href="epikoinonia.html" class="btn btn-round">Αναφορά προβλήματος</a>
            </div>
            <div class="aside-card">
              <h2>Συντομεύσεις πληκτρολογίου</h2>
              <p><kbd>Tab</kbd> — επόμενο στοιχείο<br /><kbd>Shift</kbd>+<kbd>Tab</kbd> — προηγούμενο<br /><kbd>Enter</kbd> — ενεργοποίηση<br /><kbd>Esc</kbd> — κλείσιμο μενού/παραθύρου</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </main>`;

  return shell({ file: "prosvasimotita.html", title: A11Y.title, desc: A11Y.desc, main });
}

/* ---------- Χρηματοδότηση ---------- */
function pageFunding() {
  const main = `  <main id="main">
${banner()}
    <section class="section section-white" aria-labelledby="funding-title">
      <div class="sheet">
        <div class="doc-grid">
          <div class="prose">
            <h1 class="page-title">${FUNDING.h1}</h1>
            <p class="lead">${FUNDING.lead}</p>

            <h2 id="funding-title">${FUNDING.actionTitle}</h2>
            <p>${FUNDING.actionScope}</p>

            <h2>Φορέας υλοποίησης</h2>
            <p>${FUNDING.body}</p>

            <h2>Πλαίσιο χρηματοδότησης</h2>
            <p>${FUNDING.framework}</p>
            <ul class="ticks">
              ${FUNDING.logos.map((l) => `<li>${l}</li>`).join("\n              ")}
            </ul>

            <div class="a11y-note">
              <img src="${IMG.accessibility}" alt="" width="48" height="48" class="a11y-keep" />
              <p>Το πρωτότυπο αρχείο της αφίσας δεν περιείχε κανέναν αναγνώσιμο χαρακτήρα (οι γραμματοσειρές είχαν μετατραπεί σε καμπύλες). Το PDF που διατίθεται εδώ είναι <strong>επισημασμένο (tagged)</strong>, οπτικά ταυτόσημο με το πρωτότυπο, με επίπεδο πραγματικού κειμένου, δηλωμένη γλώσσα, λογική σειρά ανάγνωσης και περιγραφή της εικονογράφησης — σύμφωνα με το EN 301 549, Κεφ. 10. Δείτε τη <a href="prosvasimotita.html">δήλωση προσβασιμότητας</a>.</p>
            </div>
          </div>

          <figure class="poster-figure">
            <img src="${IMG.poster}" width="910" height="1287" alt="${FUNDING.posterAlt}" />
            <figcaption>
              Αφίσα δημοσιότητας Δ.ΥΠ.Α.<br />
              <a href="assets/dypa-poster.pdf" target="_blank" rel="noopener noreferrer">Λήψη προσβάσιμου PDF (2 MB, ανοίγει σε νέα καρτέλα)</a><br />
              <a href="assets/dypa-poster-original.pdf" target="_blank" rel="noopener noreferrer">Λήψη πρωτότυπου αρχείου όπως παραδόθηκε (2 MB, ανοίγει σε νέα καρτέλα)</a>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  </main>`;

  return shell({ file: "chrimatodotisi.html", title: FUNDING.title, desc: FUNDING.desc, main });
}

/* ============================================================
   Εγγραφή αρχείων
   ============================================================ */
const PAGES = [
  ["index.html", pageHome(), "1.0", "weekly"],
  ["liga-logia.html", pageAbout(), "0.9", "monthly"],
  ["biografiko.html", pageBio(), "0.8", "yearly"],
  ["methodos.html", pageMethod(), "0.8", "yearly"],
  ["ypiresies.html", pageServices(), "0.9", "monthly"],
  ["syxnes-erotiseis.html", pageFaq(), "0.8", "monthly"],
  ["epikoinonia.html", pageContact(), "0.9", "monthly"],
  ["politiki-aporritou.html", pagePrivacy(), "0.4", "yearly"],
  ["prosvasimotita.html", pageAccessibility(), "0.5", "yearly"],
  ["chrimatodotisi.html", pageFunding(), "0.5", "yearly"],
];

/* Σελίδες σε αναμονή: παράγονται, αλλά μένουν εκτός sitemap όσο φέρουν noindex. */
const PENDING_PAGES = PENDING.map((cfg) => [cfg.file, pagePending(cfg)]);

function write(rel, content) {
  const abs = join(ROOT, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content, "utf8");
  return rel;
}

const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(
  ([file, , prio, freq]) => `  <url>
    <loc>${url(file)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${prio}</priority>
  </url>`
).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Sitemap: ${SITE.BASE}/sitemap.xml
`;

/* ---------- εκτέλεση ---------- */
check("SITE.calendly (σύνδεσμος ημερολογίου ραντεβού)", SITE.calendly);

const written = PAGES.map(([file, html]) => write(file, html));
PENDING_PAGES.forEach(([file, html]) => written.push(write(file, html)));
written.push(write("sitemap.xml", sitemap));
written.push(write("robots.txt", robots));

console.log(`✔ Παρήχθησαν ${written.length} αρχεία:`);
written.forEach((f) => console.log(`  · ${f}`));

if (warnings.length) {
  console.log(`\n⚠ Εκκρεμή στοιχεία πελάτη (${warnings.length}):`);
  warnings.forEach((w) => console.log(`  · ${w}`));
  console.log("Συμπληρώστε τα στο build/data.mjs και τρέξτε ξανά το build.");
} else {
  console.log("\n✔ Κανένα εκκρεμές στοιχείο πελάτη.");
}
