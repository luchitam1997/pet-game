import { Node } from 'cc';
import type { AppNav } from './nav';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from './theme';
import { createDim, createLabel, createPanel, UiButton } from './uiKit';

export class ComingSoonOverlay {
  constructor(parent: Node, nav: AppNav, title: string) {
    createDim(parent, DESIGN_WIDTH, DESIGN_HEIGHT);
    createPanel(parent, 'Card', 0, 40, 620, 420, COLORS.panel, 28);
    createLabel(parent, 'Title', title, {
      x: 0,
      y: 160,
      width: 520,
      height: 48,
      fontSize: 32,
      bold: true,
    });
    createLabel(parent, 'Body', 'This screen opens in Phase 3.\nYour collection and room save already exist.', {
      x: 0,
      y: 40,
      width: 520,
      height: 120,
      fontSize: 20,
      color: COLORS.muted,
    });
    new UiButton(parent, 'Back', 'Back', 0, -80, 240, 68, COLORS.panelAlt, () => nav.back());
  }
}
