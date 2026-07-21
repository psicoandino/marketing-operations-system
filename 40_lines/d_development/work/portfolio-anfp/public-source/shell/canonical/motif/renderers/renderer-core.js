import { motifConfig } from "../../identity/motif-config.js";
import { path } from "../../identity/motif-geometry.js";
import { MOTIF_GLYPHS } from "../../identity/motif-glyphs.js";

export function createMotifRenderer({
  host,
  oledElement,
  wipeElement,
  figureElements,
  settleScale,
}) {
  if (!host || !oledElement || !wipeElement || figureElements.length !== 4) {
    throw new Error("A motif renderer requires one OLED, one wipe and four figures.");
  }

  return Object.freeze({
    render(state) {
      host.dataset.motifCycle = String(state.cycle);
      host.dataset.motifPhase = state.phase;
      host.dataset.motifSeries = state.series.join(",");
      host.dataset.motifOledShape = state.oledShape;
      host.dataset.motifTimestamp = String(Math.round(state.timestamp));

      oledElement.setAttribute("d", path(state.oled, state.oledSmooth));

      const wipeWidth = 32 * state.eclipseProgress;
      const wipeX = state.phase === "eclipse-out" ? -16 : 16 - wipeWidth;
      wipeElement.setAttribute("x", String(wipeX));
      wipeElement.setAttribute("width", String(wipeWidth));

      figureElements.forEach((element, index) => {
        const figure = state.figures[index];
        const resolvedSettleScale =
          typeof settleScale === "function" ? settleScale() : settleScale;

        if (element.dataset.shape !== figure.shape) {
          element.innerHTML = MOTIF_GLYPHS[figure.shape];
          element.dataset.shape = figure.shape;
        }

        element.style.opacity = String(figure.opacity);
        element.style.transform = `translateY(${(
          figure.settle * resolvedSettleScale
        ).toFixed(2)}px)`;
      });
    },
  });
}

export const HEADER_SETTLE_SCALE = motifConfig.figures.headerSettleScale;
