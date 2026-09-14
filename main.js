// YOUR SAFE PLACE — shared UI behaviour
(function () {
  // Τρέχον έτος στο footer
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Οθόνη εισόδου — φεύγει μόλις φορτώσει η σελίδα (με ελάχιστο χρόνο)
  var intro = document.getElementById("intro");
  if (intro && document.documentElement.classList.contains("intro")) {
    document.body.classList.add("intro-lock");
    var closed = false;
    var closeIntro = function () {
      if (closed) return;
      closed = true;
      intro.classList.add("is-done");
      document.body.classList.remove("intro-lock");
      window.setTimeout(function () {
        if (intro.parentNode) intro.parentNode.removeChild(intro);
        document.documentElement.classList.remove("intro");
      }, 800);
    };
    var started = Date.now();
    var finish = function () {
      window.setTimeout(closeIntro, Math.max(0, 1500 - (Date.now() - started)));
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish);
    // δίχτυ ασφαλείας: ποτέ να μη μείνει κολλημένη
    window.setTimeout(closeIntro, 4500);
  }

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    var setNav = function (open) {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Κλείσιμο μενού" : "Άνοιγμα μενού");
      if (open) links.scrollTop = 0;
    };
    var isOpen = function () { return document.body.classList.contains("nav-open"); };

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setNav(!isOpen());
    });

    // Κλείσιμο μόλις επιλεγεί σύνδεσμος
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });

    // Κλείσιμο με κλικ/άγγιγμα εκτός του πάνελ
    document.addEventListener("click", function (e) {
      if (isOpen() && !e.target.closest(".nav-links")) setNav(false);
    });

    // Κλείσιμο με Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        setNav(false);
        toggle.focus();
      }
    });

    // Αν η οθόνη μεγαλώσει σε desktop, μην αφήσεις κλειδωμένο το body
    var mq = window.matchMedia("(min-width: 901px)");
    var onWide = function (e) { if (e.matches && isOpen()) setNav(false); };
    if (mq.addEventListener) mq.addEventListener("change", onWide);
    else if (mq.addListener) mq.addListener(onWide);
  }

  // Sticky header shadow
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Reveal on scroll
  var revealEls = document.querySelectorAll(".reveal");
  // Dev aid / safety: reveal everything at once
  if (location.hash === "#showall") {
    document.body.classList.add("showall");
    revealEls.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  if ("IntersectionObserver" in window) {
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
    revealEls.forEach(function (el, i) {
      el.style.setProperty("--d", (i % 6) * 55 + "ms");
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }
})();
