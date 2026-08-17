import type { Species } from '../domain/types';

export const PLAY_MIN_SEC = 20;
export const PLAY_MAX_SEC = 60;
export const POINTS_PER_CATCH = 10;

export function playDurationSeconds(activitySeconds?: number): number {
  const raw = activitySeconds ?? 30;
  return Math.max(PLAY_MIN_SEC, Math.min(PLAY_MAX_SEC, raw));
}

export function playTitle(species: Species): string {
  return species === 'cat' ? 'Chase the spark' : 'Catch the ball';
}

export function playPrompt(species: Species): string {
  return species === 'cat' ? 'Tap the spark!' : 'Tap the ball!';
}

export function playTargetLabel(species: Species): string {
  return species === 'cat' ? '*' : 'O';
}
