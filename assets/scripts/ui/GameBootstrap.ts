import {
  _decorator,
  Color,
  Component,
  Graphics,
  HorizontalTextAlignment,
  Label,
  Layers,
  Node,
  NodeEventType,
  Overflow,
  ResolutionPolicy,
  UITransform,
  VerticalTextAlignment,
  view,
} from 'cc';
import { COS_HOODIE_ID, COS_SAILOR_HAT_ID } from '../data/cosmetics';
import { getPet } from '../data/catalog';
import { FUR_COZY_BED_ID } from '../data/furniture';
import { PET_MISO_ID, PET_MOCHI_ID } from '../data/pets';
import type { ActionResult, GameSave } from '../domain/types';
import { gameEvents } from '../events/EventBus';
import { gameState } from '../services/GameStateService';

const { ccclass } = _decorator;

const DESIGN_WIDTH = 720;
const DESIGN_HEIGHT = 1280;

@ccclass('GameBootstrap')
export class GameBootstrap extends Component {
  private statusLabel: Label | null = null;
  private toastLabel: Label | null = null;
  private unsubscribers: Array<() => void> = [];

  start(): void {
    view.setDesignResolutionSize(DESIGN_WIDTH, DESIGN_HEIGHT, ResolutionPolicy.FIXED_WIDTH);
    gameState.boot();
    this.buildHud();
    this.unsubscribers = [
      gameEvents.on('pet:updated', () => this.refresh()),
      gameEvents.on('inventory:changed', () => this.refresh()),
      gameEvents.on('currency:changed', () => this.refresh()),
      gameEvents.on('room:changed', () => this.refresh()),
    ];
    this.refresh();
  }

  onDestroy(): void {
    for (const unsubscribe of this.unsubscribers) {
      unsubscribe();
    }
    this.unsubscribers = [];
  }

  private buildHud(): void {
    this.createLabel('Title', 'Pet Haven — Phase 1', 32, 0, 560, 680, 48, true);
    this.toastLabel = this.createLabel('Toast', 'Ready', 22, 0, 500, 680, 64, false);
    this.statusLabel = this.createLabel('Status', '', 22, 0, 40, 660, 760, false);

    this.createButton('MochiBtn', 'Mochi', -160, -430, 200, 64, new Color(90, 140, 90, 255), () => {
      this.applyResult(gameState.selectPet(PET_MOCHI_ID));
    });
    this.createButton('MisoBtn', 'Miso', 160, -430, 200, 64, new Color(90, 120, 160, 255), () => {
      this.applyResult(gameState.selectPet(PET_MISO_ID));
    });

    this.createButton('FeedBtn', 'Feed', -243, -540, 150, 72, new Color(196, 120, 72, 255), () => {
      const pet = gameState.getSelectedPet();
      const definition = pet ? getPet(pet.definitionId) : undefined;
      if (!definition) {
        this.showToast('Select a pet first.');
        return;
      }
      this.applyResult(gameState.feed(definition.favoriteFoodId));
    });
    this.createButton('EquipBtn', 'Equip', -81, -540, 150, 72, new Color(120, 92, 168, 255), () => {
      this.toggleSailorHat();
    });
    this.createButton('PlaceBtn', 'Place', 81, -540, 150, 72, new Color(72, 132, 148, 255), () => {
      this.toggleBed();
    });
    this.createButton('RestBtn', 'Rest', 243, -540, 150, 72, new Color(72, 112, 176, 255), () => {
      this.applyResult(gameState.rest());
    });

    this.createButton('HoodieBtn', 'Dog hoodie', 0, -620, 280, 56, new Color(80, 80, 96, 255), () => {
      this.applyResult(gameState.equip('body', COS_HOODIE_ID));
    });
  }

  private toggleSailorHat(): void {
    const pet = gameState.getSelectedPet();
    if (!pet) {
      this.showToast('Select a pet first.');
      return;
    }
    if (pet.equipped.head === COS_SAILOR_HAT_ID) {
      this.applyResult(gameState.unequip('head'));
      return;
    }
    this.applyResult(gameState.equip('head', COS_SAILOR_HAT_ID));
  }

  private toggleBed(): void {
    const snapshot = gameState.getSnapshot();
    if (snapshot.room.placements.floor === FUR_COZY_BED_ID) {
      this.applyResult(gameState.placeFurniture('floor', null));
      return;
    }
    this.applyResult(gameState.placeFurniture('floor', FUR_COZY_BED_ID));
  }

  private applyResult(result: ActionResult): void {
    this.showToast(result.message);
    this.refresh();
  }

  private refresh(): void {
    if (!this.statusLabel) {
      return;
    }
    this.statusLabel.string = formatSnapshot(gameState.getSnapshot());
  }

  private showToast(message: string): void {
    if (!this.toastLabel) {
      return;
    }
    this.toastLabel.string = message;
    this.unschedule(this.clearToast);
    this.scheduleOnce(this.clearToast, 2.5);
  }

  private clearToast = (): void => {
    if (this.toastLabel) {
      this.toastLabel.string = 'Saved to localStorage.';
    }
  };

  private createLabel(
    name: string,
    text: string,
    fontSize: number,
    x: number,
    y: number,
    width: number,
    height: number,
    bold: boolean,
  ): Label {
    const node = this.createUiNode(name, x, y, width, height);
    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 6;
    label.useSystemFont = true;
    label.isBold = bold;
    label.overflow = Overflow.CLAMP;
    label.enableWrapText = true;
    label.horizontalAlign = HorizontalTextAlignment.CENTER;
    label.verticalAlign = name === 'Status' ? VerticalTextAlignment.TOP : VerticalTextAlignment.CENTER;
    label.color = Color.WHITE;
    return label;
  }

  private createButton(
    name: string,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color: Color,
    onTap: () => void,
  ): void {
    const node = this.createUiNode(name, x, y, width, height);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = color;
    graphics.roundRect(-width / 2, -height / 2, width, height, 16);
    graphics.fill();

    const labelNode = new Node('Label');
    labelNode.layer = Layers.Enum.UI_2D;
    const labelTransform = labelNode.addComponent(UITransform);
    labelTransform.setContentSize(width, height);
    node.addChild(labelNode);
    const label = labelNode.addComponent(Label);
    label.string = text;
    label.fontSize = 24;
    label.useSystemFont = true;
    label.isBold = true;
    label.horizontalAlign = HorizontalTextAlignment.CENTER;
    label.verticalAlign = VerticalTextAlignment.CENTER;
    label.color = Color.WHITE;

    node.on(NodeEventType.TOUCH_END, onTap);
  }

  private createUiNode(name: string, x: number, y: number, width: number, height: number): Node {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    const transform = node.addComponent(UITransform);
    transform.setContentSize(width, height);
    node.setPosition(x, y, 0);
    this.node.addChild(node);
    return node;
  }
}

function formatSnapshot(save: GameSave): string {
  const pet = save.selectedPetId ? save.pets[save.selectedPetId] : undefined;
  const definition = pet ? getPet(pet.definitionId) : undefined;
  const stats = pet?.stats;
  const equipped = pet
    ? Object.entries(pet.equipped)
        .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
        .map(([slot, id]) => `${slot}=${id}`)
        .join(', ') || '(none)'
    : '(none)';
  const room =
    Object.entries(save.room.placements)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
      .map(([anchor, id]) => `${anchor}=${id}`)
      .join(', ') || '(empty)';
  const food = Object.entries(save.inventory.food)
    .map(([id, qty]) => `${id.replace('food_', '')} x${qty}`)
    .join(', ');
  const daily = formatDailySummary(save);

  return [
    `Coins: ${save.coins}`,
    `Pet: ${definition?.displayName ?? '—'} (${definition?.species ?? '—'})`,
    stats
      ? `Hunger ${stats.hunger}  Hygiene ${stats.hygiene}  Happiness ${stats.happiness}`
      : 'Stats: —',
    stats ? `Energy ${stats.energy}  Affection ${stats.affection}` : '',
    `Equipped: ${equipped}`,
    `Room: ${room}`,
    `Food: ${food}`,
    `Cosmetics owned: ${save.inventory.cosmetics.length}`,
    `Furniture owned: ${save.inventory.furniture.length}`,
    daily,
    '',
    'Reload the browser to confirm save/load.',
  ]
    .filter((line) => line.length > 0)
    .join('\n');
}

function formatDailySummary(save: GameSave): string {
  const { dateKey, progress, completed } = save.dailyObjectives;
  const done = completed.length;
  const feedProgress = progress.daily_feed ?? 0;
  return `Daily ${dateKey}: feed ${feedProgress}/2, done ${done}`;
}
