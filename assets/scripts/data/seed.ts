import type { GameSave, PetState } from '../domain/types';
import { createEmptyDailyState } from '../domain/objectives';
import { createDefaultStats } from '../domain/stats';
import { SAVE_VERSION } from '../services/constants';
import { COS_BANDANA_ID, COS_HOODIE_ID, COS_SAILOR_HAT_ID } from './cosmetics';
import { FOOD_KIBBLE_ID, FOOD_TREAT_ID, FOOD_TUNA_ID } from './foods';
import { FUR_COZY_BED_ID, FUR_POTTED_PLANT_ID } from './furniture';
import { PET_MISO_ID, PET_MOCHI_ID } from './pets';

export function createPetState(definitionId: string, now: number): PetState {
  return {
    id: definitionId,
    definitionId,
    stats: createDefaultStats(),
    equipped: {},
    lastUpdatedAt: now,
  };
}

export function createSeedSave(now: number, dateKey: string): GameSave {
  const mochi = createPetState(PET_MOCHI_ID, now);
  mochi.equipped = { head: COS_SAILOR_HAT_ID };

  const miso = createPetState(PET_MISO_ID, now);

  return {
    saveVersion: SAVE_VERSION,
    coins: 40,
    selectedPetId: PET_MOCHI_ID,
    pets: {
      [PET_MOCHI_ID]: mochi,
      [PET_MISO_ID]: miso,
    },
    inventory: {
      food: {
        [FOOD_KIBBLE_ID]: 5,
        [FOOD_TUNA_ID]: 5,
        [FOOD_TREAT_ID]: 5,
      },
      cosmetics: [COS_SAILOR_HAT_ID, COS_BANDANA_ID, COS_HOODIE_ID],
      furniture: [FUR_COZY_BED_ID, FUR_POTTED_PLANT_ID],
    },
    room: {
      placements: {
        floor: FUR_COZY_BED_ID,
      },
    },
    dailyObjectives: createEmptyDailyState(dateKey),
    unlockedCollection: [
      PET_MOCHI_ID,
      PET_MISO_ID,
      COS_SAILOR_HAT_ID,
      COS_BANDANA_ID,
      COS_HOODIE_ID,
      FUR_COZY_BED_ID,
      FUR_POTTED_PLANT_ID,
    ],
  };
}
