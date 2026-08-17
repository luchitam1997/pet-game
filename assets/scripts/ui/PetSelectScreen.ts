import { Node } from 'cc';
import { PETS } from '../data/catalog';
import { gameState } from '../services/GameStateService';
import type { AppNav } from './nav';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from './theme';
import { createDim, createLabel, createPanel, UiButton } from './uiKit';

export class PetSelectScreen {
  constructor(parent: Node, nav: AppNav, required: boolean) {
    createDim(parent, DESIGN_WIDTH, DESIGN_HEIGHT);
    createLabel(parent, 'Title', required ? 'Choose a friend' : 'Switch pet', {
      x: 0,
      y: 420,
      width: 600,
      height: 48,
      fontSize: 32,
      bold: true,
    });
    createLabel(parent, 'Subtitle', 'Each pet has different favorite food.', {
      x: 0,
      y: 370,
      width: 620,
      height: 40,
      fontSize: 18,
      color: COLORS.muted,
    });

    PETS.forEach((pet, index) => {
      const y = 140 - index * 230;
      const panel = createPanel(parent, pet.id, 0, y, 600, 200, COLORS.panel);
      createLabel(panel, 'Name', pet.displayName, {
        x: 0,
        y: 60,
        width: 560,
        height: 40,
        fontSize: 28,
        bold: true,
      });
      createLabel(panel, 'Bio', `${pet.species} · ${pet.personality}`, {
        x: 0,
        y: 18,
        width: 560,
        height: 36,
        fontSize: 18,
        color: COLORS.muted,
        wrap: true,
      });
      new UiButton(
        panel,
        'Pick',
        `Care for ${pet.displayName}`,
        0,
        -50,
        360,
        64,
        pet.species === 'cat' ? COLORS.cat : COLORS.dog,
        () => {
          const result = gameState.selectPet(pet.id);
          nav.toast(result.message);
          nav.home();
        },
      );
    });

    if (!required) {
      new UiButton(parent, 'Back', 'Back', 0, -520, 240, 68, COLORS.panelAlt, () => nav.back());
    }
  }
}
