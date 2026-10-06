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
        <li><a href="${r("i-psychologos.html")}"${on("about")}>Λίγα λόγια για μένα</a></li>
        <li class="has-sub">
          <button type="button" class="sub-toggle${active === "services" ? " is-active" : ""}" aria-expanded="false" aria-controls="sub-ypiresies">Υπηρεσίες</button>
          <ul class="sub" id="sub-ypiresies">
            ${svcLinks}
          </ul>
        </li>
        <li><a href="${r("o-choros.html")}"${on("space")}>Ο Χώρος</a></li>
        <li><a href="${r("epikoinonia.html")}"${on("contact")}>Επικοινωνία</a></li>
        <li class="nav-cta"><a href="${r("epikoinonia.html")}" class="btn btn-primary btn-nav">Κλείσε ραντεβού</a></li>
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
          <a href="${r("i-psychologos.html")}">Λίγα λόγια για μένα</a>
          <a href="${r("o-choros.html")}">Ο Χώρος</a>
          <a href="${r("blog/index.html")}">Άρθρα</a>
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
      <p class="cb-credit">Made by <a href="https://astramarketing.gr/?utm_source=client-site&amp;utm_medium=footer&amp;utm_campaign=made-by" target="_blank" rel="noopener noreferrer">Astra</a></p>
    </div>

  </footer>
  <script src="${r("main.js")}" defer></script>
</body>
</html>`;
}

// ---- gallery (κοινό block) — κάθε φωτογραφία ανοίγει σε lightbox --------
const SPACE_LEAD =
  "Σε καλωσορίζω στο δικό σου safe place! Έναν χώρο που δημιουργήθηκε με φροντίδα, ώστε να νιώθεις άνετα από την πρώτη στιγμή. Με εύκολη πρόσβαση, στο κέντρο της Θεσσαλονίκης, λίγα μέτρα από τον σταθμό Μετρό Βενιζέλου (Εγνατίας 54).";

function galleryGrid(depth, items) {
  const r = (p) => rel(depth, p);
  return items
    .map(
      (g) => `
          <a class="gal-item reveal" href="${r("assets/" + g.file)}" data-lightbox aria-label="Μεγέθυνση φωτογραφίας: ${attr(g.alt)}">
            <img src="${r("assets/" + g.file)}" alt="${attr(g.alt)}" width="1600" height="1068" loading="lazy" />
          </a>`
    )
    .join("");
}

// ---- «Πώς ξεκινάμε» — λωρίδα με τρία βήματα ---------------------------
function startSteps(depth) {
  const r = (p) => rel(depth, p);
  const steps = [
    ["Επικοινωνία", "Κάλεσέ με ή στείλε μου μήνυμα, για να κανονίσουμε το πρώτο ραντεβού."],
    ["Πρώτη συνάντηση", "Θα γνωριστούμε, θα δούμε τι σε απασχολεί και πώς μπορούμε να συνεργαστούμε."],
    ["Προχωράμε μαζί", "Αν νιώσεις ότι αυτός ο χώρος σου ταιριάζει, συνεχίζουμε με σεβασμό στον ρυθμό και τις ανάγκες σου."],
  ];
  return `
    <section class="booking" id="pos-xekiname">
      <div class="container">
        <h2 class="section-title reveal">Πώς ξεκινάμε</h2>
        <ol class="steps">
          ${steps
            .map(
              ([h, p], i) =>
                `<li class="step reveal"><span class="step-n">${String(i + 1).padStart(2, "0")}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`
            )
            .join("\n          ")}
        </ol>
        <a href="${r("epikoinonia.html")}" class="btn btn-primary reveal">Κλείσε ραντεβού</a>
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
          <h3>${esc(s.nav)}</h3>
          <p>${esc(s.lead)}</p>
          <span class="svc-more">Περισσότερα</span>
        </a>`
  ).join("");

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
  ];

  return head({
    depth,
    title: "Ψυχολόγος Θεσσαλονίκη | YOUR SAFE PLACE — Λίνα Λεύκου, MSc",
    desc: "YOUR SAFE PLACE — Λίνα Λεύκου, MSc Ψυχολόγος & Ψυχοθεραπεύτρια στο κέντρο της Θεσσαλονίκης και online. Ατομική ψυχοθεραπεία, θεραπεία ζευγαριών, συμβουλευτική γονέων, υποστήριξη παιδιών & εφήβων.",
    canonical: "index.html",
    keywords: "ψυχολόγος Θεσσαλονίκη, ψυχοθεραπεύτρια Θεσσαλονίκη, ατομική ψυχοθεραπεία, θεραπεία ζευγαριών, συμβουλευτική γονέων, ψυχολόγος παιδιών εφήβων, Λίνα Λεύκου",
    ld,
  }) +
    header(depth, "home") +
    `
  <main id="main" class="home">
    <section class="hero" id="hero">
      <div class="hero-copy">
        <h1 class="hero-title reveal">Ένας χώρος για να <em>σταθείς</em>, να μιλήσεις, να καταλάβεις, να <em>συνδεθείς</em>.</h1>
        <p class="hero-tagline reveal">Ψυχοθεραπεία και συμβουλευτική για εσένα και τις σχέσεις που έχουν σημασία.</p>
        <div class="hero-actions reveal">
          <a href="${r("epikoinonia.html")}" class="btn btn-primary">Κλείσε ραντεβού</a>
        </div>
        <p class="hero-meta reveal">${ICONS.pin}<span>Θεσσαλονίκη · Online</span></p>
      </div>
      <div class="hero-media">
        <img src="${r("assets/space-2.jpg")}" alt="Ο χώρος ψυχοθεραπείας YOUR SAFE PLACE στη Θεσσαλονίκη — πολυθρόνα, φυτά και ζεστοί γήινοι τόνοι" width="1065" height="1600" fetchpriority="high" />
      </div>
    </section>

    <section class="statement">
      <div class="container statement-inner reveal">
        <span class="statement-rule" aria-hidden="true"></span>
        <h2>Κάθε άνθρωπος κουβαλά μια <em>ιστορία</em>.</h2>
        <p>Μια ιστορία που διαμορφώνεται μέσα από τις σχέσεις και τις εμπειρίες του. Η ψυχοθεραπεία δεν έχει στόχο να τη «διορθώσει» — είναι μια ευκαιρία να τη δούμε μαζί με καινούργια μάτια.</p>
        <p>Αν κάτι σε δυσκολεύει, μια σχέση σε απασχολεί ή βρίσκεσαι σε μια περίοδο αλλαγής, μπορούμε να αναζητήσουμε νέους τρόπους να φροντίζεις τον εαυτό σου και τις σχέσεις που έχουν σημασία για σένα.</p>
      </div>
    </section>

    <section class="split" id="prosengisi">
      <div class="split-media reveal">
        <img src="${r("assets/space-1.jpg")}" alt="Ο χώρος συνεδριών του YOUR SAFE PLACE — καναπές, πολυθρόνα και φυσικό φως" width="1600" height="1068" loading="lazy" />
      </div>
      <div class="split-copy">
        <h2 class="section-title reveal">Η <em>προσέγγισή</em> μου</h2>
        <p class="reveal">Η θεραπεία είναι, για μένα, μια συνεργατική διαδικασία.</p>
        <p class="reveal">Εσύ φέρνεις την ιστορία σου, τις εμπειρίες και όσα σε απασχολούν, κι εγώ είμαι εκεί ως συνοδοιπόρος, για να τα εξερευνήσουμε μαζί.</p>
        <p class="reveal">Με βάση τη συστημική και αφηγηματική προσέγγιση, βλέπουμε τον άνθρωπο μέσα στις σχέσεις και τις συνθήκες της ζωής του. Αναζητούμε νέες οπτικές, ακούμε όσα ίσως έχουν μείνει στο περιθώριο και δίνουμε χώρο σε δυνατότητες που μπορούν να ανοίξουν έναν διαφορετικό δρόμο.</p>
        <p class="reveal">Γιατί αυτό που μας δυσκολεύει δεν αφορά πάντα μόνο εμάς· συχνά αφορά και τον τρόπο που σχετιζόμαστε με τους σημαντικούς ανθρώπους στη ζωή μας.</p>
        <p class="split-label reveal">Μπορούμε να δουλέψουμε μαζί αν</p>
        <ul class="split-list reveal">
          <li>Θέλεις να κατανοήσεις καλύτερα τον εαυτό σου</li>
          <li>Αναζητάτε ως ζευγάρι νέους τρόπους επικοινωνίας και σύνδεσης</li>
          <li>Σε απασχολούν θέματα γονεϊκότητας</li>
          <li>Το παιδί σου χρειάζεται υποστήριξη σε μια δύσκολη περίοδο</li>
        </ul>
      </div>
    </section>

    <section class="about about--flip" id="about">
      <div class="about-media reveal">
        <img src="${r("assets/lina-lefkou.jpg")}" alt="Λίνα Λεύκου, MSc Ψυχολόγος – Ψυχοθεραπεύτρια, YOUR SAFE PLACE Θεσσαλονίκη" width="1065" height="1600" loading="lazy" />
      </div>
      <div class="about-copy">
        <h2 class="section-title reveal">Λίνα Λεύκου</h2>
        <p class="about-role reveal">MSc Ψυχολόγος – Ψυχοθεραπεύτρια</p>
        <p class="reveal">Είμαι η Λίνα Λεύκου, Ψυχολόγος και Ψυχοθεραπεύτρια, με μεταπτυχιακές σπουδές στη Σχολική και Εξελικτική Ψυχολογία.</p>
        <p class="reveal">Στη θεραπευτική διαδικασία επιδιώκω να δημιουργώ μια σχέση εμπιστοσύνης και συνεργασίας, όπου μπορείς να κατανοήσεις όσα σε δυσκολεύουν, να αναγνωρίσεις τις δυνατότητές σου και να αναζητήσεις νέους τρόπους σύνδεσης με τον εαυτό σου και τους άλλους.</p>
        <p class="split-label reveal">Εκπαίδευση &amp; σπουδές</p>
        <ul class="split-list reveal">
          <li>Πτυχίο και άδεια ασκήσεως επαγγέλματος Ψυχολόγου</li>
          <li>MSc στη Σχολική &amp; Εξελικτική Ψυχολογία</li>
          <li>Εκπαίδευση στη Συστημική Θεραπεία Ζευγαριών</li>
          <li>Εκπαίδευση στην Αφηγηματική Ψυχοθεραπεία</li>
        </ul>
        <a href="${r("i-psychologos.html")}" class="btn btn-ghost reveal">Περισσότερα</a>
      </div>
    </section>

    <section class="services" id="services">
      <div class="container">
        <div class="section-head reveal">
          <h2 class="section-title">Υπηρεσίες</h2>
        </div>
        <div class="services-grid">${svcCards}
        </div>
      </div>
    </section>

    <section class="gallery" id="o-choros">
      <div class="container">
        <div class="section-head reveal">
          <h2 class="section-title">Ο χώρος</h2>
          <p class="page-lead">${esc(SPACE_LEAD)}</p>
        </div>
        <div class="gal-grid">${galleryGrid(depth, GALLERY.slice(0, 6))}
        </div>
        <a href="${r("o-choros.html")}" class="btn btn-ghost gallery-more reveal">Περισσότερα</a>
      </div>
    </section>
` +
    startSteps(depth) +
    `
  </main>` +
    footer(depth);
}

// ====================================================================
//  PAGE: Ο ΧΩΡΟΣ
// ====================================================================
function pageSpace() {
  const depth = 0;
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Ο Χώρος", rel: "o-choros.html", path: "o-choros.html" },
  ];
  return head({
    depth,
    title: "Ο Χώρος — Γραφείο Ψυχοθεραπείας στο Κέντρο Θεσσαλονίκης | YOUR SAFE PLACE",
    desc: "Το YOUR SAFE PLACE στην Εγνατίας 54, λίγα μέτρα από τον σταθμό Μετρό Βενιζέλου. Ένας φωτεινός, ήσυχος χώρος ψυχοθεραπείας στο κέντρο της Θεσσαλονίκης.",
    canonical: "o-choros.html",
    keywords: "γραφείο ψυχολόγου Θεσσαλονίκη, χώρος ψυχοθεραπείας, Εγνατίας 54, Μετρό Βενιζέλου",
    ld: [breadcrumbLD(depth, trail)],
  }) +
    header(depth, "space") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <h1 class="page-title reveal">Ο χώρος</h1>
        <p class="page-lead reveal">${esc(SPACE_LEAD)}</p>
      </div>
    </section>
    <section class="gallery gallery--page">
      <div class="container">
        <div class="gal-grid">${galleryGrid(depth, GALLERY)}
        </div>
      </div>
    </section>
  </main>` +
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
    { name: "Λίγα λόγια για μένα", rel: "i-psychologos.html", path: "i-psychologos.html" },
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
          <p class="eyebrow reveal">Λίγα λόγια για μένα</p>
          <h1 class="section-title reveal">Λίνα Λεύκου</h1>
          <p class="about-role reveal">MSc Ψυχολόγος – Ψυχοθεραπεύτρια</p>
          <p class="reveal">Είμαι η Λίνα Λεύκου, Ψυχολόγος και Ψυχοθεραπεύτρια.</p>
          <p class="reveal">Το ταξίδι μου ξεκίνησε στο Τμήμα Ψυχολογίας του Αριστοτελείου Πανεπιστημίου Θεσσαλονίκης. Το ενδιαφέρον μου για την ανάπτυξη και την ψυχική υγεία των παιδιών με οδήγησε στις μεταπτυχιακές μου σπουδές στη Σχολική και Εξελικτική Ψυχολογία (ΑΠΘ).</p>
          <p class="reveal">Μέσα από την επαφή μου με παιδιά και γονείς, άρχισα να εστιάζω περισσότερο στη σχέση του ζευγαριού και στη βαθιά σύνδεσή της με τη συνολική ευημερία της οικογένειας. Έτσι, επέλεξα να εμβαθύνω στη Συστημική Θεραπεία Ζευγαριών, στο Ινστιτούτο Συστημικής Θεραπείας Θεσσαλονίκης. Στη συνέχεια, ολοκλήρωσα την εκπαίδευσή μου στην Αφηγηματική Ψυχοθεραπεία, στο Ινστιτούτο Αφηγηματικής Ψυχοθεραπείας &amp; Κοινοτικής Πρακτικής.</p>
          <p class="reveal">Η εκπαίδευσή μου στη Συστημική και την Αφηγηματική προσέγγιση διαμόρφωσε τον τρόπο με τον οποίο επιλέγω να βλέπω τον κάθε άνθρωπο: μέσα στην προσωπική του ιστορία, τις σχέσεις του και το πλαίσιο στο οποίο ζει.</p>
          <p class="reveal">Στο <strong>YOUR SAFE PLACE</strong> συναντώ ενήλικες, ζευγάρια, γονείς, παιδιά και εφήβους. Στόχος μου είναι να δημιουργώ έναν χώρο ασφάλειας, εμπιστοσύνης και σεβασμού, όπου μπορούμε να μιλήσουμε ανοιχτά, να συναντηθούμε με ενσυναίσθηση, χωρίς κριτική, και να εξερευνήσουμε όσα σε απασχολούν, με τον δικό σου ρυθμό.</p>
          <p class="reveal">Αν σκέφτεσαι να ξεκινήσεις, μπορούμε να γνωριστούμε!</p>
          <a href="${r("epikoinonia.html")}" class="btn btn-primary reveal">Κλείσε ραντεβού</a>
        </div>
      </div>
    </section>

    <section class="creds">
      <div class="container">
        <div class="creds-grid">
          <div class="cred reveal"><span class="cred-k">Σπουδές</span><span class="cred-v">Πτυχίο Ψυχολογίας – Άδεια ασκήσεως επαγγέλματος</span></div>
          <div class="cred reveal"><span class="cred-k">MSc</span><span class="cred-v">Μεταπτυχιακές σπουδές στη Σχολική &amp; Εξελικτική Ψυχολογία</span></div>
          <div class="cred reveal"><span class="cred-k">Συστημική Προσέγγιση</span><span class="cred-v">Εκπαίδευση στη Συστημική Θεραπεία Ζευγαριών</span></div>
          <div class="cred reveal"><span class="cred-k">Αφηγηματική Ψυχοθεραπεία</span><span class="cred-v">Εκπαίδευση στην Αφηγηματική Προσέγγιση</span></div>
        </div>
      </div>
    </section>
  </main>` +
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
        <h1 class="page-title reveal">${esc(s.h1)}</h1>
        <p class="page-lead reveal">${esc(s.lead)}</p>
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

          <div class="svc-closing reveal">
            ${s.closing.map((p) => `<p>${esc(p)}</p>`).join("\n            ")}
          </div>
        </article>

        <aside class="svc-aside">
          <div class="aside-card reveal">
            <h3>Κλείσε ραντεβού</h3>
            <p>Οι συνεδρίες πραγματοποιούνται κατόπιν ραντεβού, Δευτέρα έως Παρασκευή, στο χώρο μου (${esc(BIZ.street)}, ${esc(BIZ.city)}) ή online.</p>
            <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary btn-block btn-phone">${esc(BIZ.phoneDisplay)}</a>
            <a href="mailto:${BIZ.email}" class="btn btn-ghost btn-block btn-email">${esc(BIZ.email)}</a>
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
  const ld = [
    breadcrumbLD(depth, trail),
    { "@context": "https://schema.org", ...practiceLD, areaServed: a.name },
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
          <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary">Κάλεσε στο ${esc(BIZ.phoneDisplay)}</a>
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
    { name: "Άρθρα", rel: "blog/index.html", path: "blog/index.html" },
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
      name: BIZ.name + " — Άρθρα",
      url: abs("blog/index.html"),
      inLanguage: "el",
    },
  ];
  return head({
    depth,
    title: "Άρθρα — Σκέψεις για την Ψυχική Υγεία | YOUR SAFE PLACE",
    desc: "Άρθρα για την ψυχοθεραπεία, τις σχέσεις, το άγχος, τη γονεϊκότητα και την εφηβεία, από τη Λίνα Λεύκου, MSc Ψυχολόγο – Ψυχοθεραπεύτρια.",
    canonical: "blog/index.html",
    keywords: "άρθρα ψυχολογίας, άρθρα ψυχοθεραπείας, άγχος, σχέσεις, γονεϊκότητα, εφηβεία",
    ld,
  }) +
    header(depth, "blog") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Άρθρα</p>
        <h1 class="page-title reveal">Σκέψεις για την ψυχική υγεία</h1>
        <p class="page-lead reveal">Χρήσιμα κείμενα και απαντήσεις σε ερωτήματα που συναντώ συχνά στο γραφείο.</p>
      </div>
    </section>
    <section class="posts">
      <div class="container">
        <div class="posts-grid">${cards}
        </div>
      </div>
    </section>
  </main>` +
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
    { name: "Άρθρα", rel: "blog/index.html", path: "blog/index.html" },
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

          ${relatedSvc ? `<div class="article-cta reveal">
            <h2>Θέλεις να το εξερευνήσουμε περισσότερο;</h2>
            <p>${esc(relatedSvc.inPhrase)} <a href="${r("ypiresies/" + relatedSvc.slug + ".html")}">${esc(relatedSvc.h1)}</a> μπορούμε να δουλέψουμε μαζί πάνω σε όσα σε απασχολούν, με ασφάλεια, σεβασμό και στον δικό σου ρυθμό.</p>
          </div>` : ""}

          <p class="article-disclaimer">Το παρόν άρθρο έχει ενημερωτικό χαρακτήρα και δεν υποκαθιστά την εξατομικευμένη ψυχολογική εκτίμηση ή θεραπεία. Αν κάτι σας δυσκολεύει, αναζητήστε υποστήριξη από εξειδικευμένο επαγγελματία ψυχικής υγείας.</p>
        </div>
        <aside class="article-aside">
          <div class="aside-card reveal">
            <h3>Διάβασε επίσης</h3>
            <nav class="aside-links">
              ${others.map((o) => `<a href="${r("blog/" + o.slug + ".html")}">${esc(o.title)} →</a>`).join("\n              ")}
            </nav>
          </div>
        </aside>
      </div>
    </article>
  </main>` +
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
  const ld = [breadcrumbLD(depth, trail), { "@context": "https://schema.org", ...practiceLD }];
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
          <p class="contact-note reveal">Αν σκέφτεσαι να ξεκινήσεις, μπορείς να επικοινωνήσεις μαζί μου τηλεφωνικά ή με email, για να κανονίσουμε ένα πρώτο ραντεβού. Οι συνεδρίες πραγματοποιούνται Δευτέρα έως Παρασκευή. Αν δεν μπορέσω να απαντήσω άμεσα, θα επικοινωνήσω μαζί σου το συντομότερο δυνατό.</p>
          <ul class="contact-list">
            <li class="reveal"><span class="contact-label">Ωράριο</span><span class="contact-value">Δευτέρα – Παρασκευή<br />κατόπιν ραντεβού</span></li>
            <li class="reveal"><span class="contact-label">Διεύθυνση</span><span class="contact-value">${esc(BIZ.street)}<br />${esc(BIZ.city)}, Τ.Κ. ${esc(BIZ.postal)}</span></li>
            <li class="reveal"><span class="contact-label">Τηλέφωνο</span><span class="contact-value"><a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a></span></li>
            <li class="reveal"><span class="contact-label">Email</span><span class="contact-value"><a href="mailto:${BIZ.email}">${esc(BIZ.email)}</a></span></li>
            <li class="reveal"><span class="contact-label">Social</span><span class="contact-value"><a href="${BIZ.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a> · <a href="${BIZ.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a> · <a href="${BIZ.google}" target="_blank" rel="noopener noreferrer">Google</a></span></li>
          </ul>
          <div class="contact-actions reveal">
            <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary">Κάλεσέ με</a>
            <a href="mailto:${BIZ.email}" class="btn btn-ghost contact-email-btn">Στείλε email</a>
          </div>
        </div>
        <div class="contact-map reveal">
          <iframe title="Χάρτης — ${attr(BIZ.street + ", " + BIZ.city)}" src="https://www.google.com/maps?q=${encodeURIComponent(BIZ.street + ", " + BIZ.city + " " + BIZ.postal)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
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
    { loc: "o-choros.html", pr: "0.7", cf: "monthly" },
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
write("o-choros.html", pageSpace());
SERVICES.forEach((s, i) => write("ypiresies/" + s.slug + ".html", pageService(s, i)));
AREAS.forEach((a) => write("perioches/" + a.slug + ".html", pageArea(a)));
write("blog/index.html", pageBlogHub());
POSTS.forEach((p) => write("blog/" + p.slug + ".html", pagePost(p)));
out("sitemap.xml", buildSitemap());
out("robots.txt", buildRobots());

console.log(`✓ Generated ${n} HTML pages + sitemap.xml + robots.txt`);
