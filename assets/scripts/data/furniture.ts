import type { FurnitureDefinition } from '../domain/types';

export const FUR_COZY_BED_ID = 'fur_cozy_bed';
export const FUR_POTTED_PLANT_ID = 'fur_potted_plant';
export const FUR_WINDOW_PERCH_ID = 'fur_window_perch';
export const FUR_FLOOR_CUSHION_ID = 'fur_floor_cushion';
export const FUR_FLOOR_LAMP_ID = 'fur_floor_lamp';
export const FUR_AUTUMN_RUG_ID = 'fur_autumn_rug';

export const FURNITURE: FurnitureDefinition[] = [
  {
    id: FUR_COZY_BED_ID,
    displayName: 'Cozy Bed',
    allowedAnchors: ['floor'],
    tags: ['cozy', 'sleep'],
    assetKey: 'furniture/cozy_bed',
    priceCoins: 70,
  },
  {
    id: FUR_POTTED_PLANT_ID,
    displayName: 'Potted Plant',
    allowedAnchors: ['left', 'right'],
    tags: ['cozy', 'nature'],
    assetKey: 'furniture/potted_plant',
    priceCoins: 35,
  },
  {
    id: FUR_WINDOW_PERCH_ID,
    displayName: 'Window Perch',
    allowedAnchors: ['right'],
    tags: ['cozy', 'lookout'],
    assetKey: 'furniture/window_perch',
    priceCoins: 55,
  },
  {
    id: FUR_FLOOR_CUSHION_ID,
    displayName: 'Floor Cushion',
    allowedAnchors: ['center', 'floor'],
    tags: ['cozy', 'soft'],
    assetKey: 'furniture/floor_cushion',
    priceCoins: 40,
  },
  {
    id: FUR_FLOOR_LAMP_ID,
    displayName: 'Floor Lamp',
    allowedAnchors: ['left'],
    tags: ['cozy', 'light'],
    assetKey: 'furniture/floor_lamp',
    priceCoins: 45,
  },
  {
    id: FUR_AUTUMN_RUG_ID,
    displayName: 'Autumn Rug',
    allowedAnchors: ['floor', 'center'],
    tags: ['autumn', 'seasonal'],
    assetKey: 'furniture/autumn_rug',
    priceCoins: 50,
    seasonalPackId: 'pack_autumn_cozy',
  },
];
