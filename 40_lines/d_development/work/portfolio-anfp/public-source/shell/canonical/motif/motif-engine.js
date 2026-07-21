import { motifClock } from "./motif-clock.js";
import { motifConfig } from "../identity/motif-config.js";
import {
  circle,
  interpolate,
  motifShape,
  smooth,
} from "../identity/motif-geometry.js";
import { MOTIF_GLYPH_NAMES } from "../identity/motif-glyphs.js";

const PHASES = Object.freeze([
  "shrink",
  "alboroto-in",
  "alboroto-hold",
  "alboroto-out",
  "grow",
  "large-hold",
  "figures-delay",
  "figures-in",
  "eclipse-delay",
  "eclipse-in",
  "eclipse-hold",
  "eclipse-out",
  "figures-hold",
  "figures-out",
]);

const { timing, oled, figures, behavior } = motifConfig;

const PHASE_DURATION = Object.freeze({
  shrink: timing.shrink,
  "alboroto-in": timing.agitationIn,
  "alboroto-hold": timing.agitationHold,
  "alboroto-out": timing.agitationOut,
  grow: timing.grow,
  "large-hold": timing.largeHold,
  "figures-delay": timing.figuresDelay,
  "figures-in": timing.figureStagger * 3 + timing.figureIn,
  "eclipse-delay": timing.eclipseDelay,
  "eclipse-in": timing.eclipseIn,
  "eclipse-hold": timing.eclipseHold,
  "eclipse-out": timing.eclipseOut,
  "figures-hold": timing.figuresHold,
  "figures-out": timing.figureOutStagger * 3 + 1,
});

function mulberry32(initialSeed) {
  let seed = initialSeed;

  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

class MotifStateMachine {
  constructor(seed) {
    this.random = mulberry32(seed);
    this.phase = "shrink";
    this.phaseStart = 0;
    this.cycle = 0;
    this.eclipse = false;
    this.series = [...MOTIF_GLYPH_NAMES];
    this.oledShape = "circle";
    this.small = circle(oled.smallRadius, oled.samples);
    this.large = motifShape(this.oledShape, oled.largeRadius, oled.samples);
  }

  chooseOledShape() {
    const alternatives = MOTIF_GLYPH_NAMES.filter(
      (shape) => shape !== this.oledShape,
    );
    this.oledShape = alternatives[Math.floor(this.random() * alternatives.length)];
    this.large = motifShape(this.oledShape, oled.largeRadius, oled.samples);
  }

  chooseSeries() {
    this.series = this.series.map(
      () => MOTIF_GLYPH_NAMES[Math.floor(this.random() * MOTIF_GLYPH_NAMES.length)],
    );
    this.eclipse = this.random() < behavior.eclipseChance;
  }

  nextPhase() {
    const phaseIndex = PHASES.indexOf(this.phase);

    if (this.phase === "alboroto-out") {
      this.chooseOledShape();
      this.phase = "grow";
      return;
    }

    if (this.phase === "large-hold") {
      this.chooseSeries();
      this.phase = "figures-delay";
      return;
    }

    if (this.phase === "figures-in") {
      this.phase = this.eclipse ? "eclipse-delay" : "figures-hold";
      return;
    }

    if (this.phase === "figures-out") {
      this.phase = "shrink";
      this.cycle += 1;
      return;
    }

    this.phase = PHASES[phaseIndex + 1];
  }

  advance(now) {
    while (now - this.phaseStart >= PHASE_DURATION[this.phase]) {
      this.phaseStart += PHASE_DURATION[this.phase];
      this.nextPhase();
    }
  }

  agitatedShape(now) {
    const points = circle(
      oled.smallRadius * oled.agitationRadiusMultiplier,
      oled.samples,
    );
    const cycleOffset = this.cycle * 0.61 + 0.17;

    return points.map((point, index) => {
      const position = index / points.length;
      const temporal = (now / 1000) * Math.PI * 2 * 2.25 * 0.45;
      const variation =
        Math.sin((position * 6 + cycleOffset) * Math.PI * 2 + temporal) *
          oled.agitationStrength +
        Math.sin(
          (position * 3.8 + cycleOffset * 1.7) * Math.PI * 2 - temporal * 0.63,
        ) *
          0.28;
      const baseRadius = Math.hypot(point.x, point.y);
      const delta = variation * Math.min(7, baseRadius * 0.42);
      const radius = Math.max(baseRadius * 0.35, baseRadius + delta);
      const angle = Math.atan2(point.y, point.x);

      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    });
  }

  sample(now) {
    this.advance(now);

    const elapsed = now - this.phaseStart;
    const progress = smooth(elapsed / PHASE_DURATION[this.phase]);
    const agitated = this.agitatedShape(now);
    let oledPoints = this.large;

    if (this.phase === "shrink") {
      oledPoints = interpolate(this.large, this.small, progress);
    } else if (this.phase === "alboroto-in") {
      oledPoints = interpolate(this.small, agitated, progress);
    } else if (this.phase === "alboroto-hold") {
      oledPoints = agitated;
    } else if (this.phase === "alboroto-out") {
      oledPoints = interpolate(agitated, this.small, progress);
    } else if (this.phase === "grow") {
      oledPoints = interpolate(this.small, this.large, progress);
    }

    const eclipseProgress =
      this.phase === "eclipse-in"
        ? progress
        : this.phase === "eclipse-out"
          ? 1 - progress
          : this.phase === "eclipse-hold"
            ? 1
            : 0;
    const figuresVisible = [
      "figures-in",
      "eclipse-delay",
      "eclipse-in",
      "eclipse-hold",
      "eclipse-out",
      "figures-hold",
      "figures-out",
    ].includes(this.phase);
    const figureState = this.series.map((shape, index) => {
      const removed =
        this.phase === "figures-out" && elapsed >= index * timing.figureOutStagger;

      if (!figuresVisible || removed) {
        return { visible: false, shape, opacity: 0, settle: 0 };
      }

      const localProgress = Math.max(
        0,
        Math.min(1, (elapsed - index * timing.figureStagger) / timing.figureIn),
      );
      const amount = this.phase === "figures-in" ? smooth(localProgress) : 1;

      return {
        visible: true,
        shape,
        opacity: amount,
        settle: (1 - amount) * figures.revealSettleDistance,
      };
    });

    return {
      timestamp: now,
      cycle: this.cycle,
      phase: this.phase,
      series: [...this.series],
      oledShape: this.oledShape,
      eclipse: this.eclipse,
      eclipseProgress,
      oled: oledPoints,
      oledSmooth: this.phase.startsWith("alboroto"),
      figures: figureState,
    };
  }
}

function staticState(previousState) {
  const series = previousState?.series ?? [...MOTIF_GLYPH_NAMES];
  const oledShape = previousState?.oledShape ?? "circle";
  return {
    timestamp: motifClock.now(),
    cycle: previousState?.cycle ?? 0,
    phase: "reduced-motion",
    series: [...series],
    oledShape,
    eclipse: false,
    eclipseProgress: 0,
    oled: motifShape(oledShape, oled.largeRadius, oled.samples),
    oledSmooth: false,
    figures: series.map((shape) => ({
      visible: true,
      shape,
      opacity: 1,
      settle: 0,
    })),
  };
}

class LivingMotifEngine {
  constructor(clock) {
    this.instanceId = globalThis.crypto?.randomUUID?.() ??
      `motif-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    this.clock = clock;
    this.machine = new MotifStateMachine(clock.seed);
    this.listeners = new Set();
    this.motionQuery = typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    this.reducedMotion = this.motionQuery?.matches ?? false;
    this.state = this.reducedMotion ? staticState() : this.machine.sample(clock.now());
    this.frame = this.frame.bind(this);
    this.onMotionChange = this.onMotionChange.bind(this);
    this.frameRequest = null;
    if (this.motionQuery?.addEventListener) {
      this.motionQuery.addEventListener("change", this.onMotionChange);
    } else {
      this.motionQuery?.addListener?.(this.onMotionChange);
    }
  }

  subscribe(listener) {
    if (typeof listener !== "function") {
      throw new TypeError("A Living Motif subscriber must be a function.");
    }

    this.listeners.add(listener);
    this.start();
    listener(this.state);

    return () => {
      this.listeners.delete(listener);
      if (!this.listeners.size) this.stop();
    };
  }

  snapshot() {
    return this.state;
  }

  start() {
    if (this.reducedMotion || this.frameRequest !== null || !this.listeners.size) return;
    this.frameRequest = window.requestAnimationFrame(this.frame);
  }

  stop() {
    if (this.frameRequest === null) return;
    window.cancelAnimationFrame(this.frameRequest);
    this.frameRequest = null;
  }

  onMotionChange(event) {
    if (event.matches === this.reducedMotion) return;
    this.reducedMotion = event.matches;

    if (this.reducedMotion) {
      this.stop();
      this.state = staticState(this.state);
      this.listeners.forEach((listener) => listener(this.state));
      return;
    }

    this.state = this.machine.sample(this.clock.now());
    this.listeners.forEach((listener) => listener(this.state));
    this.start();
  }

  frame() {
    this.frameRequest = null;
    this.state = this.machine.sample(this.clock.now());
    this.start();
    this.listeners.forEach((listener) => listener(this.state));
  }
}

// The only production instance. Every renderer subscribes to this object.
export const motifEngine = new LivingMotifEngine(motifClock);
