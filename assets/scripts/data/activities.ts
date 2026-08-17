import type { ActivityDefinition } from '../domain/types';

export const ACTIVITY_CLEAN_ID = 'activity_clean';
export const ACTIVITY_PLAY_ID = 'activity_play';
export const ACTIVITY_REST_ID = 'activity_rest';

export const ACTIVITIES: ActivityDefinition[] = [
  {
    id: ACTIVITY_CLEAN_ID,
    kind: 'clean',
    displayName: 'Bath',
    durationSeconds: 30,
    coins: 8,
    affection: 3,
    statEffects: { hygiene: 28, happiness: 8 },
  },
  {
    id: ACTIVITY_PLAY_ID,
    kind: 'play',
    displayName: 'Play',
    durationSeconds: 40,
    coins: 10,
    affection: 4,
    energyCost: 15,
    statEffects: { happiness: 22, energy: -15 },
  },
  {
    id: ACTIVITY_REST_ID,
    kind: 'rest',
    displayName: 'Rest',
    durationSeconds: 20,
    coins: 2,
    affection: 1,
    statEffects: { energy: 30 },
  },
];
