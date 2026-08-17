import { Color, HorizontalTextAlignment, Label, Node } from 'cc';
import { FURNITURE, getFurniture } from '../data/catalog';
import { evaluatePlacement } from '../domain/room';
import { ROOM_ANCHORS, type FurnitureDefinition, type RoomAnchor } from '../domain/types';
import { gameState } from '../services/GameStateService';
import type { AppNav } from './nav';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH, NAV_BUTTON_Y } from './theme';
import { createDim, createLabel, createNode, createPanel, UiButton } from './uiKit';

const ANCHOR_LAYOUT: Record<RoomAnchor, { x: number; y: number }> = {
  left: { x: -210, y: 300 },
  center: { x: 0, y: 300 },
  right: { x: 210, y: 300 },
  floor: { x: 0, y: 160 },
};

export class RoomOverlay {
  private selected: RoomAnchor = 'floor';
  private readonly listRoot: Node;
  private readonly hintLabel: Label;
  private readonly coinLabel: Label;
  private readonly anchorButtons: Partial<Record<RoomAnchor, UiButton>> = {};

  constructor(
    parent: Node,
    private readonly nav: AppNav,
  ) {
    createDim(parent, DESIGN_WIDTH, DESIGN_HEIGHT);
    createPanel(parent, 'Sheet', 0, 0, 680, 1120, COLORS.panel, 28);
    createLabel(parent, 'Title', 'Room', {
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
    this.hintLabel = createLabel(parent, 'Hint', '', {
      x: 0,
      y: 450,
      width: 620,
      height: 36,
      fontSize: 16,
      color: COLORS.muted,
    });

    for (const anchor of ROOM_ANCHORS) {
      const pos = ANCHOR_LAYOUT[anchor];
      this.anchorButtons[anchor] = new UiButton(
        parent,
        `Anchor-${anchor}`,
        anchor,
        pos.x,
        pos.y,
        anchor === 'floor' ? 420 : 190,
        88,
        COLORS.panelAlt,
        () => {
          this.selected = anchor;
          this.render();
        },
        16,
        true,
      );
    }

    this.listRoot = createNode(parent, 'List', 0, -140, 640, 430);
    new UiButton(parent, 'Clear', 'Clear anchor', 0, -430, 280, 56, COLORS.danger, () => {
      const result = gameState.placeFurniture(this.selected, null);
      this.nav.toast(result.message);
      this.render();
    }, 18);
    new UiButton(parent, 'Home', 'Home', -140, NAV_BUTTON_Y, 220, 64, COLORS.panelAlt, () => this.nav.home());
    new UiButton(parent, 'Back', 'Back', 140, NAV_BUTTON_Y, 220, 64, COLORS.panelAlt, () => this.nav.back());
    this.render();
  }

  private render(): void {
    const save = gameState.getSnapshot();
    this.coinLabel.string = `${save.coins} c`;
    this.hintLabel.string = `Selected ${this.selected}. Tap furniture to place, or buy locked items.`;

    for (const anchor of ROOM_ANCHORS) {
      const placedId = save.room.placements[anchor];
      const name = placedId ? getFurniture(placedId)?.displayName ?? placedId : 'empty';
      const button = this.anchorButtons[anchor];
      button?.setLabel(`${anchor}\n${name}`);
      button?.setColor(anchor === this.selected ? COLORS.room : COLORS.panelAlt);
    }

    for (const child of [...this.listRoot.children]) {
      child.destroy();
    }

    if (FURNITURE.length === 0) {
      createLabel(this.listRoot, 'Empty', 'No furniture in the catalog.', {
        x: 0,
        y: 0,
        width: 560,
        height: 80,
        fontSize: 20,
        color: COLORS.muted,
      });
      return;
    }

    FURNITURE.forEach((item, index) => {
      this.drawRow(item, index, save.coins, save.inventory.furniture, save.room.placements);
    });
  }

  private drawRow(
    item: FurnitureDefinition,
    index: number,
    coins: number,
    ownedIds: string[],
    placements: Partial<Record<RoomAnchor, string>>,
  ): void {
    const y = 168 - index * 68;
    const panel = createPanel(this.listRoot, item.id, 0, y, 620, 62, COLORS.panelAlt, 14);
    const owned = ownedIds.includes(item.id);
    const placedOn = ROOM_ANCHORS.find((anchor) => placements[anchor] === item.id);
    const check = evaluatePlacement(item, this.selected);
    const seasonal = item.seasonalPackId ? ' · seasonal' : '';
    createLabel(panel, 'Name', item.displayName, {
      x: -90,
      y: 10,
      width: 340,
      height: 24,
      fontSize: 17,
      bold: true,
      hAlign: HorizontalTextAlignment.LEFT,
    });
    createLabel(panel, 'Meta', `${item.allowedAnchors.join(', ')}${seasonal}${placedOn ? ` · on ${placedOn}` : ''}`, {
      x: -90,
      y: -14,
      width: 340,
      height: 20,
      fontSize: 13,
      color: COLORS.muted,
      hAlign: HorizontalTextAlignment.LEFT,
    });

    const action = this.rowAction(item, owned, placedOn, check.ok, check.reason, coins);
    new UiButton(panel, 'Action', action.label, 210, 0, 150, 44, action.color, () => {
      this.nav.toast(action.run());
      this.render();
    }, 15).setEnabled(action.enabled);
  }

  private rowAction(
    item: FurnitureDefinition,
    owned: boolean,
    placedOn: RoomAnchor | undefined,
    fits: boolean,
    reason: string,
    coins: number,
  ): { label: string; color: Color; enabled: boolean; run: () => string } {
    if (owned && placedOn === this.selected) {
      return {
        label: 'Clear',
        color: COLORS.danger,
        enabled: true,
        run: () => gameState.placeFurniture(this.selected, null).message,
      };
    }
    if (owned && fits) {
      return {
        label: placedOn ? 'Move' : 'Place',
        color: COLORS.room,
        enabled: true,
        run: () => gameState.placeFurniture(this.selected, item.id).message,
      };
    }
    if (owned && !fits) {
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
        run: () => gameState.buyFurniture(item.id).message,
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
