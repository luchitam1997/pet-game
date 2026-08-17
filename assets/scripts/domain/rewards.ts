import type { CareReward, FoodDefinition, FoodPreference, PetDefinition, PetStats } from './types';

export interface FeedEffects {
  stats: Partial<PetStats>;
  reward: CareReward;
  preference: FoodPreference;
}

export function computeFeedEffects(pet: PetDefinition, food: FoodDefinition): FeedEffects {
  let hunger = food.hungerRestore;
  let happiness = food.happinessDelta;
  let preference: FoodPreference = 'normal';

  if (food.id === pet.favoriteFoodId) {
    hunger = Math.round(hunger * 1.5);
    happiness += 10;
    preference = 'favorite';
  } else if (pet.dislikedFoodId && food.id === pet.dislikedFoodId) {
    hunger = Math.round(hunger * 0.5);
    preference = 'disliked';
  }

  return {
    stats: { hunger, happiness },
    reward: { coins: 5, affection: 2 },
    preference,
  };
}

export function playBonusCoins(score: number): number {
  if (!Number.isFinite(score) || score <= 0) {
    return 0;
  }
  return Math.min(20, Math.floor(score / 10));
}
