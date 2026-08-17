import type { DailyObjectiveDefinition } from '../domain/types';
import { PET_MISO_ID } from './pets';

export const DAILY_OBJECTIVES: DailyObjectiveDefinition[] = [
  {
    id: 'daily_feed',
    description: 'Feed your pet twice',
    kind: 'feed',
    target: 2,
    rewardCoins: 15,
  },
  {
    id: 'daily_clean',
    description: 'Give a bath once',
    kind: 'clean',
    target: 1,
    rewardCoins: 10,
  },
  {
    id: 'daily_play',
    description: 'Play once',
    kind: 'play',
    target: 1,
    rewardCoins: 10,
  },
  {
    id: 'daily_feed_miso',
    description: 'Feed Miso once',
    kind: 'feed',
    target: 1,
    rewardCoins: 8,
    petDefinitionId: PET_MISO_ID,
  },
];
