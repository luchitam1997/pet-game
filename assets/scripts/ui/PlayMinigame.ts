import { _decorator, Component, Graphics, Label, Node, NodeEventType } from 'cc';
import { ACTIVITY_PLAY_ID } from '../data/activities';
import { getActivity, getPet } from '../data/catalog';
import { playDurationSeconds, playPrompt, playTargetLabel, playTitle, POINTS_PER_CATCH } from '../minigames/catchToy';
import type { Species } from '../domain/types';
import { gameState } from '../services/GameStateService';
import type { AppNav } from './nav';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH, NAV_BUTTON_Y } from './theme';
import { createDim, createLabel, createNode, createPanel, paintCircle, UiButton } from './uiKit';

const { ccclass } = _decorator;

const ARENA = { x: 244, y: 176 };

@ccclass('PlayMinigame')
export class PlayMinigame extends Component {
  private nav: AppNav | null = null;
  private remaining = 30;
  private score = 0;
  private finished = false;
  private species: Species = 'dog';
  private timerLabel: Label | null = null;
  private scoreLabel: Label | null = null;
  private promptLabel: Label | null = null;
  private target: Node | null = null;
  private targetGraphics: Graphics | null = null;
  private targetLabel: Label | null = null;

  bind(nav: AppNav): void {
    this.nav = nav;
  }

  start(): void {
    const pet = gameState.getSelectedPet();
    const definition = pet ? getPet(pet.definitionId) : undefined;
    this.species = definition?.species ?? 'dog';
    const activity = getActivity(ACTIVITY_PLAY_ID);
    this.remaining = playDurationSeconds(activity?.durationSeconds);

    createDim(this.node, DESIGN_WIDTH, DESIGN_HEIGHT);
    createPanel(this.node, 'Sheet', 0, 0, 680, 1120, COLORS.panel, 28);
    createLabel(this.node, 'Title', playTitle(this.species), {
      x: 0,
      y: 500,
      width: 600,
      height: 48,
      fontSize: 30,
      bold: true,
    });
    this.promptLabel = createLabel(this.node, 'Prompt', playPrompt(this.species), {
      x: 0,
      y: 450,
      width: 600,
      height: 36,
      fontSize: 20,
      color: COLORS.muted,
    });
    this.timerLabel = createLabel(this.node, 'Timer', '', {
      x: -180,
      y: 390,
      width: 240,
      height: 36,
      fontSize: 22,
      bold: true,
    });
    this.scoreLabel = createLabel(this.node, 'Score', '', {
      x: 180,
      y: 390,
      width: 240,
      height: 36,
      fontSize: 22,
      bold: true,
    });

    const arena = createPanel(this.node, 'Arena', 0, 40, 600, 480, COLORS.panelAlt, 24);
    arena.on(NodeEventType.TOUCH_END, () => undefined);
    this.target = createNode(arena, 'Target', 0, 0, 96, 96);
    this.targetGraphics = this.target.addComponent(Graphics);
    paintCircle(this.targetGraphics, 44, this.species === 'cat' ? COLORS.play : COLORS.feed);
    this.targetLabel = createLabel(this.target, 'Mark', playTargetLabel(this.species), {
      x: 0,
      y: 0,
      width: 80,
      height: 80,
      fontSize: 36,
      bold: true,
    });
    this.target.on(NodeEventType.TOUCH_END, this.onCatch, this);

    new UiButton(this.node, 'Home', 'Home', -140, NAV_BUTTON_Y, 220, 68, COLORS.panelAlt, () => this.nav?.home());
    new UiButton(this.node, 'Back', 'Back', 140, NAV_BUTTON_Y, 220, 68, COLORS.panelAlt, () => this.nav?.back());
    this.moveTarget();
    this.renderHud();
  }

  update(dt: number): void {
    if (this.finished) {
      return;
    }
    this.remaining -= dt;
    if (this.remaining <= 0) {
      this.finish();
      return;
    }
    this.renderHud();
  }

  private onCatch(): void {
    if (this.finished) {
      return;
    }
    this.score += POINTS_PER_CATCH;
    this.moveTarget();
    this.renderHud();
  }

  private moveTarget(): void {
    if (!this.target) {
      return;
    }
    const x = (Math.random() * 2 - 1) * ARENA.x;
    const y = (Math.random() * 2 - 1) * ARENA.y;
    this.target.setPosition(x, y, 0);
  }

  private renderHud(): void {
    if (this.timerLabel) {
      this.timerLabel.string = `${Math.max(0, Math.ceil(this.remaining))}s`;
    }
    if (this.scoreLabel) {
      this.scoreLabel.string = `Score ${this.score}`;
    }
  }

  private finish(): void {
    if (this.finished) {
      return;
    }
    this.finished = true;
    this.remaining = 0;
    if (this.target) {
      this.target.active = false;
    }
    if (this.promptLabel) {
      this.promptLabel.string = 'Nice play!';
    }
    const result = gameState.completePlay(this.score);
    this.nav?.toast(result.message);
    this.scheduleOnce(() => this.nav?.home(), 0.6);
  }
}
