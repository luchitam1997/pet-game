export type Species = 'dog' | 'cat';
export type SpeciesFilter = Species | 'any';
export type CosmeticSlot = 'head' | 'neck' | 'body' | 'back' | 'face' | 'paw';
export type RoomAnchor = 'left' | 'center' | 'right' | 'floor';
export type ActivityKind = 'feed' | 'clean' | 'play' | 'rest';
export type DailyObjectiveKind = ActivityKind | 'equip' | 'place';
export type FoodPreference = 'favorite' | 'disliked' | 'normal';

export const COSMETIC_SLOTS: readonly CosmeticSlot[] = [
  'head',
  'neck',
  'body',
  'back',
  'face',
  'paw',
];

export const ROOM_ANCHORS: readonly RoomAnchor[] = ['left', 'center', 'right', 'floor'];

export interface PetStats {
  hunger: number;
  hygiene: number;
  happiness: number;
  energy: number;
  affection: number;
}

export interface CareReward {
  coins: number;
  affection: number;
}

export interface ActionOk {
  ok: true;
  message: string;
  reward?: CareReward;
}

export interface ActionFail {
  ok: false;
  message: string;
}

export type ActionResult = ActionOk | ActionFail;

export interface PetDefinition {
  id: string;
  displayName: string;
  species: Species;
  personality: string;
  favoriteFoodId: string;
  dislikedFoodId?: string;
  favoriteActivityId?: string;
  tags: string[];
  assetKey: string;
}

export interface FoodDefinition {
  id: string;
  displayName: string;
  hungerRestore: number;
  happinessDelta: number;
  priceCoins?: number;
  assetKey: string;
}

export interface ActivityDefinition {
  id: string;
  kind: Exclude<ActivityKind, 'feed'>;
  displayName: string;
  durationSeconds?: number;
  coins: number;
  affection: number;
  statEffects: Partial<Omit<PetStats, 'affection'>>;
  energyCost?: number;
}

export interface CosmeticDefinition {
  id: string;
  slot: CosmeticSlot;
  displayName: string;
  species: SpeciesFilter[];
  tags: string[];
  assetKey: string;
  priceCoins?: number;
  seasonalPackId?: string;
}

export interface FurnitureDefinition {
  id: string;
  displayName: string;
  allowedAnchors: RoomAnchor[];
  tags: string[];
  assetKey: string;
  priceCoins?: number;
  seasonalPackId?: string;
}

export interface SeasonalPackDefinition {
  id: string;
  displayName: string;
  startAt: string;
  endAt: string;
  themeAssetKey: string;
  cosmeticIds: string[];
  furnitureIds: string[];
  badgeId?: string;
}

export interface DailyObjectiveDefinition {
  id: string;
  description: string;
  kind: DailyObjectiveKind;
  target: number;
  rewardCoins: number;
  petDefinitionId?: string;
}

export type EquippedSlots = Partial<Record<CosmeticSlot, string>>;

export interface PetState {
  id: string;
  definitionId: string;
  stats: PetStats;
  equipped: EquippedSlots;
  lastUpdatedAt: number;
}

export interface InventoryState {
  food: Record<string, number>;
  cosmetics: string[];
  furniture: string[];
}

export interface RoomState {
  placements: Partial<Record<RoomAnchor, string>>;
}

export interface DailyObjectiveState {
  dateKey: string;
  progress: Record<string, number>;
  completed: string[];
}

export interface GameSave {
  saveVersion: number;
  coins: number;
  selectedPetId: string | null;
  pets: Record<string, PetState>;
  inventory: InventoryState;
  room: RoomState;
  dailyObjectives: DailyObjectiveState;
  unlockedCollection: string[];
}
