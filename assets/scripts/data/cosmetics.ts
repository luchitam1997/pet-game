import type { CosmeticDefinition } from '../domain/types';

export const COS_SAILOR_HAT_ID = 'cos_sailor_hat';
export const COS_ROUND_GLASSES_ID = 'cos_round_glasses';
export const COS_BANDANA_ID = 'cos_bandana';
export const COS_BELL_COLLAR_ID = 'cos_bell_collar';
export const COS_RAINCOAT_ID = 'cos_raincoat';
export const COS_HOODIE_ID = 'cos_hoodie';
export const COS_LEAF_BERET_ID = 'cos_leaf_beret';
export const COS_MOON_CAPE_ID = 'cos_moon_cape';

export const COSMETICS: CosmeticDefinition[] = [
  {
    id: COS_SAILOR_HAT_ID,
    slot: 'head',
    displayName: 'Sailor Hat',
    species: ['any'],
    tags: ['cozy', 'classic'],
    assetKey: 'cosmetic/sailor_hat',
    priceCoins: 40,
  },
  {
    id: COS_ROUND_GLASSES_ID,
    slot: 'face',
    displayName: 'Round Glasses',
    species: ['any'],
    tags: ['cozy', 'smart'],
    assetKey: 'cosmetic/round_glasses',
    priceCoins: 35,
  },
  {
    id: COS_BANDANA_ID,
    slot: 'neck',
    displayName: 'Bandana',
    species: ['any'],
    tags: ['cozy', 'playful'],
    assetKey: 'cosmetic/bandana',
    priceCoins: 25,
  },
  {
    id: COS_BELL_COLLAR_ID,
    slot: 'neck',
    displayName: 'Bell Collar',
    species: ['cat'],
    tags: ['cozy', 'cat'],
    assetKey: 'cosmetic/bell_collar',
    priceCoins: 30,
  },
  {
    id: COS_RAINCOAT_ID,
    slot: 'body',
    displayName: 'Raincoat',
    species: ['any'],
    tags: ['cozy', 'weather'],
    assetKey: 'cosmetic/raincoat',
    priceCoins: 55,
  },
  {
    id: COS_HOODIE_ID,
    slot: 'body',
    displayName: 'Hoodie',
    species: ['dog'],
    tags: ['cozy', 'dog'],
    assetKey: 'cosmetic/hoodie',
    priceCoins: 50,
  },
  {
    id: COS_LEAF_BERET_ID,
    slot: 'head',
    displayName: 'Leaf Beret',
    species: ['any'],
    tags: ['autumn', 'seasonal'],
    assetKey: 'cosmetic/leaf_beret',
    priceCoins: 45,
    seasonalPackId: 'pack_autumn_cozy',
  },
  {
    id: COS_MOON_CAPE_ID,
    slot: 'body',
    displayName: 'Moon Cape',
    species: ['any'],
    tags: ['autumn', 'seasonal'],
    assetKey: 'cosmetic/moon_cape',
    priceCoins: 60,
    seasonalPackId: 'pack_autumn_cozy',
  },
];
