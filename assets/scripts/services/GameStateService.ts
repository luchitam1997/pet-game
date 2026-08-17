import {
  ACTIVITY_CLEAN_ID,
  ACTIVITY_PLAY_ID,
  ACTIVITY_REST_ID,
} from '../data/activities';
import {
  DAILY_OBJECTIVES,
  getActivity,
  getCosmetic,
  getFood,
  getFurniture,
  getPet,
} from '../data/catalog';
import { createPetState, createSeedSave } from '../data/seed';
import { evaluateEquip } from '../domain/equipment';
import { refreshDailyState } from '../domain/objectives';
import { evaluatePlacement } from '../domain/room';
import { computeFeedEffects, playBonusCoins } from '../domain/rewards';
import { applyOfflineDecay, applyStatDelta, REST_ENERGY_BLOCK_AT } from '../domain/stats';
import type {
  ActionResult,
  ActivityDefinition,
  CosmeticSlot,
  DailyObjectiveKind,
  GameSave,
  PetState,
  RoomAnchor,
} from '../domain/types';
import { gameEvents } from '../events/EventBus';
import { clock } from './ClockService';
import { cloneSave, saveService } from './SaveService';

function fail(message: string): ActionResult {
  return { ok: false, message };
}

export class GameStateService {
  private state: GameSave | null = null;

  boot(): GameSave {
    const loaded = saveService.load();
    if (loaded) {
      this.state = loaded;
    } else {
      const now = clock.now();
      this.state = createSeedSave(now, clock.todayKey(now));
    }
    this.applyDecayToAllPets();
    this.refreshDailyObjectives();
    this.persist();
    return this.getSnapshot();
  }

  getSnapshot(): GameSave {
    return cloneSave(this.requireState());
  }

  getSelectedPet(): PetState | null {
    const state = this.requireState();
    if (!state.selectedPetId) {
      return null;
    }
    return state.pets[state.selectedPetId] ?? null;
  }

  hasAnyFood(): boolean {
    const food = this.requireState().inventory.food;
    return Object.keys(food).some((id) => (food[id] ?? 0) > 0);
  }

  canRest(): boolean {
    const pet = this.getSelectedPet();
    return !!pet && pet.stats.energy < REST_ENERGY_BLOCK_AT;
  }

  canPlay(): boolean {
    const pet = this.getSelectedPet();
    const activity = getActivity(ACTIVITY_PLAY_ID);
    if (!pet) {
      return false;
    }
    const cost = activity?.energyCost ?? 0;
    return pet.stats.energy >= cost;
  }

  restBlockReason(): string {
    return `Already rested enough (energy ${REST_ENERGY_BLOCK_AT}+).`;
  }

  playBlockReason(): string {
    return 'Too tired to play right now.';
  }

  selectPet(definitionId: string): ActionResult {
    const definition = getPet(definitionId);
    if (!definition) {
      return fail(`Unknown pet: ${definitionId}`);
    }

    const state = this.requireState();
    if (!state.pets[definitionId]) {
      state.pets[definitionId] = createPetState(definitionId, clock.now());
    }
    state.selectedPetId = definitionId;
    this.unlock(definitionId);
    this.persist();
    gameEvents.emit('pet:updated', { petId: definitionId });
    return { ok: true, message: `Now caring for ${definition.displayName}.` };
  }

  feed(foodId: string): ActionResult {
    const pet = this.requireSelectedPet();
    const petDef = getPet(pet.definitionId);
    const food = getFood(foodId);
    if (!petDef || !food) {
      return fail('Pet or food is missing from catalog.');
    }

    const owned = this.requireState().inventory.food[foodId] ?? 0;
    if (owned <= 0) {
      return fail(`No ${food.displayName} left.`);
    }

    const effects = computeFeedEffects(petDef, food);
    this.requireState().inventory.food[foodId] = owned - 1;
    pet.stats = applyStatDelta(pet.stats, {
      ...effects.stats,
      affection: effects.reward.affection,
    });
    pet.lastUpdatedAt = clock.now();
    this.requireState().coins += effects.reward.coins;
    this.unlock(foodId);
    this.bumpObjective('feed', pet.definitionId);

    this.persist();
    this.emitPetCurrencyInventory('feed');

    const flavor =
      effects.preference === 'favorite'
        ? `${petDef.displayName} loved the ${food.displayName}!`
        : effects.preference === 'disliked'
          ? `${petDef.displayName} ate the ${food.displayName} anyway.`
          : `${petDef.displayName} ate ${food.displayName}.`;

    return {
      ok: true,
      message: `${flavor} +${effects.reward.coins} coins`,
      reward: effects.reward,
    };
  }

  completeClean(): ActionResult {
    return this.applyCareActivity(ACTIVITY_CLEAN_ID);
  }

  completePlay(score: number): ActionResult {
    return this.applyCareActivity(ACTIVITY_PLAY_ID, playBonusCoins(score));
  }

  rest(): ActionResult {
    const pet = this.requireSelectedPet();
    if (pet.stats.energy >= REST_ENERGY_BLOCK_AT) {
      return fail('Already rested enough for now.');
    }
    return this.applyCareActivity(ACTIVITY_REST_ID);
  }

  equip(slot: CosmeticSlot, cosmeticId: string): ActionResult {
    const pet = this.requireSelectedPet();
    const petDef = getPet(pet.definitionId);
    const cosmetic = getCosmetic(cosmeticId);
    if (!petDef || !cosmetic) {
      return fail('Pet or cosmetic is missing from catalog.');
    }

    if (!this.requireState().inventory.cosmetics.includes(cosmeticId)) {
      return fail(`You do not own ${cosmetic.displayName}.`);
    }

    const check = evaluateEquip(cosmetic, petDef, slot);
    if (!check.ok) {
      return fail(check.reason);
    }

    pet.equipped[slot] = cosmeticId;
    pet.lastUpdatedAt = clock.now();
    this.unlock(cosmeticId);
    this.bumpObjective('equip', pet.definitionId);
    this.persist();
    gameEvents.emit('pet:updated', { petId: pet.id });
    return { ok: true, message: `Equipped ${cosmetic.displayName} on ${slot}.` };
  }

  buyCosmetic(cosmeticId: string): ActionResult {
    return this.buyCatalogItem('cosmetic', cosmeticId);
  }

  buyFurniture(furnitureId: string): ActionResult {
    return this.buyCatalogItem('furniture', furnitureId);
  }

  unequip(slot: CosmeticSlot): ActionResult {
    const pet = this.requireSelectedPet();
    if (!pet.equipped[slot]) {
      return fail(`Nothing equipped on ${slot}.`);
    }
    delete pet.equipped[slot];
    pet.lastUpdatedAt = clock.now();
    this.persist();
    gameEvents.emit('pet:updated', { petId: pet.id });
    return { ok: true, message: `Removed ${slot} accessory.` };
  }

  placeFurniture(anchor: RoomAnchor, furnitureId: string | null): ActionResult {
    const state = this.requireState();
    if (furnitureId === null) {
      const removed = state.room.placements[anchor];
      if (!removed) {
        return fail(`Nothing placed on ${anchor}.`);
      }
      delete state.room.placements[anchor];
      this.persist();
      gameEvents.emit('room:changed', { placements: { ...state.room.placements } });
      return { ok: true, message: `Cleared ${anchor}.` };
    }

    const furniture = getFurniture(furnitureId);
    if (!furniture) {
      return fail(`Unknown furniture: ${furnitureId}`);
    }
    if (!state.inventory.furniture.includes(furnitureId)) {
      return fail(`You do not own ${furniture.displayName}.`);
    }

    const check = evaluatePlacement(furniture, anchor);
    if (!check.ok) {
      return fail(check.reason);
    }

    const previousId = state.room.placements[anchor];
    let movedFrom: RoomAnchor | null = null;
    for (const [existingAnchor, placedId] of Object.entries(state.room.placements)) {
      if (placedId === furnitureId) {
        const from = existingAnchor as RoomAnchor;
        if (from !== anchor) {
          movedFrom = from;
        }
        delete state.room.placements[from];
      }
    }

    state.room.placements[anchor] = furnitureId;
    this.unlock(furnitureId);
    this.bumpObjective('place', state.selectedPetId ?? undefined);
    this.persist();
    gameEvents.emit('room:changed', { placements: { ...state.room.placements } });

    if (previousId && previousId !== furnitureId) {
      const previous = getFurniture(previousId);
      return {
        ok: true,
        message: `Replaced ${previous?.displayName ?? 'item'} with ${furniture.displayName} on ${anchor}.`,
      };
    }
    if (movedFrom) {
      return { ok: true, message: `Moved ${furniture.displayName} from ${movedFrom} to ${anchor}.` };
    }
    return { ok: true, message: `Placed ${furniture.displayName} on ${anchor}.` };
  }

  private buyCatalogItem(kind: 'cosmetic' | 'furniture', itemId: string): ActionResult {
    const state = this.requireState();
    if (kind === 'cosmetic') {
      const cosmetic = getCosmetic(itemId);
      if (!cosmetic) {
        return fail(`Unknown cosmetic: ${itemId}`);
      }
      if (state.inventory.cosmetics.includes(itemId)) {
        return fail(`You already own ${cosmetic.displayName}.`);
      }
      const price = cosmetic.priceCoins;
      if (price === undefined) {
        return fail(`${cosmetic.displayName} is not for sale.`);
      }
      if (state.coins < price) {
        return fail(`Need ${price} coins for ${cosmetic.displayName}.`);
      }
      state.coins -= price;
      state.inventory.cosmetics.push(itemId);
      this.unlock(itemId);
      this.persist();
      this.emitPetCurrencyInventory('buy-cosmetic');
      return { ok: true, message: `Bought ${cosmetic.displayName} for ${price} coins.` };
    }

    const furniture = getFurniture(itemId);
    if (!furniture) {
      return fail(`Unknown furniture: ${itemId}`);
    }
    if (state.inventory.furniture.includes(itemId)) {
      return fail(`You already own ${furniture.displayName}.`);
    }
    const price = furniture.priceCoins;
    if (price === undefined) {
      return fail(`${furniture.displayName} is not for sale.`);
    }
    if (state.coins < price) {
      return fail(`Need ${price} coins for ${furniture.displayName}.`);
    }
    state.coins -= price;
    state.inventory.furniture.push(itemId);
    this.unlock(itemId);
    this.persist();
    this.emitPetCurrencyInventory('buy-furniture');
    return { ok: true, message: `Bought ${furniture.displayName} for ${price} coins.` };
  }

  private applyCareActivity(activityId: string, extraCoins = 0): ActionResult {
    const activity = getActivity(activityId);
    if (!activity) {
      return fail(`Unknown activity: ${activityId}`);
    }

    const pet = this.requireSelectedPet();
    const blocked = this.validateActivity(pet, activity);
    if (blocked) {
      return blocked;
    }

    pet.stats = applyStatDelta(pet.stats, {
      ...activity.statEffects,
      affection: activity.affection,
    });
    pet.lastUpdatedAt = clock.now();
    const coins = activity.coins + extraCoins;
    this.requireState().coins += coins;
    this.bumpObjective(activity.kind, pet.definitionId);
    this.persist();
    this.emitPetCurrency(pet.id);

    return {
      ok: true,
      message: `${activity.displayName} complete. +${coins} coins`,
      reward: { coins, affection: activity.affection },
    };
  }

  private validateActivity(pet: PetState, activity: ActivityDefinition): ActionResult | null {
    if (activity.energyCost !== undefined && pet.stats.energy < activity.energyCost) {
      return fail('Too tired to play right now.');
    }
    return null;
  }

  private applyDecayToAllPets(): void {
    const state = this.requireState();
    const now = clock.now();
    for (const pet of Object.values(state.pets)) {
      pet.stats = applyOfflineDecay(pet.stats, pet.lastUpdatedAt, now);
      pet.lastUpdatedAt = now;
    }
  }

  private refreshDailyObjectives(): void {
    const state = this.requireState();
    state.dailyObjectives = refreshDailyState(state.dailyObjectives, clock.todayKey());
  }

  private bumpObjective(kind: DailyObjectiveKind, petDefinitionId?: string): void {
    const state = this.requireState();
    this.refreshDailyObjectives();
    let grantedCoins = 0;

    for (const definition of DAILY_OBJECTIVES) {
      if (definition.kind !== kind) {
        continue;
      }
      if (definition.petDefinitionId && definition.petDefinitionId !== petDefinitionId) {
        continue;
      }
      if (state.dailyObjectives.completed.includes(definition.id)) {
        continue;
      }
      const current = state.dailyObjectives.progress[definition.id] ?? 0;
      const next = current + 1;
      state.dailyObjectives.progress[definition.id] = next;
      if (next >= definition.target) {
        state.dailyObjectives.completed.push(definition.id);
        grantedCoins += definition.rewardCoins;
      }
    }

    if (grantedCoins > 0) {
      state.coins += grantedCoins;
    }
  }

  private unlock(id: string): void {
    const state = this.requireState();
    if (!state.unlockedCollection.includes(id)) {
      state.unlockedCollection.push(id);
    }
  }

  private persist(): void {
    saveService.save(this.requireState());
  }

  private emitPetCurrency(petId: string): void {
    const state = this.requireState();
    gameEvents.emit('pet:updated', { petId });
    gameEvents.emit('currency:changed', { coins: state.coins });
  }

  private emitPetCurrencyInventory(reason: string): void {
    const state = this.requireState();
    const petId = state.selectedPetId;
    if (petId) {
      gameEvents.emit('pet:updated', { petId });
    }
    gameEvents.emit('currency:changed', { coins: state.coins });
    gameEvents.emit('inventory:changed', { reason });
  }

  private requireState(): GameSave {
    if (!this.state) {
      throw new Error('GameStateService.boot() must be called first');
    }
    return this.state;
  }

  private requireSelectedPet(): PetState {
    const pet = this.getSelectedPet();
    if (!pet) {
      throw new Error('No pet selected');
    }
    return pet;
  }
}

export const gameState = new GameStateService();
