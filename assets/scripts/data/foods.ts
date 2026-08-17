import type { FoodDefinition } from '../domain/types';

export const FOOD_KIBBLE_ID = 'food_kibble';
export const FOOD_TUNA_ID = 'food_tuna';
export const FOOD_TREAT_ID = 'food_treat';

export const FOODS: FoodDefinition[] = [
  {
    id: FOOD_KIBBLE_ID,
    displayName: 'Crunchy Kibble',
    hungerRestore: 22,
    happinessDelta: 4,
    priceCoins: 4,
    assetKey: 'food/kibble',
  },
  {
    id: FOOD_TUNA_ID,
    displayName: 'Tuna Bites',
    hungerRestore: 20,
    happinessDelta: 6,
    priceCoins: 5,
    assetKey: 'food/tuna',
  },
  {
    id: FOOD_TREAT_ID,
    displayName: 'Heart Treat',
    hungerRestore: 12,
    happinessDelta: 10,
    priceCoins: 6,
    assetKey: 'food/treat',
  },
];
