import type { PetStats } from './types';

export const STAT_MIN = 0;
export const STAT_MAX = 100;
export const REST_ENERGY_BLOCK_AT = 90;

const DECAY_INTERVAL_MS = 30 * 60 * 1000;
const MAX_DECAY_PER_BOOT = 15;
const DECAY_PER_INTERVAL = {
  hunger: 1,
  hygiene: 1,
  happiness: 1,
  energy: 0.5,
} as const;

export function clampStat(value: number): number {
  if (!Number.isFinite(value)) {
    return STAT_MIN;
  }
  return Math.max(STAT_MIN, Math.min(STAT_MAX, Math.round(value)));
}

export function clampStats(stats: PetStats): PetStats {
  return {
    hunger: clampStat(stats.hunger),
    hygiene: clampStat(stats.hygiene),
    happiness: clampStat(stats.happiness),
    energy: clampStat(stats.energy),
    affection: clampStat(stats.affection),
  };
}

export function createDefaultStats(): PetStats {
  return {
    hunger: 45,
    hygiene: 55,
    happiness: 50,
    energy: 70,
    affection: 0,
  };
}

export function applyStatDelta(stats: PetStats, delta: Partial<PetStats>): PetStats {
  return clampStats({
    hunger: stats.hunger + (delta.hunger ?? 0),
    hygiene: stats.hygiene + (delta.hygiene ?? 0),
    happiness: stats.happiness + (delta.happiness ?? 0),
    energy: stats.energy + (delta.energy ?? 0),
    affection: stats.affection + (delta.affection ?? 0),
  });
}

export function applyOfflineDecay(stats: PetStats, lastUpdatedAt: number, now: number): PetStats {
  const elapsed = Math.max(0, now - lastUpdatedAt);
  const intervals = Math.floor(elapsed / DECAY_INTERVAL_MS);
  if (intervals <= 0) {
    return clampStats(stats);
  }

  const decay = (perInterval: number): number =>
    Math.min(MAX_DECAY_PER_BOOT, intervals * perInterval);

  return clampStats({
    hunger: stats.hunger - decay(DECAY_PER_INTERVAL.hunger),
    hygiene: stats.hygiene - decay(DECAY_PER_INTERVAL.hygiene),
    happiness: stats.happiness - decay(DECAY_PER_INTERVAL.happiness),
    energy: stats.energy - decay(DECAY_PER_INTERVAL.energy),
    affection: stats.affection,
  });
}
