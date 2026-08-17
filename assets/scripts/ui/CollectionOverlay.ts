import { HorizontalTextAlignment, Node, VerticalTextAlignment } from 'cc';
import { COSMETICS, FURNITURE } from '../data/catalog';
import { gameState } from '../services/GameStateService';
import type { AppNav } from './nav';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH, NAV_BUTTON_Y } from './theme';
import { createDim, createLabel, createPanel, UiButton } from './uiKit';

export class CollectionOverlay {
  constructor(parent: Node, nav: AppNav) {
    const save = gameState.getSnapshot();
    createDim(parent, DESIGN_WIDTH, DESIGN_HEIGHT);
    createPanel(parent, 'Sheet', 0, 0, 680, 1120, COLORS.panel, 28);
    createLabel(parent, 'Title', 'Collection', {
      x: 0,
      y: 500,
      width: 500,
      height: 44,
      fontSize: 32,
      bold: true,
    });
    createLabel(parent, 'Summary', `${save.unlockedCollection.length} unlocked · ${save.coins} coins`, {
      x: 0,
      y: 454,
      width: 600,
      height: 32,
      fontSize: 18,
      color: COLORS.muted,
    });

    createLabel(parent, 'CosTitle', 'Cosmetics', {
      x: 0,
      y: 400,
      width: 600,
      height: 28,
      fontSize: 20,
      bold: true,
      hAlign: HorizontalTextAlignment.LEFT,
    });
    const cosmeticLines = COSMETICS.map((item) => {
      const owned = save.inventory.cosmetics.includes(item.id);
      const seasonal = item.seasonalPackId ? ' (seasonal)' : '';
      return `${owned ? '✓' : '○'} ${item.displayName} · ${item.slot}${seasonal}`;
    }).join('\n');
    createLabel(parent, 'CosList', cosmeticLines.length > 0 ? cosmeticLines : 'No cosmetics in catalog.', {
      x: 0,
      y: 230,
      width: 620,
      height: 300,
      fontSize: 16,
      color: COLORS.muted,
      hAlign: HorizontalTextAlignment.LEFT,
      vAlign: VerticalTextAlignment.TOP,
    });

    createLabel(parent, 'FurTitle', 'Furniture', {
      x: 0,
      y: 40,
      width: 600,
      height: 28,
      fontSize: 20,
      bold: true,
      hAlign: HorizontalTextAlignment.LEFT,
    });
    const furnitureLines = FURNITURE.map((item) => {
      const owned = save.inventory.furniture.includes(item.id);
      const seasonal = item.seasonalPackId ? ' (seasonal)' : '';
      return `${owned ? '✓' : '○'} ${item.displayName}${seasonal}`;
    }).join('\n');
    createLabel(parent, 'FurList', furnitureLines.length > 0 ? furnitureLines : 'No furniture in catalog.', {
      x: 0,
      y: -140,
      width: 620,
      height: 280,
      fontSize: 16,
      color: COLORS.muted,
      hAlign: HorizontalTextAlignment.LEFT,
      vAlign: VerticalTextAlignment.TOP,
    });

    new UiButton(parent, 'Home', 'Home', -140, NAV_BUTTON_Y, 220, 64, COLORS.panelAlt, () => nav.home());
    new UiButton(parent, 'Back', 'Back', 140, NAV_BUTTON_Y, 220, 64, COLORS.panelAlt, () => nav.back());
  }
}
