import { sys } from 'cc';
import type {
  CosmeticSlot,
  DailyObjectiveState,
  EquippedSlots,
  GameSave,
  InventoryState,
  PetState,
  PetStats,
  RoomAnchor,
  RoomState,
} from '../domain/types';
import { COSMETIC_SLOTS, ROOM_ANCHORS } from '../domain/types';
import { createEmptyDailyState } from '../domain/objectives';
import { clampStats, createDefaultStats } from '../domain/stats';
import { clock } from './ClockService';
import { SAVE_KEY, SAVE_VERSION } from './constants';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

function readStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {};
  }
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'string') {
      result[key] = entry;
    }
  }
  return result;
}

function readNumberRecord(value: unknown): Record<string, number> {
  if (!isRecord(value)) {
    return {};
  }
  const result: Record<string, number> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'number' && Number.isFinite(entry)) {
      result[key] = entry;
    }
  }
  return result;
}

function readStats(value: unknown): PetStats {
  if (!isRecord(value)) {
    return createDefaultStats();
  }
  return clampStats({
    hunger: readNumber(value.hunger, 45),
    hygiene: readNumber(value.hygiene, 55),
    happiness: readNumber(value.happiness, 50),
    energy: readNumber(value.energy, 70),
    affection: readNumber(value.affection, 0),
  });
}

function readEquipped(value: unknown): EquippedSlots {
  const raw = readStringRecord(value);
  const equipped: EquippedSlots = {};
  for (const slot of COSMETIC_SLOTS) {
    const itemId = raw[slot];
    if (itemId) {
      equipped[slot] = itemId;
    }
  }
  return equipped;
}

function readPet(id: string, value: unknown, now: number): PetState | null {
  if (!isRecord(value)) {
    return null;
  }
  const definitionId = readString(value.definitionId, id);
  if (!definitionId) {
    return null;
  }
  return {
    id: readString(value.id, id),
    definitionId,
    stats: readStats(value.stats),
    equipped: readEquipped(value.equipped),
    lastUpdatedAt: readNumber(value.lastUpdatedAt, now),
  };
}

function readPets(value: unknown, now: number): Record<string, PetState> {
  if (!isRecord(value)) {
    return {};
  }
  const pets: Record<string, PetState> = {};
  for (const [id, entry] of Object.entries(value)) {
    const pet = readPet(id, entry, now);
    if (pet) {
      pets[id] = pet;
    }
  }
  return pets;
}

function readInventory(value: unknown): InventoryState {
  if (!isRecord(value)) {
    return { food: {}, cosmetics: [], furniture: [] };
  }
  return {
    food: readNumberRecord(value.food),
    cosmetics: readStringArray(value.cosmetics),
    furniture: readStringArray(value.furniture),
  };
}

function readRoom(value: unknown): RoomState {
  if (!isRecord(value)) {
    return { placements: {} };
  }
  const raw = readStringRecord(value.placements);
  const placements: Partial<Record<RoomAnchor, string>> = {};
  for (const anchor of ROOM_ANCHORS) {
    const furnitureId = raw[anchor];
    if (furnitureId) {
      placements[anchor] = furnitureId;
    }
  }
  return { placements };
}

function readDaily(value: unknown, dateKey: string): DailyObjectiveState {
  if (!isRecord(value)) {
    return createEmptyDailyState(dateKey);
  }
  return {
    dateKey: readString(value.dateKey, dateKey),
    progress: readNumberRecord(value.progress),
    completed: readStringArray(value.completed),
  };
}

export function normalizeSave(raw: unknown, now: number, dateKey: string): GameSave | null {
  if (!isRecord(raw)) {
    return null;
  }

  const pets = readPets(raw.pets, now);
  if (Object.keys(pets).length === 0) {
    return null;
  }

  const selectedPetId = typeof raw.selectedPetId === 'string' ? raw.selectedPetId : null;
  const resolvedSelected =
    selectedPetId && pets[selectedPetId] ? selectedPetId : Object.keys(pets)[0] ?? null;

  return {
    saveVersion: SAVE_VERSION,
    coins: Math.max(0, Math.round(readNumber(raw.coins, 0))),
    selectedPetId: resolvedSelected,
    pets,
    inventory: readInventory(raw.inventory),
    room: readRoom(raw.room),
    dailyObjectives: readDaily(raw.dailyObjectives, dateKey),
    unlockedCollection: readStringArray(raw.unlockedCollection),
  };
}

export function cloneSave(save: GameSave): GameSave {
  const parsed: unknown = JSON.parse(JSON.stringify(save));
  const cloned = normalizeSave(parsed, clock.now(), clock.todayKey());
  if (!cloned) {
    throw new Error('Failed to clone save');
  }
  return cloned;
}

function readStorageItem(key: string): string | null {
  try {
    const value: unknown = sys.localStorage.getItem(key);
    return typeof value === 'string' ? value : null;
  } catch (error) {
    console.warn('[SaveService] read failed', error);
    return null;
  }
}

function writeStorageItem(key: string, value: string): void {
  try {
    sys.localStorage.setItem(key, value);
  } catch (error) {
    console.warn('[SaveService] write failed', error);
  }
}

export class SaveService {
  load(): GameSave | null {
    const rawText = readStorageItem(SAVE_KEY);
    if (!rawText) {
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch (error) {
      console.warn('[SaveService] invalid JSON, starting fresh', error);
      return null;
    }

    const now = clock.now();
    return normalizeSave(parsed, now, clock.todayKey(now));
  }

  save(state: GameSave): void {
    const payload: GameSave = {
      ...state,
      saveVersion: SAVE_VERSION,
    };
    writeStorageItem(SAVE_KEY, JSON.stringify(payload));
  }

  clear(): void {
    try {
      sys.localStorage.removeItem(SAVE_KEY);
    } catch (error) {
      console.warn('[SaveService] clear failed', error);
    }
  }
}

export const saveService = new SaveService();
