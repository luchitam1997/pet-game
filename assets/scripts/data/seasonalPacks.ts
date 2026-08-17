import type { SeasonalPackDefinition } from '../domain/types';
import { COS_LEAF_BERET_ID, COS_MOON_CAPE_ID } from './cosmetics';
import { FUR_AUTUMN_RUG_ID } from './furniture';

export const PACK_AUTUMN_COZY_ID = 'pack_autumn_cozy';

export const SEASONAL_PACKS: SeasonalPackDefinition[] = [
  {
    id: PACK_AUTUMN_COZY_ID,
    displayName: 'Autumn Cozy',
    startAt: '2026-09-01T00:00:00.000Z',
    endAt: '2026-11-30T23:59:59.000Z',
    themeAssetKey: 'theme/autumn_cozy',
    cosmeticIds: [COS_LEAF_BERET_ID, COS_MOON_CAPE_ID],
    furnitureIds: [FUR_AUTUMN_RUG_ID],
    badgeId: 'badge_autumn_cozy',
  },
];
