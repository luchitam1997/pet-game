import { _decorator, Component, Graphics, Label, Node } from 'cc';
import { BATH_STEPS } from '../minigames/bathSteps';
import { getPet } from '../data/catalog';
import { gameState } from '../services/GameStateService';
import type { AppNav } from './nav';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH, NAV_BUTTON_Y } from './theme';
import { createDim, createLabel, createNode, createPanel, paintCircle, UiBar, UiButton } from './uiKit';

const { ccclass } = _decorator;

@ccclass('CleanMinigame')
export class CleanMinigame extends Component {
  private nav: AppNav | null = null;
  private stepIndex = 0;
  private tapsInStep = 0;
  private titleLabel: Label | null = null;
  private instructionLabel: Label | null = null;
  private actionBtn: UiButton | null = null;
  private progress: UiBar | null = null;
  private petGraphics: Graphics | null = null;

  bind(nav: AppNav): void {
    this.nav = nav;
  }

  start(): void {
    createDim(this.node, DESIGN_WIDTH, DESIGN_HEIGHT);
    createPanel(this.node, 'Sheet', 0, 0, 680, 1120, COLORS.panel, 28);
    this.titleLabel = createLabel(this.node, 'Title', '', {
      x: 0,
      y: 500,
      width: 560,
      height: 48,
      fontSize: 30,
      bold: true,
    });
    this.instructionLabel = createLabel(this.node, 'Instruction', '', {
      x: 0,
      y: 440,
      width: 600,
      height: 48,
      fontSize: 20,
      color: COLORS.muted,
    });

    const petNode = createNode(this.node, 'Pet', 0, 160, 220, 220);
    this.petGraphics = petNode.addComponent(Graphics);
    paintCircle(this.petGraphics, 100, COLORS.clean);
    const pet = gameState.getSelectedPet();
    const definition = pet ? getPet(pet.definitionId) : undefined;
    createLabel(petNode, 'Letter', definition?.displayName.slice(0, 1) ?? '?', {
      x: 0,
      y: 0,
      width: 160,
      height: 80,
      fontSize: 56,
      bold: true,
    });

    this.progress = new UiBar(this.node, 'Progress', 0, -80, 560, 28, COLORS.clean);
    this.actionBtn = new UiButton(this.node, 'Action', 'Start', 0, -220, 320, 80, COLORS.clean, () => {
      this.onAction();
    });
    new UiButton(this.node, 'Home', 'Home', -140, NAV_BUTTON_Y, 220, 68, COLORS.panelAlt, () => this.nav?.home());
    new UiButton(this.node, 'Back', 'Back', 140, NAV_BUTTON_Y, 220, 68, COLORS.panelAlt, () => this.nav?.back());
    this.renderStep();
  }

  private onAction(): void {
    const step = BATH_STEPS[this.stepIndex];
    if (!step) {
      return;
    }
    this.tapsInStep += 1;
    if (this.tapsInStep < step.tapsRequired) {
      this.renderStep();
      return;
    }
    this.stepIndex += 1;
    this.tapsInStep = 0;
    if (this.stepIndex >= BATH_STEPS.length) {
      this.finish();
      return;
    }
    this.renderStep();
  }

  private renderStep(): void {
    const step = BATH_STEPS[this.stepIndex];
    if (!step || !this.titleLabel || !this.instructionLabel || !this.actionBtn || !this.progress) {
      return;
    }
    const remaining = Math.max(0, step.tapsRequired - this.tapsInStep);
    this.titleLabel.string = `Bath · ${step.title}`;
    this.instructionLabel.string =
      remaining > 1 ? `${step.instruction} (${remaining} left)` : step.instruction;
    this.actionBtn.setLabel(step.actionLabel);
    const totalTaps = BATH_STEPS.reduce((sum, item) => sum + item.tapsRequired, 0);
    const doneTaps =
      BATH_STEPS.slice(0, this.stepIndex).reduce((sum, item) => sum + item.tapsRequired, 0) + this.tapsInStep;
    this.progress.setValue((doneTaps / totalTaps) * 100, 'Progress');
    if (this.petGraphics) {
      const colors = [COLORS.clean, COLORS.accent, COLORS.cat];
      paintCircle(this.petGraphics, 100, colors[this.stepIndex] ?? COLORS.good);
    }
  }

  private finish(): void {
    const result = gameState.completeClean();
    this.nav?.toast(result.message);
    this.nav?.home();
  }
}
