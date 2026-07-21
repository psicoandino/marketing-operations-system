/*
 * Shared EN | ES engine for the generated Landing and Case Study pages.
 *
 * One engine, zero duplicated business logic: each page embeds only its
 * own translation dictionary as window.PORTFOLIO_I18N and marks
 * translatable nodes with data-i18n. Spanish is the deterministic
 * default; the visitor's choice persists in localStorage under one key
 * shared by both narrative pages (the Pipeline and Dashboard apps keep
 * their own independent language systems and keys).
 */
(function () {
  var LANG_KEY = "portfolio_lang";
  var DEFAULT_LANG = "es";
  var dictionary = window.PORTFOLIO_I18N;
  if (!dictionary) return;

  function readLang() {
    try {
      var stored = localStorage.getItem(LANG_KEY);
      if (stored === "en" || stored === "es") return stored;
    } catch (error) { /* localStorage unavailable (some file:// contexts) */ }
    return DEFAULT_LANG;
  }

  function apply(lang) {
    var table = dictionary[lang];
    if (!table) return;
    document.documentElement.lang = lang;
    if (table.docTitle) document.title = table.docTitle;

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i += 1) {
      var value = table[nodes[i].getAttribute("data-i18n")];
      if (typeof value === "string") nodes[i].innerHTML = value;
    }

    var buttons = document.querySelectorAll("[data-lang]");
    for (var j = 0; j < buttons.length; j += 1) {
      buttons[j].setAttribute(
        "aria-pressed",
        String(buttons[j].getAttribute("data-lang") === lang)
      );
    }
  }

  function setLang(lang) {
    if (lang !== "en" && lang !== "es") return;
    try { localStorage.setItem(LANG_KEY, lang); } catch (error) { /* unavailable */ }
    apply(lang);
  }

  var buttons = document.querySelectorAll("[data-lang]");
  for (var i = 0; i < buttons.length; i += 1) {
    (function (button) {
      button.addEventListener("click", function () {
        setLang(button.getAttribute("data-lang"));
      });
    })(buttons[i]);
  }

  apply(readLang());
})();
