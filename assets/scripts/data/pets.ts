import type { PetDefinition } from '../domain/types';

export const PET_MOCHI_ID = 'pet_mochi';
export const PET_MISO_ID = 'pet_miso';

export const PETS: PetDefinition[] = [
  {
    id: PET_MOCHI_ID,
    displayName: 'Mochi',
    species: 'dog',
    personality: 'bouncy and snack-obsessed',
    favoriteFoodId: 'food_kibble',
    dislikedFoodId: 'food_tuna',
    favoriteActivityId: 'activity_play',
    tags: ['cozy', 'playful'],
    assetKey: 'pet/mochi',
  },
  {
    id: PET_MISO_ID,
    displayName: 'Miso',
    species: 'cat',
    personality: 'calm and a little picky',
    favoriteFoodId: 'food_tuna',
    dislikedFoodId: 'food_kibble',
    favoriteActivityId: 'activity_rest',
    tags: ['cozy', 'quiet'],
    assetKey: 'pet/miso',
  },
];
