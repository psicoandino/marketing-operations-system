import {
  createMotifRenderer,
  HEADER_SETTLE_SCALE,
} from "./renderer-core.js";

export function createHeaderRenderer(headerElement) {
  return createMotifRenderer({
    host: headerElement,
    oledElement: headerElement.querySelector("[data-motif-oled]"),
    wipeElement: headerElement.querySelector("[data-motif-wipe]"),
    figureElements: [...headerElement.querySelectorAll("[data-motif-figure]")],
    settleScale: HEADER_SETTLE_SCALE,
  });
}
