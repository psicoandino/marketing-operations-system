import { motifConfig } from "../identity/motif-config.js";

function instanceId(prefix) {
  return globalThis.crypto?.randomUUID?.() ??
    `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function createMotifClock(defaultSeed = motifConfig.behavior.seed) {
  const origin = Date.now();

  return Object.freeze({
    historyId: instanceId("motif-history"),
    origin,
    seed: defaultSeed,
    now: () => Math.max(0, Date.now() - origin),
  });
}

export const motifClock = createMotifClock();
