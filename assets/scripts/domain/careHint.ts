import type { PetStats } from './types';

export function careHint(petName: string, stats: PetStats): string {
  const needs = [
    { value: stats.hunger, text: `${petName} looks hungry.` },
    { value: stats.hygiene, text: `${petName} could use a bath.` },
    { value: stats.happiness, text: `${petName} wants to play.` },
    { value: stats.energy, text: `${petName} is getting sleepy.` },
  ];
  const lowest = needs.reduce((current, next) => (next.value < current.value ? next : current));
  if (lowest.value >= 60) {
    return `${petName} looks cozy.`;
  }
  return lowest.text;
}
