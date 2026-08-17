import type {
  ActivityDefinition,
  CosmeticDefinition,
  FoodDefinition,
  FurnitureDefinition,
  PetDefinition,
  SeasonalPackDefinition,
} from '../domain/types';
import { ACTIVITIES } from './activities';
import { COSMETICS } from './cosmetics';
import { DAILY_OBJECTIVES } from './dailyObjectives';
import { FOODS } from './foods';
import { FURNITURE } from './furniture';
import { PETS } from './pets';
import { SEASONAL_PACKS } from './seasonalPacks';

function indexById<T extends { id: string }>(items: readonly T[]): Readonly<Record<string, T>> {
  const result: Record<string, T> = {};
  for (const item of items) {
    result[item.id] = item;
  }
  return result;
}

export const petById = indexById(PETS);
export const foodById = indexById(FOODS);
export const activityById = indexById(ACTIVITIES);
export const cosmeticById = indexById(COSMETICS);
export const furnitureById = indexById(FURNITURE);
export const seasonalPackById = indexById(SEASONAL_PACKS);

export function getPet(id: string): PetDefinition | undefined {
  return petById[id];
}

export function getFood(id: string): FoodDefinition | undefined {
  return foodById[id];
}

export function getActivity(id: string): ActivityDefinition | undefined {
  return activityById[id];
}

export function getCosmetic(id: string): CosmeticDefinition | undefined {
  return cosmeticById[id];
}

export function getFurniture(id: string): FurnitureDefinition | undefined {
  return furnitureById[id];
}

export function getSeasonalPack(id: string): SeasonalPackDefinition | undefined {
  return seasonalPackById[id];
}

export {
  ACTIVITIES,
  COSMETICS,
  DAILY_OBJECTIVES,
  FOODS,
  FURNITURE,
  PETS,
  SEASONAL_PACKS,
};
