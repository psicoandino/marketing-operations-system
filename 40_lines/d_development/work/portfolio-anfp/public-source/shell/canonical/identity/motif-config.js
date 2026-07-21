/*
 * PSICOANDINO LIVING MOTIF — OPERATOR PARAMETERS
 *
 * Timing and biological behavior are shared by every renderer. Renderers may
 * scale the canonical geometry, but they must not redefine the organism.
 */
export const motifConfig = Object.freeze({
  timing: Object.freeze({
    grow: 400,
    largeHold: 100,
    figuresDelay: 1100,
    figureIn: 190,
    figureStagger: 200,
    figuresHold: 2200,
    figureOutStagger: 120,
    eclipseDelay: 1100,
    eclipseIn: 800,
    eclipseHold: 500,
    eclipseOut: 800,
    shrink: 600,
    agitationIn: 600,
    agitationHold: 1000,
    agitationOut: 600,
  }),

  oled: Object.freeze({
    smallRadius: 4,
    largeRadius: 16,
    agitationRadiusMultiplier: 2.1,
    agitationStrength: 0.72,
    samples: 96,
    headerTranslateY: -5,
  }),

  figures: Object.freeze({
    revealSettleDistance: 3,
    headerSettleScale: 0.32,
    gap: 4,
    viewportSize: 12,
  }),

  behavior: Object.freeze({
    eclipseChance: 0.1,
    seed: 13579,
  }),
});

