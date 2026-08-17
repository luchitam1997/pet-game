export interface BathStep {
  id: string;
  title: string;
  instruction: string;
  actionLabel: string;
  tapsRequired: number;
}

export const BATH_STEPS: BathStep[] = [
  {
    id: 'rinse',
    title: 'Rinse',
    instruction: 'Tap to wet the fur.',
    actionLabel: 'Rinse',
    tapsRequired: 1,
  },
  {
    id: 'soap',
    title: 'Scrub',
    instruction: 'Scrub the soapy spots — 3 taps.',
    actionLabel: 'Scrub',
    tapsRequired: 3,
  },
  {
    id: 'dry',
    title: 'Dry',
    instruction: 'Tap to towel dry.',
    actionLabel: 'Dry',
    tapsRequired: 1,
  },
];
