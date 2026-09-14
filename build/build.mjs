// ============================================================
//  YOUR SAFE PLACE — static site generator
//  Run:  node build/build.mjs
// ============================================================
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE, BIZ, SERVICES, AREAS, POSTS, GALLERY } from "./data.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = (p, html) => {
  const full = resolve(ROOT, p);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html.trimStart() + "\n");
};

// depth-aware helpers -------------------------------------------------
const rel = (depth, p) => "../".repeat(depth) + p;
const abs = (p) => `${BASE}/${p}`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => esc(s).replace(/"/g, "&quot;");

// ---- inline line-art icons ------------------------------------------
const svg = (vb, body) =>
  `<svg class="ico" viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

const ICONS = {
  // Πολυθρόνα — ατομική συνεδρία (γραμμή εμπνευσμένη από το λογότυπο)
  chair: svg(
    "0 0 44 44",
    `<path d="M12 12c0-2.2 1.8-4 4-4h12c2.2 0 4 1.8 4 4v13H12V12Z"/>
     <path d="M12 18H9.5A3.5 3.5 0 0 0 6 21.5V29h32v-7.5a3.5 3.5 0 0 0-3.5-3.5H32"/>
     <path d="M6 29h32"/><path d="M10 29v7"/><path d="M34 29v7"/>`
  ),
  // Δύο άνθρωποι — θεραπεία ζευγαριών / σχέσεις
  couple: svg(
    "0 0 44 44",
    `<circle cx="15" cy="14" r="6"/>
     <path d="M5 37c0-6 4.5-11 10-11s10 5 10 11"/>
     <circle cx="31" cy="17" r="5"/>
     <path d="M25 37c0-5.2 3.4-9.5 8-9.5s8 4.3 8 9.5"/>`
  ),
  // Φυτό — ανάπτυξη, παιδιά & έφηβοι
  leaf: svg(
    "0 0 44 44",
    `<path d="M22 39V19"/>
     <path d="M22 23c-8.5 0-13-5-13-13 8.5 0 13 5 13 13Z"/>
     <path d="M22 27c8 0 12-4.6 12-12-8 0-12 4.6-12 12Z"/>`
  ),
  // Σπίτι — συμβουλευτική γονέων
  house: svg(
    "0 0 44 44",
    `<path d="M7 20.5 22 8l15 12.5"/>
     <path d="M11 19.5V36h22V19.5"/>
     <path d="M18 36V26.5h8V36"/>`
  ),
  // Δείκτης τοποθεσίας
  pin: `<svg class="ico-pin" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2.2a7 7 0 0 0-7 7c0 5 7 12.6 7 12.6s7-7.6 7-12.6a7 7 0 0 0-7-7Zm0 9.6a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2Z"/></svg>`,
  // Βέλος κύλισης
  arrowDown: `<svg class="ico-arrow" viewBox="0 0 16 34" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 2v29M2.5 25.5 8 31.5l5.5-6"/></svg>`,
};

// σειρά εικονιδίων ανά υπηρεσία (ίδια με το SERVICES)
const SVC_ICONS = [ICONS.chair, ICONS.couple, ICONS.house, ICONS.leaf];
const svcIcon = (i) => SVC_ICONS[i % SVC_ICONS.length];

// ---- structured data: το γραφείο (Psychologist / LocalBusiness) -----
const practiceLD = {
  "@type": ["Psychologist", "MedicalBusiness", "LocalBusiness"],
  "@id": `${BASE}/#practice`,
  name: BIZ.name,
  alternateName: BIZ.legalName,
  slogan: BIZ.tagline,
  url: BASE + "/",
  telephone: BIZ.phoneIntl,
  email: BIZ.email,
  image: abs("assets/lina-lefkou.jpg"),
  logo: abs("assets/logo.png"),
  priceRange: "€€",
  currenciesAccepted: "EUR",
  address: {
    "@type": "PostalAddress",
    streetAddress: BIZ.street,
    addressLocality: BIZ.city,
    addressRegion: BIZ.region,
    postalCode: BIZ.postal,
    addressCountry: BIZ.country,
  },
  geo: { "@type": "GeoCoordinates", latitude: BIZ.lat, longitude: BIZ.lng },
  hasMap: `https://www.google.com/maps?q=${encodeURIComponent(BIZ.street + ", " + BIZ.city + " " + BIZ.postal)}`,
  areaServed: ["Θεσσαλονίκη", "Καλαμαριά", "Τούμπα", "Άνω Πόλη", "Πυλαία", "Νεάπολη", "Σταυρούπολη", "Εύοσμος"],
  sameAs: [BIZ.instagram, BIZ.facebook, BIZ.google],
  availableService: SERVICES.map((s) => ({ "@type": "MedicalTherapy", name: s.h1 })),
  founder: {
    "@type": "Person",
    name: BIZ.doctor,
    jobTitle: BIZ.role,
  },
};

const jsonLd = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;

const breadcrumbLD = (depth, trail) => ({
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

// ---- <head> ---------------------------------------------------------
function head({ depth, title, desc, canonical, keywords, ld = [], image = "assets/space-1.jpg", type = "website" }) {
  const r = (p) => rel(depth, p);
  const ldTags = ld.map(jsonLd).join("\n  ");
  return `
<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${attr(desc)}" />
  ${keywords ? `<meta name="keywords" content="${attr(keywords)}" />` : ""}
  <meta name="author" content="${attr(BIZ.legalName)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="theme-color" content="#f9f7f4" />
  <link rel="canonical" href="${abs(canonical)}" />

  <meta property="og:site_name" content="${attr(BIZ.name)}" />
  <meta property="og:locale" content="el_GR" />
  <meta property="og:type" content="${type}" />
  <meta property="og:title" content="${attr(title)}" />
  <meta property="og:description" content="${attr(desc)}" />
  <meta property="og:url" content="${abs(canonical)}" />
  <meta property="og:image" content="${abs(image)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${attr(title)}" />
  <meta name="twitter:description" content="${attr(desc)}" />
  <meta name="twitter:image" content="${abs(image)}" />

  <link rel="icon" type="image/png" href="${r("assets/logo-mark.png")}" />
  <link rel="apple-touch-icon" href="${r("assets/logo-mark.png")}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Alegreya+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Noto+Serif+Display:ital,wght@0,200;0,300;0,400;1,200;1,300&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${r("styles.css")}" />
  <script>(function(){var d=document.documentElement,seen=false;try{seen=sessionStorage.getItem("ysp-intro")==="1"}catch(e){}if(seen)return;d.className+=" intro";try{sessionStorage.setItem("ysp-intro","1")}catch(e){}})();</script>
  ${ldTags ? "\n  " + ldTags : ""}
</head>
<body>
  <div class="intro-screen" id="intro" aria-hidden="true">
    <div class="intro-inner">
      <img src="${r("assets/logo.png")}" alt="" width="192" height="120" />
      <span class="intro-rule"><i></i></span>
    </div>
  </div>`;
}

// ---- header ---------------------------------------------------------
function header(depth, active = "") {
  const r = (p) => rel(depth, p);
  const on = (k) => (active === k ? ' aria-current="page"' : "");
  const svcLinks = SERVICES.map(
    (s) => `<li><a href="${r("ypiresies/" + s.slug + ".html")}">${esc(s.nav)}</a></li>`
  ).join("\n            ");
  return `
  <a class="skip-link" href="#main">Μετάβαση στο περιεχόμενο</a>
  <header class="site-header${active === "home" ? " site-header--home" : ""}" id="top">
    <nav class="nav container" aria-label="Κύρια πλοήγηση">
      <a href="${r("index.html")}" class="brand" aria-label="${attr(BIZ.name)} — Αρχική">
        <img src="${r("assets/logo.png")}" alt="${attr(BIZ.name)}" class="brand-logo" width="192" height="120" />
      </a>
      <button class="nav-toggle" aria-label="Άνοιγμα μενού" aria-expanded="false"><span></span><span></span><span></span></button>
      <ul class="nav-links">
        <li><a href="${r("index.html")}"${on("home")}>Αρχική</a></li>
        <li><a href="${r("i-psychologos.html")}"${on("about")}>Η Ψυχολόγος</a></li>
        <li class="has-sub">
          <a href="${r("ypiresies/index.html")}"${on("services")}>Υπηρεσίες</a>
          <ul class="sub">
            ${svcLinks}
          </ul>
        </li>
        <li><a href="${r("blog/index.html")}"${on("blog")}>Blog</a></li>
        <li><a href="${r("epikoinonia.html")}"${on("contact")}>Επικοινωνία</a></li>
        <li><a href="${r("epikoinonia.html")}#rantevou" class="btn btn-nav">Ραντεβού</a></li>
      </ul>
    </nav>
  </header>`;
}

// ---- breadcrumb visual ---------------------------------------------
function crumbs(depth, trail) {
  const r = (p) => rel(depth, p);
  const items = trail
    .map((t, i) =>
      i === trail.length - 1
        ? `<span aria-current="page">${esc(t.name)}</span>`
        : `<a href="${r(t.rel)}">${esc(t.name)}</a><span class="sep">/</span>`
    )
    .join(" ");
  return `<nav class="crumbs container" aria-label="Breadcrumb">${items}</nav>`;
}

// ---- CTA band -------------------------------------------------------
function ctaBand(depth) {
  const r = (p) => rel(depth, p);
  return `
  <section class="cta-band">
    <div class="container cta-inner">
      <div>
        <p class="eyebrow">Κλείστε ραντεβού</p>
        <h2 class="cta-title">Το πρώτο βήμα είναι πάντα το πιο δύσκολο.</h2>
        <p class="cta-sub">Οι συνεδρίες πραγματοποιούνται κατόπιν ραντεβού, Δευτέρα έως Παρασκευή. Επικοινωνήστε μαζί μου για να βρούμε μαζί μια ώρα που σας εξυπηρετεί.</p>
      </div>
      <div class="cta-actions">
        <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary">Καλέστε ${esc(BIZ.phoneDisplay)}</a>
        <a href="mailto:${BIZ.email}" class="btn btn-ghost">Στείλτε Email</a>
        <a href="${r("epikoinonia.html")}#rantevou" class="btn btn-ghost">Επικοινωνία &amp; Ραντεβού</a>
      </div>
    </div>
  </section>`;
}

// ---- footer ---------------------------------------------------------
function footer(depth) {
  const r = (p) => rel(depth, p);
  const svcCols = SERVICES.map(
    (s) => `<a href="${r("ypiresies/" + s.slug + ".html")}">${esc(s.nav)}</a>`
  ).join("\n          ");
  return `
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <img src="${r("assets/logo.png")}" alt="${attr(BIZ.name)}" class="footer-logo" width="192" height="120" />
        <p class="footer-tag">${esc(BIZ.tagline)}</p>
        <p class="footer-addr">
          ${esc(BIZ.street)}<br />
          ${esc(BIZ.city)}, Τ.Κ. ${esc(BIZ.postal)}
        </p>
        <div class="footer-social">
          <a href="${BIZ.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
          <a href="${BIZ.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a>
          <a href="${BIZ.google}" target="_blank" rel="noopener noreferrer" aria-label="Google">Google</a>
        </div>
      </div>

      <div class="footer-col">
        <h3>Υπηρεσίες</h3>
        <nav aria-label="Υπηρεσίες" class="footer-links">
          ${svcCols}
        </nav>
      </div>

      <div class="footer-col">
        <h3>Εξερεύνηση</h3>
        <nav aria-label="Πλοήγηση" class="footer-links">
          <a href="${r("index.html")}">Αρχική</a>
          <a href="${r("i-psychologos.html")}">Η Ψυχολόγος</a>
          <a href="${r("ypiresies/index.html")}">Όλες οι Υπηρεσίες</a>
          <a href="${r("blog/index.html")}">Blog</a>
          <a href="${r("epikoinonia.html")}">Επικοινωνία</a>
        </nav>
      </div>

      <div class="footer-col">
        <h3>Επικοινωνία</h3>
        <nav aria-label="Επικοινωνία" class="footer-links">
          <a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a>
          <a href="mailto:${BIZ.email}">${esc(BIZ.email)}</a>
        </nav>
        <p class="footer-hours">${esc(BIZ.hours)}</p>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="footer-copy">© <span id="year">2026</span> ${esc(BIZ.legalName)}. Με επιφύλαξη παντός δικαιώματος.</p>
      <p class="cb-credit">Made by <a href="https://clinicbrain.gr/?utm_source=client-site&amp;utm_medium=footer&amp;utm_campaign=made-by" target="_blank" rel="noopener noreferrer">CLINICBRAIN</a></p>
    </div>

    <p class="footer-areas">
      Εξυπηρετώ: ${AREAS.map((a) => `<a href="${r("perioches/" + a.slug + ".html")}">${esc(a.name)}</a>`).join(" <span aria-hidden=\"true\">·</span> ")}
    </p>
  </footer>
  <script src="${r("main.js")}" defer></script>
</body>
</html>`;
}

// ---- gallery (κοινό block) ------------------------------------------
function gallerySection(depth, { title = "Ο χώρος", lead = "" } = {}) {
  const r = (p) => rel(depth, p);
  const items = GALLERY.map(
    (g) => `
          <figure class="gal-item reveal">
            <img src="${r("assets/" + g.file)}" alt="${attr(g.alt)}" width="1600" height="1068" loading="lazy" />
          </figure>`
  ).join("");
  return `
    <section class="gallery" id="o-choros">
      <div class="container">
        <div class="section-head reveal">
          <h2 class="section-title">${esc(title)}</h2>
          ${lead ? `<p class="page-lead">${esc(lead)}</p>` : ""}
        </div>
        <div class="gal-grid">${items}
        </div>
      </div>
    </section>`;
}

// ====================================================================
//  PAGE: HOME
// ====================================================================
function pageHome() {
  const depth = 0;
  const r = (p) => rel(depth, p);
  const svcCards = SERVICES.map(
    (s, i) => `
        <a class="svc reveal" href="${r("ypiresies/" + s.slug + ".html")}">
          <span class="svc-icon" aria-hidden="true">${svcIcon(i)}</span>
          <span class="svc-num">${String(i + 1).padStart(2, "0")}</span>
          <h3>${esc(s.nav)}</h3>
          <p>${esc(s.lead)}</p>
          <span class="svc-more">Περισσότερα</span>
        </a>`
  ).join("");

  const homeFaq = [
    [
      "Πώς κλείνω το πρώτο μου ραντεβού;",
      "Τηλεφωνικά στο 697 236 0335 ή με email στο l.lefkou@yahoo.gr. Θα κανονίσουμε μαζί ημέρα και ώρα που σας εξυπηρετεί. Δεν υπάρχει online κράτηση — η πρώτη επικοινωνία γίνεται πάντα προσωπικά.",
    ],
    [
      "Πόσο διαρκεί μια συνεδρία;",
      "Η ατομική συνεδρία διαρκεί μία ώρα. Η συνεδρία ζευγαριού διαρκεί μιάμιση ώρα.",
    ],
    [
      "Κάθε πότε γίνονται οι συνεδρίες;",
      "Συνήθως μία φορά την εβδομάδα, σε σταθερή ημέρα και ώρα. Η συχνότητα προσαρμόζεται στις ανάγκες και στον ρυθμό σας και επανεξετάζεται μαζί, όσο προχωρά η διαδικασία.",
    ],
    [
      "Τι ισχύει για την εμπιστευτικότητα;",
      "Όσα συζητούνται στις συνεδρίες καλύπτονται πλήρως από το επαγγελματικό απόρρητο και τον κώδικα δεοντολογίας των ψυχολόγων.",
    ],
  ];
  const faqItems = homeFaq
    .map(
      ([q, a]) =>
        `<details class="faq-item reveal"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`
    )
    .join("\n          ");

  const ld = [
    { "@context": "https://schema.org", ...practiceLD },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: BIZ.name,
      url: BASE + "/",
      inLanguage: "el",
    },
    breadcrumbLD(depth, [{ name: "Αρχική", path: "index.html" }]),
    faqLD(homeFaq),
  ];

  return head({
    depth,
    title: "Ψυχολόγος Θεσσαλονίκη | YOUR SAFE PLACE — Λίνα Λεύκου, MSc",
    desc: "YOUR SAFE PLACE — Λίνα Λεύκου, MSc Ψυχολόγος & Ψυχοθεραπεύτρια στο κέντρο της Θεσσαλονίκης. Ατομική ψυχοθεραπεία, θεραπεία ζευγαριών, συμβουλευτική γονέων, υποστήριξη παιδιών & εφήβων. Κατόπιν ραντεβού.",
    canonical: "index.html",
    keywords: "ψυχολόγος Θεσσαλονίκη, ψυχοθεραπεύτρια Θεσσαλονίκη, ατομική ψυχοθεραπεία, θεραπεία ζευγαριών, συμβουλευτική γονέων, ψυχολόγος παιδιών εφήβων, Λίνα Λεύκου",
    ld,
  }) +
    header(depth, "home") +
    `
  <main id="main">
    <section class="hero" id="hero">
      <div class="hero-copy">
        <h1 class="hero-title reveal">Ένας χώρος για να <em>σταθείς</em>.</h1>
        <p class="hero-tagline reveal">Ψυχοθεραπεία για ενήλικες, ζευγάρια, γονείς &amp; εφήβους — στο κέντρο της Θεσσαλονίκης.</p>
        <div class="hero-actions reveal">
          <a href="${r("epikoinonia.html")}#rantevou" class="btn btn-primary">Κλείστε ραντεβού</a>
          <a href="${r("ypiresies/index.html")}" class="btn btn-ghost">Οι υπηρεσίες</a>
        </div>
        <p class="hero-meta reveal">${ICONS.pin}<span>${esc(BIZ.street)}, ${esc(BIZ.city)}</span></p>
      </div>
      <div class="hero-media">
        <img src="${r("assets/space-2.jpg")}" alt="Ο χώρος ψυχοθεραπείας YOUR SAFE PLACE στη Θεσσαλονίκη — πολυθρόνα, φυτά και ζεστοί γήινοι τόνοι" width="1065" height="1600" fetchpriority="high" />
      </div>
    </section>

    <section class="statement">
      <div class="container statement-inner reveal">
        <span class="statement-rule" aria-hidden="true"></span>
        <h2>Τα βγάζεις πέρα, κρατάς τα πάντα όρθια — κι όμως, <em>κάτι δεν πάει καλά</em>;</h2>
        <p>Ίσως είναι ένα άγχος που δεν λέει να καταλαγιάσει. Μοτίβα που επαναλαμβάνονται, όσο κι αν προσπαθείς. Μια κούραση που δεν περνά με τον ύπνο. Αν κάτι από αυτά σού θυμίζει κάτι δικό σου, η ψυχοθεραπεία είναι ο χώρος να επιβραδύνεις και να δεις τι υπάρχει από κάτω.</p>
      </div>
    </section>

    <section class="split" id="diadikasia">
      <div class="split-media reveal">
        <img src="${r("assets/space-1.jpg")}" alt="Ο χώρος συνεδριών του YOUR SAFE PLACE — καναπές, πολυθρόνα και φυσικό φως" width="1600" height="1068" loading="lazy" />
      </div>
      <div class="split-copy">
        <h2 class="section-title reveal">Η διαδικασία</h2>
        <p class="reveal">Οι άνθρωποι που έρχονται εδώ έχουν συνήθως γεμάτες ζωές, σχέσεις που τους νοιάζουν και μεγάλη ικανότητα να φροντίζουν τους άλλους. Κι όμως, κάτω από την επιφάνεια, υπάρχει συχνά ένα βάρος που δύσκολα ονομάζεται.</p>
        <p class="reveal">Πιστεύω ότι όταν επιβραδύνουμε και στρέφουμε την προσοχή μας σε όσα ζούμε — μέσα μας και γύρω μας — αρχίζουν να δημιουργούνται οι συνθήκες για να αλλάξει κάτι.</p>
        <p class="reveal">Σιγά σιγά αρχίζεις να αναγνωρίζεις τι διαμορφώνει τον εσωτερικό σου κόσμο: μοτίβα, συναισθήματα, πεποιθήσεις. Και υπάρχει πια χώρος να τα νιώσεις και να καταλάβεις την ιστορία που κρύβεται πίσω τους.</p>
      </div>
    </section>

    <section class="split split--flip" id="prosengisi">
      <div class="split-media reveal">
        <img src="${r("assets/space-7.jpg")}" alt="Λεπτομέρεια από τον χώρο του γραφείου ψυχοθεραπείας στη Θεσσαλονίκη" width="1600" height="1068" loading="lazy" />
      </div>
      <div class="split-copy">
        <h2 class="section-title reveal">Η <em>προσέγγισή</em> μου</h2>
        <p class="reveal">Η δουλειά μας είναι συνεργατική. Στηρίζεται στη <strong>Συστημική Θεραπεία</strong> και στην <strong>Αφηγηματική Ψυχοθεραπεία</strong> — προσεγγίσεις που βλέπουν κάθε άνθρωπο μέσα στο πλαίσιο των σχέσεών του και της προσωπικής του ιστορίας.</p>
        <p class="reveal">Αυτό μας επιτρέπει να δούμε πώς παλιά μοτίβα και τρόποι επιβίωσης εξακολουθούν να επηρεάζουν το σήμερα, χωρίς να χάνουμε την επαφή με όσα συμβαίνουν στην πραγματική σου ζωή.</p>
        <p class="reveal">Ο στόχος δεν είναι να αναλύσουμε τα πάντα, αλλά να καταλάβουμε τι υπάρχει από κάτω — ώστε να έρθει μεγαλύτερη αυτογνωσία, πιο ήρεμη σχέση με τα συναισθήματα και σχέσεις που σε γεμίζουν.</p>
        <p class="split-label reveal">Απευθύνομαι σε</p>
        <ul class="split-list reveal">
          <li>Ενήλικες που αναζητούν ατομική υποστήριξη</li>
          <li>Ζευγάρια σε δύσκολη ή κρίσιμη καμπή</li>
          <li>Γονείς που θέλουν να στηρίξουν διαφορετικά το παιδί τους</li>
          <li>Παιδιά και εφήβους</li>
        </ul>
      </div>
    </section>

    <section class="about" id="about">
      <div class="about-media reveal">
        <img src="${r("assets/lina-lefkou.jpg")}" alt="Λίνα Λεύκου, MSc Ψυχολόγος – Ψυχοθεραπεύτρια, YOUR SAFE PLACE Θεσσαλονίκη" width="1065" height="1600" loading="lazy" />
      </div>
      <div class="about-copy">
        <h2 class="section-title reveal">Λίνα Λεύκου</h2>
        <p class="about-role reveal">MSc Ψυχολόγος – Ψυχοθεραπεύτρια</p>
        <p class="reveal">Είμαι η Λίνα Λεύκου, Ψυχολόγος και Ψυχοθεραπεύτρια, με μεταπτυχιακές σπουδές στη Σχολική και Εξελικτική Ψυχολογία.</p>
        <p class="reveal">Στη θεραπευτική διαδικασία επιδιώκω να δημιουργώ έναν ασφαλή και ουσιαστικό χώρο, όπου μπορείς να κατανοήσεις όσα σε δυσκολεύουν, να αναγνωρίσεις τις δυνατότητές σου και να αναζητήσεις νέους τρόπους σύνδεσης με τον εαυτό σου και τους άλλους.</p>
        <p class="split-label reveal">Εκπαίδευση &amp; σπουδές</p>
        <ul class="split-list reveal">
          <li>MSc Σχολική &amp; Εξελικτική Ψυχολογία</li>
          <li>Εκπαίδευση στη Συστημική Θεραπεία Ζευγαριών</li>
          <li>Εκπαίδευση στην Αφηγηματική Ψυχοθεραπεία</li>
          <li>Τήρηση του κώδικα δεοντολογίας των ψυχολόγων</li>
        </ul>
        <a href="${r("i-psychologos.html")}" class="btn btn-ghost reveal">Το πλήρες βιογραφικό</a>
      </div>
    </section>

    <section class="services" id="services">
      <div class="container">
        <div class="section-head reveal">
          <h2 class="section-title">Υπηρεσίες</h2>
          <p class="page-lead">Υποστήριξη για κάθε στιγμή της διαδρομής — ατομικά, ως ζευγάρι ή ως οικογένεια.</p>
        </div>
        <div class="services-grid">${svcCards}
        </div>
      </div>
    </section>
` +
    gallerySection(depth, {
      title: "Ο χώρος",
      lead: "Το γραφείο βρίσκεται στο κέντρο της Θεσσαλονίκης, στην Εγνατίας 54 — ένας χώρος φυσικού φωτός και ησυχίας, σχεδιασμένος ώστε να νιώθεις άνετα από το πρώτο λεπτό.",
    }) +
    `
    <section class="booking" id="pos-xekiname">
      <div class="container">
        <h2 class="section-title reveal">Πώς ξεκινάμε —</h2>
        <div class="booking-grid">
          <div class="booking-media reveal">
            <img src="${r("assets/space-4.jpg")}" alt="Το γραφείο του YOUR SAFE PLACE με θέα στο κέντρο της Θεσσαλονίκης" width="1600" height="1068" loading="lazy" />
          </div>
          <div class="booking-steps">
            <div class="step reveal">
              <span class="step-n">01. Επικοινωνία</span>
              <p>Μια σύντομη τηλεφωνική επικοινωνία ή ένα email, για να μου πείτε τι σας φέρνει εδώ. Απαντώ το συντομότερο δυνατό.</p>
            </div>
            <div class="step reveal">
              <span class="step-n">02. Κανονίζουμε την πρώτη συνάντηση</span>
              <p>Βρίσκουμε μαζί ημέρα και ώρα, Δευτέρα έως Παρασκευή, και λύνουμε τυχόν πρακτικές απορίες πριν έρθετε.</p>
            </div>
            <div class="step reveal">
              <span class="step-n">03. Ξεκινάμε</span>
              <p>Στην πρώτη συνεδρία γνωριζόμαστε, χωρίς πίεση. Αν νιώσετε ότι ταιριάζουμε, σχεδιάζουμε μαζί τη συνέχεια.</p>
            </div>
            <a href="${r("epikoinonia.html")}#rantevou" class="btn btn-ghost reveal">Κλείστε ραντεβού</a>
          </div>
        </div>
      </div>
    </section>

    <section class="faq-section" id="erotiseis">
      <div class="container">
        <h2 class="section-title reveal">Συχνές ερωτήσεις</h2>
        <div class="faq">
          ${faqItems}
        </div>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: ABOUT
// ====================================================================
function pageAbout() {
  const depth = 0;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Η Ψυχολόγος", rel: "i-psychologos.html", path: "i-psychologos.html" },
  ];
  const ld = [
    breadcrumbLD(depth, trail),
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: BIZ.doctor,
      jobTitle: BIZ.role,
      image: abs("assets/lina-lefkou.jpg"),
      url: abs("i-psychologos.html"),
      knowsAbout: [
        "Ατομική ψυχοθεραπεία",
        "Συστημική θεραπεία ζευγαριών",
        "Αφηγηματική ψυχοθεραπεία",
        "Σχολική & εξελικτική ψυχολογία",
        "Συμβουλευτική γονέων",
      ],
      worksFor: { "@id": `${BASE}/#practice` },
      sameAs: [BIZ.instagram, BIZ.facebook],
    },
  ];
  return head({
    depth,
    title: "Λίνα Λεύκου — MSc Ψυχολόγος & Ψυχοθεραπεύτρια | YOUR SAFE PLACE",
    desc: "Γνωρίστε τη Λίνα Λεύκου, MSc Ψυχολόγο & Ψυχοθεραπεύτρια στη Θεσσαλονίκη. Μεταπτυχιακές σπουδές στη Σχολική & Εξελικτική Ψυχολογία, εκπαίδευση στη Συστημική Θεραπεία Ζευγαριών και στην Αφηγηματική Ψυχοθεραπεία.",
    canonical: "i-psychologos.html",
    keywords: "Λίνα Λεύκου, ψυχολόγος Θεσσαλονίκη, ψυχοθεραπεύτρια, συστημική θεραπεία ζευγαριών, αφηγηματική ψυχοθεραπεία, σχολική εξελικτική ψυχολογία",
    image: "assets/lina-lefkou.jpg",
    ld,
    type: "profile",
  }) +
    header(depth, "about") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="about about-page">
      <div class="container about-grid">
        <div class="about-media reveal">
          <img src="${r("assets/lina-lefkou.jpg")}" alt="Λίνα Λεύκου, MSc Ψυχολόγος – Ψυχοθεραπεύτρια" width="1065" height="1600" />
        </div>
        <div class="about-copy">
          <p class="eyebrow reveal">Η Ψυχολόγος</p>
          <h1 class="section-title reveal">Λίνα Λεύκου</h1>
          <p class="about-role reveal">MSc Ψυχολόγος – Ψυχοθεραπεύτρια</p>
          <p class="reveal">Είμαι η Λίνα Λεύκου, Ψυχολόγος και Ψυχοθεραπεύτρια, με μεταπτυχιακές σπουδές στη Σχολική και Εξελικτική Ψυχολογία.</p>
          <p class="reveal">Έχω εκπαιδευτεί στη Συστημική Θεραπεία Ζευγαριών και στην Αφηγηματική Ψυχοθεραπεία, προσεγγίσεις που με βοηθούν να βλέπω κάθε άνθρωπο μέσα στο πλαίσιο των σχέσεών του και της προσωπικής του ιστορίας.</p>
          <p class="reveal">Στη θεραπευτική διαδικασία επιδιώκω να δημιουργώ έναν ασφαλή και ουσιαστικό χώρο, όπου μπορείς να κατανοήσεις όσα σε δυσκολεύουν, να αναγνωρίσεις τις δυνατότητές σου και να αναζητήσεις νέους τρόπους σύνδεσης με τον εαυτό σου και τους άλλους.</p>
          <p class="reveal">Στο <strong>YOUR SAFE PLACE</strong> υποδέχομαι ενήλικες, ζευγάρια, γονείς, παιδιά και εφήβους. Κάθε συνεργασία ξεκινά από την ίδια αρχή: τον σεβασμό στον ρυθμό σου και την εμπιστευτικότητα όσων μοιράζεσαι.</p>
        </div>
      </div>
    </section>

    <section class="creds">
      <div class="container">
        <div class="creds-grid">
          <div class="cred reveal"><span class="cred-k">MSc</span><span class="cred-v">Μεταπτυχιακές σπουδές στη Σχολική &amp; Εξελικτική Ψυχολογία</span></div>
          <div class="cred reveal"><span class="cred-k">Συστημική Προσέγγιση</span><span class="cred-v">Εκπαίδευση στη Συστημική Θεραπεία Ζευγαριών</span></div>
          <div class="cred reveal"><span class="cred-k">Αφηγηματική Ψυχοθεραπεία</span><span class="cred-v">Εκπαίδευση στην Αφηγηματική Προσέγγιση</span></div>
          <div class="cred reveal"><span class="cred-k">Εμπιστευτικότητα</span><span class="cred-v">Πλήρης τήρηση του απορρήτου &amp; του κώδικα δεοντολογίας</span></div>
        </div>
      </div>
    </section>

    <section class="approach">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Η προσέγγιση</p>
          <h2 class="section-title">Πώς δουλεύουμε μαζί</h2>
        </div>
        <ol class="steps">
          <li class="step reveal"><span class="step-n">01</span><h3>Πρώτη επικοινωνία</h3><p>Μια σύντομη τηλεφωνική επικοινωνία ή email, για να κανονίσουμε την πρώτη συνάντηση και να απαντηθούν τυχόν πρακτικές απορίες.</p></li>
          <li class="step reveal"><span class="step-n">02</span><h3>Πρώτη συνεδρία</h3><p>Γνωριζόμαστε. Μιλάμε για όσα σε φέρνουν εδώ, χωρίς πίεση και χωρίς να χρειάζεται να έχεις τα πάντα «τακτοποιημένα» πριν έρθεις.</p></li>
          <li class="step reveal"><span class="step-n">03</span><h3>Κοινός στόχος</h3><p>Σχεδιάζουμε μαζί το πλαίσιο: τι θα θέλαμε να αλλάξει, με ποιον ρυθμό και με ποια συχνότητα συνεδριών.</p></li>
          <li class="step reveal"><span class="step-n">04</span><h3>Θεραπευτική διαδικασία</h3><p>Συνήθως μία συνεδρία την εβδομάδα, διάρκειας μίας ώρας (1,5 ώρα για ζευγάρια), με συνεχή αναστοχασμό της πορείας μας.</p></li>
        </ol>
      </div>
    </section>

    <section class="philosophy">
      <div class="container philosophy-inner reveal">
        <p class="eyebrow">Η Φιλοσοφία μου</p>
        <span class="philosophy-mark" aria-hidden="true">&ldquo;</span>
        <blockquote>Ένας χώρος για να <em>σταθείς</em>. Να μιλήσεις. Να καταλάβεις. Να <em>συνδεθείς</em>.</blockquote>
        <cite class="philosophy-cite">Λίνα Λεύκου · MSc Ψυχολόγος – Ψυχοθεραπεύτρια</cite>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: SERVICES HUB
// ====================================================================
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
          <span class="svc-icon" aria-hidden="true">${svcIcon(i)}</span>
          <span class="svc-num">${String(i + 1).padStart(2, "0")}</span>
          <h2>${esc(s.nav)}</h2>
          <p>${esc(s.lead)}</p>
          <span class="svc-more">Περισσότερα</span>
        </a>`
  ).join("");
  const ld = [
    breadcrumbLD(depth, trail),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: SERVICES.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.h1,
        url: abs("ypiresies/" + s.slug + ".html"),
      })),
    },
  ];
  return head({
    depth,
    title: "Υπηρεσίες Ψυχοθεραπείας & Συμβουλευτικής | YOUR SAFE PLACE Θεσσαλονίκη",
    desc: "Ατομική ψυχοθεραπεία, θεραπεία ζευγαριών, συμβουλευτική γονέων και υποστήριξη παιδιών & εφήβων στο κέντρο της Θεσσαλονίκης, από τη Λίνα Λεύκου, MSc Ψυχολόγο.",
    canonical: "ypiresies/index.html",
    keywords: "ατομική ψυχοθεραπεία Θεσσαλονίκη, θεραπεία ζευγαριών Θεσσαλονίκη, συμβουλευτική γονέων, ψυχολόγος παιδιών εφήβων Θεσσαλονίκη",
    ld,
  }) +
    header(depth, "services") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Υπηρεσίες</p>
        <h1 class="page-title reveal">Ψυχοθεραπεία &amp; συμβουλευτική, με ανθρώπινο ρυθμό</h1>
        <p class="page-lead reveal">Είτε έρχεσαι μόνος σου, είτε ως ζευγάρι, είτε ως γονιός για το παιδί σου — η δουλειά ξεκινά πάντα από τη σχέση εμπιστοσύνης και προχωρά με τον δικό σου ρυθμό.</p>
      </div>
    </section>
    <section class="services services--hub">
      <div class="container">
        <div class="services-grid">${cards}
        </div>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: SERVICE DETAIL
// ====================================================================
function pageService(s, idx) {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Υπηρεσίες", rel: "ypiresies/index.html", path: "ypiresies/index.html" },
    { name: s.nav, rel: "ypiresies/" + s.slug + ".html", path: "ypiresies/" + s.slug + ".html" },
  ];
  const related = SERVICES.filter((x) => x.slug !== s.slug);
  const ld = [
    breadcrumbLD(depth, trail),
    {
      "@context": "https://schema.org",
      "@type": "MedicalTherapy",
      name: s.h1,
      description: s.desc,
      url: abs("ypiresies/" + s.slug + ".html"),
      provider: { "@id": `${BASE}/#practice` },
    },
    faqLD(s.faq),
  ];
  return head({
    depth,
    title: s.title,
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
    <section class="page-hero page-hero--svc">
      <div class="container">
        <span class="svc-hero-icon reveal" aria-hidden="true">${svcIcon(idx)}</span>
        <p class="eyebrow reveal">Υπηρεσία ${String(idx + 1).padStart(2, "0")}</p>
        <h1 class="page-title reveal">${esc(s.h1)}</h1>
        <p class="page-lead reveal">${esc(s.lead)}</p>
        <div class="hero-actions reveal"><a href="${r("epikoinonia.html")}#rantevou" class="btn btn-primary">Κλείστε Ραντεβού</a></div>
      </div>
    </section>

    <section class="svc-detail">
      <div class="container svc-detail-grid">
        <article class="svc-body">
          ${s.body.map((p) => `<p class="reveal">${p}</p>`).join("\n          ")}

          <h2 class="reveal">Σε ποιες περιπτώσεις βοηθά</h2>
          <ul class="ticks">
            ${s.includes.map((i) => `<li class="reveal">${esc(i)}</li>`).join("\n            ")}
          </ul>

          <h2 class="reveal">Συχνές ερωτήσεις</h2>
          <div class="faq">
            ${s.faq
              .map(
                ([q, a]) => `<details class="faq-item reveal"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`
              )
              .join("\n            ")}
          </div>
        </article>

        <aside class="svc-aside">
          <div class="aside-card reveal">
            <h3>Κλείστε ραντεβού</h3>
            <p>Οι συνεδρίες πραγματοποιούνται κατόπιν ραντεβού, Δευτέρα έως Παρασκευή. Επικοινωνήστε τηλεφωνικά ή με email.</p>
            <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary btn-block">${esc(BIZ.phoneDisplay)}</a>
            <a href="mailto:${BIZ.email}" class="btn btn-ghost btn-block">${esc(BIZ.email)}</a>
            <p class="aside-meta">${esc(BIZ.street)}<br />${esc(BIZ.city)}, ${esc(BIZ.postal)}</p>
            <p class="aside-meta">${esc(s.duration)}</p>
          </div>
          <div class="aside-card reveal">
            <h3>Άλλες υπηρεσίες</h3>
            <nav class="aside-links">
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

// ====================================================================
//  PAGE: AREA DETAIL — τοπικές σελίδες προσγείωσης (local SEO)
// ====================================================================
function pageArea(a) {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: a.name, rel: "perioches/" + a.slug + ".html", path: "perioches/" + a.slug + ".html" },
  ];
  const localFaq = [
    [`Πού βρίσκεται το γραφείο;`, `Το YOUR SAFE PLACE βρίσκεται στην ${BIZ.street}, ${BIZ.city}, Τ.Κ. ${BIZ.postal} — στο κέντρο της πόλης, με εύκολη πρόσβαση από ${a.name}.`],
    [`Πώς κλείνω ραντεβού;`, `Καλέστε στο ${BIZ.phoneDisplay} ή στείλτε email στο ${BIZ.email}. Οι συνεδρίες πραγματοποιούνται κατόπιν ραντεβού, Δευτέρα έως Παρασκευή.`],
    [`Ποιες υπηρεσίες προσφέρετε;`, `Ατομική ψυχοθεραπεία, θεραπεία ζευγαριών, συμβουλευτική γονέων και υποστήριξη παιδιών & εφήβων.`],
    [`Πόσο διαρκεί μια συνεδρία;`, `Η ατομική συνεδρία διαρκεί μία ώρα, ενώ η συνεδρία ζευγαριού μιάμιση ώρα.`],
  ];
  const ld = [
    breadcrumbLD(depth, trail),
    { "@context": "https://schema.org", ...practiceLD, areaServed: a.name },
    faqLD(localFaq),
  ];
  return head({
    depth,
    title: a.title,
    desc: a.desc,
    canonical: "perioches/" + a.slug + ".html",
    keywords: a.keywords,
    ld,
  }) +
    header(depth) +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Περιοχή εξυπηρέτησης</p>
        <h1 class="page-title reveal">${esc(a.h1)}</h1>
        <p class="page-lead reveal">${esc(a.blurb)}</p>
        <div class="hero-actions reveal">
          <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary">Καλέστε ${esc(BIZ.phoneDisplay)}</a>
          <a href="${r("epikoinonia.html")}" class="btn btn-ghost">Επικοινωνία &amp; Χάρτης</a>
        </div>
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
        <aside class="svc-aside">
          <div class="aside-card reveal">
            <h3>Στοιχεία επικοινωνίας</h3>
            <p class="aside-meta">${esc(BIZ.street)}<br />${esc(BIZ.city)}, ${esc(BIZ.postal)}</p>
            <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary btn-block">${esc(BIZ.phoneDisplay)}</a>
            <a href="mailto:${BIZ.email}" class="btn btn-ghost btn-block">${esc(BIZ.email)}</a>
            <p class="aside-meta">${esc(BIZ.hours)}</p>
          </div>
        </aside>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: BLOG HUB
// ====================================================================
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
  const ld = [
    breadcrumbLD(depth, trail),
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: BIZ.name + " — Blog",
      url: abs("blog/index.html"),
      inLanguage: "el",
    },
  ];
  return head({
    depth,
    title: "Blog — Ψυχολογία & Ψυχική Υγεία | YOUR SAFE PLACE",
    desc: "Άρθρα για την ψυχοθεραπεία, τις σχέσεις, το άγχος, τη γονεϊκότητα και την εφηβεία, από τη Λίνα Λεύκου, MSc Ψυχολόγο – Ψυχοθεραπεύτρια.",
    canonical: "blog/index.html",
    keywords: "blog ψυχολογίας, άρθρα ψυχοθεραπείας, άγχος, σχέσεις, γονεϊκότητα, εφηβεία",
    ld,
  }) +
    header(depth, "blog") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Blog</p>
        <h1 class="page-title reveal">Σκέψεις για την ψυχική υγεία</h1>
        <p class="page-lead reveal">Χρήσιμα κείμενα και απαντήσεις σε ερωτήματα που ακούγονται συχνά μέσα στο γραφείο.</p>
      </div>
    </section>
    <section class="posts">
      <div class="container">
        <div class="posts-grid">${cards}
        </div>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: BLOG POST
// ====================================================================
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
  const ld = [
    breadcrumbLD(depth, trail),
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.title,
      description: p.desc,
      datePublished: p.date,
      dateModified: p.date,
      inLanguage: "el",
      image: abs("assets/space-1.jpg"),
      mainEntityOfPage: abs("blog/" + p.slug + ".html"),
      author: { "@type": "Person", name: BIZ.doctor },
      publisher: { "@id": `${BASE}/#practice` },
    },
    faqLD(p.faq),
  ];
  // [τίτλος, κείμενο, λίστα?] — ο τρίτος όρος είναι προαιρετικά bullets
  const bodyHtml = p.body
    .map(([h, t, list]) => {
      const headHtml = h ? `<h2 class="reveal">${esc(h)}</h2>\n          ` : "";
      const para = h ? `<p class="reveal">${esc(t)}</p>` : `<p class="reveal lead-p">${esc(t)}</p>`;
      const items = list
        ? `\n          <ul class="ticks">\n            ${list.map((i) => `<li class="reveal">${esc(i)}</li>`).join("\n            ")}\n          </ul>`
        : "";
      return headHtml + para + items;
    })
    .join("\n          ");
  return head({
    depth,
    title: p.metaTitle,
    desc: p.desc,
    canonical: "blog/" + p.slug + ".html",
    keywords: p.keywords,
    ld,
    type: "article",
  }) +
    header(depth, "blog") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <article class="article">
      <header class="article-head">
        <div class="container article-head-inner">
          <span class="post-cat reveal">${esc(p.cat)}</span>
          <h1 class="page-title reveal">${esc(p.title)}</h1>
          <p class="article-meta reveal"><time datetime="${p.date}">${fmtDate(p.date)}</time> · ${esc(BIZ.doctor)}</p>
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
            <p>Σχετική υπηρεσία: <a href="${r("ypiresies/" + relatedSvc.slug + ".html")}"><strong>${esc(relatedSvc.h1)}</strong></a>. Για ραντεβού καλέστε στο <a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a>.</p>
          </div>` : ""}

          <p class="article-disclaimer">Το παρόν άρθρο έχει ενημερωτικό χαρακτήρα και δεν υποκαθιστά την εξατομικευμένη ψυχολογική εκτίμηση ή θεραπεία. Αν κάτι σας δυσκολεύει, αναζητήστε υποστήριξη από εξειδικευμένο επαγγελματία ψυχικής υγείας.</p>
        </div>
        <aside class="article-aside">
          <div class="aside-card reveal">
            <h3>Διαβάστε επίσης</h3>
            <nav class="aside-links">
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

// ====================================================================
//  PAGE: CONTACT
// ====================================================================
function pageContact() {
  const depth = 0;
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Επικοινωνία", rel: "epikoinonia.html", path: "epikoinonia.html" },
  ];
  const contactFaq = [
    ["Πώς κλείνω το πρώτο μου ραντεβού;", `Τηλεφωνικά στο ${BIZ.phoneDisplay} ή με email στο ${BIZ.email}. Θα κανονίσουμε μαζί ημέρα και ώρα που σας εξυπηρετεί.`],
    ["Πόσο διαρκεί η συνεδρία;", "Η ατομική συνεδρία διαρκεί μία ώρα. Η συνεδρία ζευγαριού διαρκεί μιάμιση ώρα."],
    ["Υπάρχει online κράτηση;", "Όχι. Τα ραντεβού κλείνονται αποκλειστικά μέσω τηλεφώνου ή email, ώστε να υπάρχει μια πρώτη προσωπική επικοινωνία."],
    ["Τι ισχύει για την εμπιστευτικότητα;", "Όσα συζητούνται στις συνεδρίες καλύπτονται πλήρως από το επαγγελματικό απόρρητο και τον κώδικα δεοντολογίας των ψυχολόγων."],
  ];
  const ld = [breadcrumbLD(depth, trail), { "@context": "https://schema.org", ...practiceLD }, faqLD(contactFaq)];
  return head({
    depth,
    title: "Επικοινωνία & Ραντεβού | YOUR SAFE PLACE — Ψυχολόγος Θεσσαλονίκη",
    desc: `Επικοινωνήστε με τη Λίνα Λεύκου, MSc Ψυχολόγο – Ψυχοθεραπεύτρια. ${BIZ.street}, ${BIZ.city} ${BIZ.postal}. Τηλ. ${BIZ.phoneDisplay}, ${BIZ.email}. Συνεδρίες κατόπιν ραντεβού.`,
    canonical: "epikoinonia.html",
    keywords: "επικοινωνία ψυχολόγος Θεσσαλονίκη, ραντεβού ψυχολόγος, Εγνατίας 54 Θεσσαλονίκη, τηλέφωνο ψυχολόγου",
    ld,
  }) +
    header(depth, "contact") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="contact" id="contact">
      <div class="container contact-grid">
        <div class="contact-copy">
          <p class="eyebrow reveal">Επικοινωνία</p>
          <h1 class="section-title reveal">Ας κάνουμε το πρώτο βήμα</h1>
          <p class="contact-note reveal">Οι συνεδρίες πραγματοποιούνται <strong>κατόπιν ραντεβού</strong>, Δευτέρα έως Παρασκευή. Επικοινωνήστε μαζί μου τηλεφωνικά ή με email — αν δεν απαντήσω άμεσα, θα επικοινωνήσω μαζί σας το συντομότερο δυνατό.</p>
          <ul class="contact-list">
            <li class="reveal"><span class="contact-label">Ωράριο</span><span class="contact-value">Δευτέρα – Παρασκευή<br /><em>κατόπιν ραντεβού</em></span></li>
            <li class="reveal"><span class="contact-label">Διεύθυνση</span><span class="contact-value">${esc(BIZ.street)}<br />${esc(BIZ.city)}, Τ.Κ. ${esc(BIZ.postal)}</span></li>
            <li class="reveal"><span class="contact-label">Τηλέφωνο</span><span class="contact-value"><a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a></span></li>
            <li class="reveal"><span class="contact-label">Email</span><span class="contact-value"><a href="mailto:${BIZ.email}">${esc(BIZ.email)}</a></span></li>
            <li class="reveal"><span class="contact-label">Social</span><span class="contact-value"><a href="${BIZ.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a> · <a href="${BIZ.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a> · <a href="${BIZ.google}" target="_blank" rel="noopener noreferrer">Google</a></span></li>
          </ul>
          <div class="contact-actions reveal">
            <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary">Καλέστε μας</a>
            <a href="mailto:${BIZ.email}" class="btn btn-ghost">Στείλτε Email</a>
          </div>
        </div>
        <div class="contact-map reveal">
          <iframe title="Χάρτης — ${attr(BIZ.street + ", " + BIZ.city)}" src="https://www.google.com/maps?q=${encodeURIComponent(BIZ.street + ", " + BIZ.city + " " + BIZ.postal)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        </div>
      </div>
    </section>

    <section class="booking" id="rantevou">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Ραντεβού</p>
          <h2 class="section-title">Πώς κλείνουμε ραντεβού</h2>
          <p class="page-lead">Δεν υπάρχει online κράτηση. Το ραντεβού κλείνεται με μια σύντομη προσωπική επικοινωνία — τηλεφωνικά ή με email.</p>
        </div>
        <div class="booking-cards">
          <div class="booking-card reveal">
            <span class="booking-n">01</span>
            <h3>Επικοινωνία</h3>
            <p>Καλέστε στο <a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a> ή στείλτε email στο <a href="mailto:${BIZ.email}">${esc(BIZ.email)}</a>.</p>
          </div>
          <div class="booking-card reveal">
            <span class="booking-n">02</span>
            <h3>Ημέρα &amp; ώρα</h3>
            <p>Βρίσκουμε μαζί μια ώρα Δευτέρα έως Παρασκευή που σας εξυπηρετεί.</p>
          </div>
          <div class="booking-card reveal">
            <span class="booking-n">03</span>
            <h3>Διάρκεια</h3>
            <p>Ατομική συνεδρία: 1 ώρα.<br />Συνεδρία ζευγαριού: 1,5 ώρα.</p>
          </div>
          <div class="booking-card reveal">
            <span class="booking-n">04</span>
            <h3>Η πρώτη συνάντηση</h3>
            <p>Γνωριζόμαστε και συζητάμε τι σας φέρνει εδώ — χωρίς δεσμεύσεις και με απόλυτη εμπιστευτικότητα.</p>
          </div>
        </div>
        <div class="faq faq--contact">
          ${contactFaq.map(([q, a]) => `<details class="faq-item reveal"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n          ")}
        </div>
      </div>
    </section>
  </main>` +
    footer(depth);
}

// ---- utils ----------------------------------------------------------
function fmtDate(iso) {
  const months = ["Ιανουαρίου","Φεβρουαρίου","Μαρτίου","Απριλίου","Μαΐου","Ιουνίου","Ιουλίου","Αυγούστου","Σεπτεμβρίου","Οκτωβρίου","Νοεμβρίου","Δεκεμβρίου"];
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${months[m - 1]} ${y}`;
}

// ====================================================================
//  SITEMAP + ROBOTS
// ====================================================================
function buildSitemap() {
  const urls = [
    { loc: "index.html", pr: "1.0", cf: "weekly" },
    { loc: "i-psychologos.html", pr: "0.8", cf: "monthly" },
    { loc: "ypiresies/index.html", pr: "0.9", cf: "monthly" },
    ...SERVICES.map((s) => ({ loc: "ypiresies/" + s.slug + ".html", pr: "0.9", cf: "monthly" })),
    ...AREAS.map((a) => ({ loc: "perioches/" + a.slug + ".html", pr: "0.7", cf: "monthly" })),
    { loc: "blog/index.html", pr: "0.7", cf: "weekly" },
    ...POSTS.map((p) => ({ loc: "blog/" + p.slug + ".html", pr: "0.6", cf: "monthly", lm: p.date })),
    { loc: "epikoinonia.html", pr: "0.8", cf: "yearly" },
  ];
  const today = new Date().toISOString().slice(0, 10);
  const body = urls
    .map(
      (u) =>
        `  <url><loc>${abs(u.loc)}</loc><lastmod>${u.lm || today}</lastmod><changefreq>${u.cf}</changefreq><priority>${u.pr}</priority></url>`
    )
    .join("\n");
  const ns = "http://www.sitemaps.org/schemas/sitemap/0.9";
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${ns}">\n${body}\n</urlset>\n`;
}

function buildRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`;
}

// ====================================================================
//  RUN
// ====================================================================
let n = 0;
const write = (p, html) => { out(p, html); n++; };

write("index.html", pageHome());
write("i-psychologos.html", pageAbout());
write("epikoinonia.html", pageContact());
write("ypiresies/index.html", pageServicesHub());
SERVICES.forEach((s, i) => write("ypiresies/" + s.slug + ".html", pageService(s, i)));
AREAS.forEach((a) => write("perioches/" + a.slug + ".html", pageArea(a)));
write("blog/index.html", pageBlogHub());
POSTS.forEach((p) => write("blog/" + p.slug + ".html", pagePost(p)));
out("sitemap.xml", buildSitemap());
out("robots.txt", buildRobots());

console.log(`✓ Generated ${n} HTML pages + sitemap.xml + robots.txt`);
