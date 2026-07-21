import { motifConfig } from "../identity/motif-config.js";
import { motifEngine } from "../motif/motif-engine.js";
import { createHeaderRenderer } from "../motif/renderers/header-renderer.js";

let headerCount = 0;

class PsicoHeader extends HTMLElement {
  connectedCallback() {
    this.dataset.headerInstance ||= globalThis.crypto?.randomUUID?.() ??
      `header-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    if (this.dataset.ready !== "true") this.build();
    if (!this.unsubscribe) {
      this.unsubscribe = motifEngine.subscribe((state) => this.renderer.render(state));
    }
  }

  disconnectedCallback() {
    if (!this.unsubscribe) return;
    this.unsubscribe();
    this.unsubscribe = null;
  }

  build() {
    const section = this.getAttribute("section") || "";
    const rendererId = ++headerCount;
    const wipeId = `header-motif-wipe-${rendererId}`;
    const oledId = `header-motif-oled-${rendererId}`;

    this.style.setProperty(
      "--psico-header-oled-translate-y",
      `${motifConfig.oled.headerTranslateY}px`,
    );
    this.style.setProperty(
      "--psico-header-figure-gap",
      `${motifConfig.figures.gap}px`,
    );
    this.style.setProperty(
      "--psico-header-figure-size",
      `${motifConfig.figures.viewportSize}px`,
    );

    this.innerHTML = `
      <header class="psico-header">
        <span class="psico-header__arrival" aria-hidden="true">
          <span class="psico-header__arrival-rail"></span>
          <span class="psico-header__arrival-register"></span>
        </span>
        <a class="psico-header__brand psico-header__identity" href="./" aria-label="Psicoandino — Home">
          <svg class="psico-header__oled psico-header__motif" viewBox="-18 -18 36 36" aria-hidden="true">
            <defs>
              <clipPath id="${wipeId}">
                <rect data-motif-wipe x="16" y="-16" width="0" height="32"></rect>
              </clipPath>
            </defs>
            <path id="${oledId}" data-motif-oled></path>
            <use class="psico-header__eclipse" href="#${oledId}" clip-path="url(#${wipeId})"></use>
          </svg>
          <span class="psico-header__lockup">
            <span class="psico-header__word">PSICOANDINO</span>
            <span class="psico-header__figures psico-header__motif" aria-hidden="true">
              ${[0, 1, 2, 3]
                .map(
                  (index) =>
                    `<svg data-motif-figure="${index}" viewBox="0 0 12 12"></svg>`,
                )
                .join("")}
            </span>
          </span>
        </a>
        <div class="psico-header__context" ${section ? "" : "hidden"}>
          <span class="psico-header__divider"></span>
          <span class="psico-header__section">${section}</span>
        </div>
        <nav class="psico-header__nav" aria-label="Primary navigation"></nav>
      </header>`;

    this.renderer = createHeaderRenderer(this);
    this.dataset.ready = "true";
  }

  setNavigation(items) {
    if (this.dataset.ready !== "true") this.build();
    if (this.dataset.navigationReady === "true") return;
    if (!Array.isArray(items) || !items.length) {
      throw new TypeError("Psicoandino navigation requires declared items.");
    }

    const navigation = this.querySelector(".psico-header__nav");
    navigation.innerHTML = items.map(({ id, label, shortLabel, href }) => `
      <a data-route-link="${id}" aria-label="${label}" href="${href}">
        <span class="psico-header__nav-long" aria-hidden="true">${label}</span>
        <span class="psico-header__nav-short" aria-hidden="true">${shortLabel}</span>
      </a>`).join("");

    const home = items.find(({ id }) => id === "home");
    if (home) this.querySelector(".psico-header__brand").href = home.href;
    this.dataset.navigationReady = "true";
  }

  updateRoute({ current, section = "" }) {
    if (this.dataset.ready !== "true") this.build();

    const context = this.querySelector(".psico-header__context");
    const sectionElement = this.querySelector(".psico-header__section");

    sectionElement.textContent = section;
    context.hidden = !section;

    this.querySelectorAll("[data-route-link]").forEach((link) => {
      const route = link.dataset.routeLink;

      if (route === current) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    this.setAttribute("current", current);
    this.setAttribute("section", section);
  }
}

if (!customElements.get("psico-header")) {
  customElements.define("psico-header", PsicoHeader);
}
