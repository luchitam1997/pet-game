import type { CosmeticDefinition, CosmeticSlot, PetDefinition } from './types';

export interface EquipCheck {
  ok: boolean;
  reason: string;
}

export function evaluateEquip(
  cosmetic: CosmeticDefinition,
  pet: PetDefinition,
  slot: CosmeticSlot,
): EquipCheck {
  if (cosmetic.slot !== slot) {
    return {
      ok: false,
      reason: `${cosmetic.displayName} fits ${cosmetic.slot}, not ${slot}.`,
    };
  }

  const compatible =
    cosmetic.species.includes('any') || cosmetic.species.includes(pet.species);
  if (!compatible) {
    return {
      ok: false,
      reason: `${cosmetic.displayName} is not compatible with ${pet.species}s.`,
    };
  }

  return { ok: true, reason: '' };
}
