/*
 * Public portfolio shell navigation.
 *
 * Wires the canonical <psico-header> custom element (bundled from the
 * canonical Psicoandino shell sources, unmodified) to the five public
 * surfaces: Landing, Case Study, Pipeline, Dashboard and CV.
 *
 * Each page declares its own position through data attributes on the
 * <psico-header> element:
 *   data-shell-current      route id of the page (home | case-study | ...)
 *   data-shell-root         relative prefix back to the public root
 *   data-shell-lang-key     localStorage key holding the surface language
 *   data-shell-lang-default deterministic default when nothing is stored
 *
 * The header never owns a language control: it only mirrors the language
 * already chosen through each surface's existing EN | ES buttons.
 */
(function () {
  var headerElement = document.querySelector("psico-header[data-shell-current]");
  if (!headerElement || !window.customElements) return;

  var current = headerElement.dataset.shellCurrent;
  var root = headerElement.dataset.shellRoot || "";
  var langKey = headerElement.dataset.shellLangKey || "portfolio_lang";
  var defaultLang = headerElement.dataset.shellLangDefault || "es";

  var NAV_IDS = ["home", "case-study", "pipeline", "dashboard", "cv"];
  var NAV_HREFS = {
    home: root + "index.html",
    "case-study": root + "case-study/index.html",
    pipeline: root + "pipeline/index.html",
    dashboard: root + "dashboard/index.html",
    cv: root + "cv/index.html",
  };
  var NAV_LABELS = {
    en: {
      home: ["Home", "HOME"],
      "case-study": ["Case Study", "CASE"],
      pipeline: ["Pipeline", "PIPE"],
      dashboard: ["Dashboard", "DASH"],
      cv: ["CV", "CV"],
    },
    es: {
      home: ["Inicio", "INI"],
      "case-study": ["Caso", "CASO"],
      pipeline: ["Pipeline", "PIPE"],
      dashboard: ["Dashboard", "DASH"],
      cv: ["CV", "CV"],
    },
  };

  function readLang() {
    try {
      var stored = localStorage.getItem(langKey);
      if (stored === "en" || stored === "es") return stored;
    } catch (error) { /* localStorage unavailable (some file:// contexts) */ }
    return defaultLang;
  }

  function applyLang(lang) {
    var labels = NAV_LABELS[lang] || NAV_LABELS[defaultLang];
    var links = headerElement.querySelectorAll("[data-route-link]");
    for (var i = 0; i < links.length; i += 1) {
      var pair = labels[links[i].dataset.routeLink];
      if (!pair) continue;
      links[i].setAttribute("aria-label", pair[0]);
      links[i].querySelector(".psico-header__nav-long").textContent = pair[0];
      links[i].querySelector(".psico-header__nav-short").textContent = pair[1];
    }
  }

  customElements.whenDefined("psico-header").then(function () {
    var labels = NAV_LABELS[readLang()] || NAV_LABELS[defaultLang];
    headerElement.setNavigation(NAV_IDS.map(function (id) {
      return {
        id: id,
        label: labels[id][0],
        shortLabel: labels[id][1],
        href: NAV_HREFS[id],
      };
    }));
    headerElement.updateRoute({ current: current });

    // Mirror the surface's own EN | ES buttons (Landing/Case Study engine,
    // or each app's independent switch) without adding a second control.
    document.addEventListener("click", function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest("[data-lang]") : null;
      if (!button) return;
      var chosen = button.dataset.lang;
      if (chosen === "en" || chosen === "es") applyLang(chosen);
    });
  });
})();
