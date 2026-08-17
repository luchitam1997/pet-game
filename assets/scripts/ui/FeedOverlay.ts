import { HorizontalTextAlignment, Label, Node } from 'cc';
import { FOODS, getPet } from '../data/catalog';
import { computeFeedEffects } from '../domain/rewards';
import { gameState } from '../services/GameStateService';
import type { AppNav } from './nav';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from './theme';
import { createDim, createLabel, createPanel, UiButton } from './uiKit';

export class FeedOverlay {
  private readonly buttons: UiButton[] = [];
  private readonly qtyLabels: Label[] = [];

  constructor(
    parent: Node,
    private readonly nav: AppNav,
  ) {
    createDim(parent, DESIGN_WIDTH, DESIGN_HEIGHT);
    createPanel(parent, 'Sheet', 0, -40, 680, 980, COLORS.panel, 28);
    createLabel(parent, 'Title', 'Feed', {
      x: 0,
      y: 400,
      width: 400,
      height: 48,
      fontSize: 32,
      bold: true,
    });

    const pet = gameState.getSelectedPet();
    const definition = pet ? getPet(pet.definitionId) : undefined;
    createLabel(parent, 'Hint', definition ? `What should ${definition.displayName} eat?` : 'Choose a pet first.', {
      x: 0,
      y: 350,
      width: 600,
      height: 36,
      fontSize: 18,
      color: COLORS.muted,
    });

    FOODS.forEach((food, index) => {
      const y = 200 - index * 180;
      const panel = createPanel(parent, food.id, 0, y, 600, 160, COLORS.panelAlt);
      const effects = definition ? computeFeedEffects(definition, food) : null;
      const badge =
        effects?.preference === 'favorite'
          ? 'Favorite'
          : effects?.preference === 'disliked'
            ? 'Not a favorite'
            : 'Okay';
      createLabel(panel, 'Name', food.displayName, {
        x: -10,
        y: 42,
        width: 540,
        height: 36,
        fontSize: 24,
        bold: true,
        hAlign: HorizontalTextAlignment.LEFT,
      });
      createLabel(panel, 'Meta', `${badge} · +${effects?.stats.hunger ?? food.hungerRestore} hunger`, {
        x: -10,
        y: 8,
        width: 540,
        height: 28,
        fontSize: 16,
        color: COLORS.accent,
        hAlign: HorizontalTextAlignment.LEFT,
      });
      const qty = createLabel(panel, 'Qty', '', {
        x: -10,
        y: -28,
        width: 240,
        height: 28,
        fontSize: 18,
        color: COLORS.muted,
        hAlign: HorizontalTextAlignment.LEFT,
      });
      this.qtyLabels.push(qty);
      const button = new UiButton(panel, 'Give', 'Give', 180, -28, 180, 56, COLORS.feed, () => {
        this.feed(food.id);
      });
      this.buttons.push(button);
    });

    new UiButton(parent, 'Home', 'Home', -140, -520, 220, 68, COLORS.panelAlt, () => this.nav.home());
    new UiButton(parent, 'Back', 'Back', 140, -520, 220, 68, COLORS.panelAlt, () => this.nav.back());
    this.refresh();
  }

  private feed(foodId: string): void {
    const result = gameState.feed(foodId);
    this.nav.toast(result.message);
    this.refresh();
  }

  private refresh(): void {
    const save = gameState.getSnapshot();
    for (let index = 0; index < FOODS.length; index += 1) {
      const food = FOODS[index];
      const qtyLabel = this.qtyLabels[index];
      const button = this.buttons[index];
      if (!food || !qtyLabel || !button) {
        continue;
      }
      const qty = save.inventory.food[food.id] ?? 0;
      qtyLabel.string = qty > 0 ? `${qty} left` : 'None left';
      button.setEnabled(qty > 0);
      button.setLabel(qty > 0 ? 'Give' : 'Empty');
    }
  }
}
