import type { FurnitureDefinition, RoomAnchor } from './types';

export interface PlaceCheck {
  ok: boolean;
  reason: string;
}

export function evaluatePlacement(
  furniture: FurnitureDefinition,
  anchor: RoomAnchor,
): PlaceCheck {
  if (!furniture.allowedAnchors.includes(anchor)) {
    return {
      ok: false,
      reason: `${furniture.displayName} cannot be placed on ${anchor}.`,
    };
  }
  return { ok: true, reason: '' };
}
