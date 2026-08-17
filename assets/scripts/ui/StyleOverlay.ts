import { Color, Graphics, Label, Node } from 'cc';
import { COSMETICS, getPet } from '../data/catalog';
import { evaluateEquip } from '../domain/equipment';
import type { CosmeticDefinition, CosmeticSlot, PetDefinition, PetState } from '../domain/types';
import { gameState } from '../services/GameStateService';
import type { AppNav } from './nav';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from './theme';
import { createDim, createLabel, createNode, createPanel, paintCircle, UiButton } from './uiKit';

const MVP_SLOTS: CosmeticSlot[] = ['head', 'neck', 'body'];
type StyleFilter = CosmeticSlot | 'all';

export class StyleOverlay {
  private filter: StyleFilter = 'head';
  private readonly listRoot: Node;
  private readonly previewLetter: Label;
  private readonly previewSlots: Label;
  private readonly emptyLabel: Label;
  private readonly coinLabel: Label;
  private readonly petGraphics: Graphics;
  private readonly filterButtons: Partial<Record<StyleFilter, UiButton>> = {};

  constructor(
    parent: Node,
    private readonly nav: AppNav,
  ) {
    createDim(parent, DESIGN_WIDTH, DESIGN_HEIGHT);
    createPanel(parent, 'Sheet', 0, 0, 680, 1120, COLORS.panel, 28);
    createLabel(parent, 'Title', 'Style', {
      x: 0,
      y: 500,
      width: 400,
      height: 44,
      fontSize: 32,
      bold: true,
    });
    this.coinLabel = createLabel(parent, 'Coins', '', {
      x: 240,
      y: 500,
      width: 160,
      height: 36,
      fontSize: 20,
      bold: true,
    });

    const petNode = createNode(parent, 'Preview', 0, 360, 160, 160);
    this.petGraphics = petNode.addComponent(Graphics);
    paintCircle(this.petGraphics, 70, COLORS.style);
    this.previewLetter = createLabel(petNode, 'Letter', '', {
      x: 0,
      y: 0,
      width: 120,
      height: 60,
      fontSize: 40,
      bold: true,
    });
    this.previewSlots = createLabel(parent, 'Slots', '', {
      x: 0,
      y: 270,
      width: 620,
      height: 40,
      fontSize: 16,
      color: COLORS.muted,
    });

    const filters: StyleFilter[] = ['head', 'neck', 'body', 'all'];
    filters.forEach((slot, index) => {
      const x = -225 + index * 150;
      this.filterButtons[slot] = new UiButton(
        parent,
        `Filter-${slot}`,
        slot === 'all' ? 'All' : slot,
        x,
        210,
        136,
        52,
        COLORS.panelAlt,
        () => this.setFilter(slot),
        18,
      );
    });

    this.listRoot = createNode(parent, 'List', 0, -80, 640, 500);
    this.emptyLabel = createLabel(this.listRoot, 'Empty', 'No cosmetics in this slot yet.', {
      x: 0,
      y: 0,
      width: 560,
      height: 80,
      fontSize: 20,
      color: COLORS.muted,
    });
    this.emptyLabel.node.active = false;

    new UiButton(parent, 'Home', 'Home', -140, -520, 220, 64, COLORS.panelAlt, () => this.nav.home());
    new UiButton(parent, 'Back', 'Back', 140, -520, 220, 64, COLORS.panelAlt, () => this.nav.back());

    this.render();
  }

  private setFilter(filter: StyleFilter): void {
    this.filter = filter;
    this.render();
  }

  private render(): void {
    const save = gameState.getSnapshot();
    const pet = gameState.getSelectedPet();
    const definition = pet ? getPet(pet.definitionId) : undefined;
    this.coinLabel.string = `${save.coins} c`;

    if (!pet || !definition) {
      this.nav.toast('Choose a pet first.');
      this.nav.back();
      return;
    }

    this.previewLetter.string = definition.displayName.slice(0, 1);
    paintCircle(this.petGraphics, 70, definition.species === 'cat' ? COLORS.cat : COLORS.dog);
    this.previewSlots.string = previewSlots(pet);
    this.highlightFilters();

    for (const child of [...this.listRoot.children]) {
      if (child.name !== 'Empty') {
        child.destroy();
      }
    }

    const items = COSMETICS.filter((item) => (this.filter === 'all' ? true : item.slot === this.filter));
    this.emptyLabel.node.active = items.length === 0;
    items.forEach((item, index) => this.drawRow(item, index, pet, definition, save.coins, save.inventory.cosmetics));
  }

  private highlightFilters(): void {
    const filters: StyleFilter[] = ['head', 'neck', 'body', 'all'];
    for (const slot of filters) {
      this.filterButtons[slot]?.setColor(slot === this.filter ? COLORS.style : COLORS.panelAlt);
    }
  }

  private drawRow(
    item: CosmeticDefinition,
    index: number,
    pet: PetState,
    definition: PetDefinition,
    coins: number,
    ownedIds: string[],
  ): void {
    const y = this.filter === 'all' ? 180 - Math.floor(index / 2) * 118 : 190 - index * 118;
    const x = this.filter === 'all' ? (index % 2 === 0 ? -155 : 155) : 0;
    const width = this.filter === 'all' ? 300 : 620;
    const panel = createPanel(this.listRoot, item.id, x, y, width, 108, COLORS.panelAlt, 16);
    const owned = ownedIds.includes(item.id);
    const equipped = pet.equipped[item.slot] === item.id;
    const check = evaluateEquip(item, definition, item.slot);
    const seasonal = item.seasonalPackId ? ' · seasonal' : '';
    createLabel(panel, 'Name', item.displayName, {
      x: -10,
      y: 28,
      width: width - 40,
      height: 28,
      fontSize: 18,
      bold: true,
    });
    createLabel(panel, 'Meta', `${item.slot} · ${item.species.join('/')}${seasonal}`, {
      x: -10,
      y: 4,
      width: width - 40,
      height: 22,
      fontSize: 14,
      color: COLORS.muted,
    });

    const action = this.rowAction(item, owned, equipped, check.ok, check.reason, coins);
    new UiButton(panel, 'Action', action.label, width / 2 - 80, -28, 140, 44, action.color, () => {
      this.nav.toast(action.run());
      this.render();
    }, 16).setEnabled(action.enabled);
  }

  private rowAction(
    item: CosmeticDefinition,
    owned: boolean,
    equipped: boolean,
    compatible: boolean,
    reason: string,
    coins: number,
  ): { label: string; color: Color; enabled: boolean; run: () => string } {
    if (equipped) {
      return {
        label: 'Unequip',
        color: COLORS.panel,
        enabled: true,
        run: () => gameState.unequip(item.slot).message,
      };
    }
    if (owned && compatible) {
      return {
        label: 'Equip',
        color: COLORS.style,
        enabled: true,
        run: () => gameState.equip(item.slot, item.id).message,
      };
    }
    if (owned && !compatible) {
      return {
        label: "Won't fit",
        color: COLORS.danger,
        enabled: true,
        run: () => reason,
      };
    }
    const price = item.priceCoins;
    if (price !== undefined && coins >= price) {
      return {
        label: `Buy ${price}`,
        color: COLORS.accent,
        enabled: true,
        run: () => gameState.buyCosmetic(item.id).message,
      };
    }
    if (price !== undefined) {
      return {
        label: `Need ${price}`,
        color: COLORS.panel,
        enabled: true,
        run: () => `Need ${price} coins for ${item.displayName}.`,
      };
    }
    return {
      label: 'Locked',
      color: COLORS.panel,
      enabled: false,
      run: () => `${item.displayName} is locked.`,
    };
  }
}

function previewSlots(pet: PetState): string {
  return MVP_SLOTS.map((slot) => {
    const id = pet.equipped[slot];
    if (!id) {
      return `${slot}: empty`;
    }
    return `${slot}: ${id.replace('cos_', '').replace(/_/g, ' ')}`;
  }).join('  ·  ');
}
