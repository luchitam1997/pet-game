import { Graphics, HorizontalTextAlignment, Label, Node, NodeEventType, VerticalTextAlignment } from 'cc';
import { DAILY_OBJECTIVES, FOODS, getCosmetic, getPet } from '../data/catalog';
import { careHint } from '../domain/careHint';
import { REST_ENERGY_BLOCK_AT } from '../domain/stats';
import type { PetState } from '../domain/types';
import { gameState } from '../services/GameStateService';
import type { AppNav } from './nav';
import { COLORS } from './theme';
import { createLabel, createNode, createPanel, paintCircle, UiBar, UiButton } from './uiKit';

export class HubScreen {
  private readonly coinLabel: Label;
  private readonly affectionLabel: Label;
  private readonly nameLabel: Label;
  private readonly speciesLabel: Label;
  private readonly petLetter: Label;
  private readonly petGraphics: Graphics;
  private readonly equippedLabel: Label;
  private readonly hintLabel: Label;
  private readonly dailyLabel: Label;
  private readonly collectionLabel: Label;
  private readonly hungerBar: UiBar;
  private readonly hygieneBar: UiBar;
  private readonly happinessBar: UiBar;
  private readonly energyBar: UiBar;
  private readonly feedBtn: UiButton;
  private readonly playBtn: UiButton;
  private readonly restBtn: UiButton;

  constructor(
    private readonly root: Node,
    private readonly nav: AppNav,
  ) {
    createLabel(root, 'Title', 'Pet Haven', {
      x: 0,
      y: 580,
      width: 280,
      height: 48,
      fontSize: 32,
      bold: true,
    });
    this.coinLabel = createLabel(root, 'Coins', '', {
      x: -240,
      y: 580,
      width: 180,
      height: 40,
      fontSize: 22,
      bold: true,
      hAlign: HorizontalTextAlignment.LEFT,
    });
    this.affectionLabel = createLabel(root, 'Affection', '', {
      x: 240,
      y: 580,
      width: 180,
      height: 40,
      fontSize: 22,
      bold: true,
      hAlign: HorizontalTextAlignment.RIGHT,
    });

    const petNode = createNode(root, 'Pet', 0, 250, 260, 260);
    this.petGraphics = petNode.addComponent(Graphics);
    paintCircle(this.petGraphics, 120, COLORS.dog);
    this.petLetter = createLabel(petNode, 'Letter', '', {
      x: 0,
      y: 8,
      width: 200,
      height: 80,
      fontSize: 64,
      bold: true,
    });
    petNode.on(NodeEventType.TOUCH_END, () => this.nav.openPetSelect(false));

    this.nameLabel = createLabel(root, 'PetName', 'Choose a pet', {
      x: 0,
      y: 108,
      width: 400,
      height: 40,
      fontSize: 30,
      bold: true,
    });
    this.speciesLabel = createLabel(root, 'Species', 'Tap the pet to switch', {
      x: 0,
      y: 72,
      width: 480,
      height: 32,
      fontSize: 18,
      color: COLORS.muted,
    });
    this.equippedLabel = createLabel(root, 'Equipped', '', {
      x: 0,
      y: 40,
      width: 640,
      height: 28,
      fontSize: 16,
      color: COLORS.muted,
    });

    const stats = createPanel(root, 'Stats', 0, -130, 660, 220);
    this.hungerBar = new UiBar(stats, 'Hunger', 0, 70, 600, 28, COLORS.barHunger);
    this.hygieneBar = new UiBar(stats, 'Hygiene', 0, 28, 600, 28, COLORS.barHygiene);
    this.happinessBar = new UiBar(stats, 'Happy', 0, -14, 600, 28, COLORS.barHappiness);
    this.energyBar = new UiBar(stats, 'Energy', 0, -56, 600, 28, COLORS.barEnergy);
    this.hintLabel = createLabel(stats, 'Hint', '', {
      x: 0,
      y: -92,
      width: 620,
      height: 28,
      fontSize: 18,
      color: COLORS.accent,
    });

    const daily = createPanel(root, 'Daily', 0, -318, 660, 128, COLORS.panelAlt);
    this.dailyLabel = createLabel(daily, 'DailyText', '', {
      x: 0,
      y: 12,
      width: 620,
      height: 88,
      fontSize: 16,
      color: COLORS.muted,
      vAlign: VerticalTextAlignment.TOP,
      hAlign: HorizontalTextAlignment.LEFT,
    });
    this.collectionLabel = createLabel(daily, 'Collection', '', {
      x: 0,
      y: -36,
      width: 620,
      height: 28,
      fontSize: 16,
      color: COLORS.muted,
      hAlign: HorizontalTextAlignment.LEFT,
    });

    this.feedBtn = new UiButton(root, 'Feed', 'Feed', -216, -430, 200, 76, COLORS.feed, () => {
      if (!this.ensurePet()) {
        return;
      }
      if (!gameState.hasAnyFood()) {
        this.nav.toast('No food left. Come back later.');
        return;
      }
      this.nav.openFeed();
    });
    new UiButton(root, 'Clean', 'Clean', 0, -430, 200, 76, COLORS.clean, () => {
      if (this.ensurePet()) {
        this.nav.openClean();
      }
    });
    this.playBtn = new UiButton(root, 'Play', 'Play', 216, -430, 200, 76, COLORS.play, () => {
      if (!this.ensurePet()) {
        return;
      }
      if (!gameState.canPlay()) {
        this.nav.toast(gameState.playBlockReason());
        return;
      }
      this.nav.openPlay();
    });
    this.restBtn = new UiButton(root, 'Rest', 'Rest', -216, -530, 200, 76, COLORS.rest, () => {
      this.rest();
    });
    new UiButton(root, 'Style', 'Style', 0, -530, 200, 76, COLORS.style, () => this.nav.openStyle());
    new UiButton(root, 'Room', 'Room', 216, -530, 200, 76, COLORS.room, () => this.nav.openRoom());

    this.refresh();
  }

  refresh(): void {
    const save = gameState.getSnapshot();
    const pet = gameState.getSelectedPet();
    const definition = pet ? getPet(pet.definitionId) : undefined;

    this.coinLabel.string = `${save.coins} c`;
    this.affectionLabel.string = pet ? `♥ ${pet.stats.affection}` : '♥ 0';
    this.collectionLabel.string = `Collection ${save.unlockedCollection.length} · food types ${FOODS.length}`;
    this.dailyLabel.string = formatDaily(save.dailyObjectives.progress, save.dailyObjectives.completed);

    if (!pet || !definition) {
      this.nameLabel.string = 'Choose a pet';
      this.speciesLabel.string = 'Tap the circle to pick Mochi or Miso';
      this.equippedLabel.string = '';
      this.hintLabel.string = 'A cozy friend is waiting.';
      this.petLetter.string = '?';
      paintCircle(this.petGraphics, 120, COLORS.panelAlt);
      this.setBars(null);
      this.feedBtn.setEnabled(false);
      this.playBtn.setEnabled(false);
      this.restBtn.setEnabled(false);
      return;
    }

    this.nameLabel.string = definition.displayName;
    this.speciesLabel.string = `${definition.species} · ${definition.personality}`;
    this.petLetter.string = definition.displayName.slice(0, 1);
    paintCircle(this.petGraphics, 120, definition.species === 'cat' ? COLORS.cat : COLORS.dog);
    this.equippedLabel.string = formatEquipped(pet);
    this.hintLabel.string = careHint(definition.displayName, pet.stats);
    this.setBars(pet);
    this.feedBtn.setEnabled(gameState.hasAnyFood());
    this.playBtn.setEnabled(gameState.canPlay());
    this.restBtn.setEnabled(gameState.canRest());
    this.restBtn.setLabel(gameState.canRest() ? 'Rest' : `Rested (${REST_ENERGY_BLOCK_AT}+)`);
  }

  private setBars(pet: PetState | null): void {
    const stats = pet?.stats;
    this.hungerBar.setValue(stats?.hunger ?? 0, 'Hunger');
    this.hygieneBar.setValue(stats?.hygiene ?? 0, 'Hygiene');
    this.happinessBar.setValue(stats?.happiness ?? 0, 'Happy');
    this.energyBar.setValue(stats?.energy ?? 0, 'Energy');
  }

  private rest(): void {
    if (!this.ensurePet()) {
      return;
    }
    if (!gameState.canRest()) {
      this.nav.toast(gameState.restBlockReason());
      return;
    }
    const result = gameState.rest();
    this.nav.toast(result.message);
    this.refresh();
  }

  private ensurePet(): boolean {
    if (gameState.getSelectedPet()) {
      return true;
    }
    this.nav.openPetSelect(true);
    return false;
  }
}

function formatEquipped(pet: PetState): string {
  const parts: string[] = [];
  for (const slot of ['head', 'neck', 'body'] as const) {
    const id = pet.equipped[slot];
    if (!id) {
      continue;
    }
    parts.push(getCosmetic(id)?.displayName ?? id);
  }
  return parts.length > 0 ? parts.join(' · ') : 'No accessories yet';
}

function formatDaily(progress: Record<string, number>, completed: string[]): string {
  return DAILY_OBJECTIVES.map((objective) => {
    const current = Math.min(progress[objective.id] ?? 0, objective.target);
    const mark = completed.includes(objective.id) ? '✓' : '·';
    return `${mark} ${objective.description} (${current}/${objective.target})`;
  })    .join('\n');
}
