import { _decorator, Component, Node, ResolutionPolicy, view } from 'cc';
import { gameEvents } from '../events/EventBus';
import { gameState } from '../services/GameStateService';
import { CleanMinigame } from './CleanMinigame';
import { ComingSoonOverlay } from './ComingSoonOverlay';
import { FeedOverlay } from './FeedOverlay';
import { HubScreen } from './HubScreen';
import type { AppNav } from './nav';
import { PetSelectScreen } from './PetSelectScreen';
import { PlayMinigame } from './PlayMinigame';
import { DESIGN_HEIGHT, DESIGN_WIDTH } from './theme';
import { ToastView } from './ToastView';
import { createNode } from './uiKit';

const { ccclass } = _decorator;

@ccclass('GameBootstrap')
export class GameBootstrap extends Component implements AppNav {
  private hub: HubScreen | null = null;
  private overlayRoot: Node | null = null;
  private toastView: ToastView | null = null;
  private unsubscribers: Array<() => void> = [];

  start(): void {
    view.setDesignResolutionSize(DESIGN_WIDTH, DESIGN_HEIGHT, ResolutionPolicy.FIXED_WIDTH);
    gameState.boot();

    const hubNode = createNode(this.node, 'Hub', 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    this.hub = new HubScreen(hubNode, this);
    this.overlayRoot = createNode(this.node, 'Overlays', 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    this.toastView = new ToastView(this.node, this);

    this.unsubscribers = [
      gameEvents.on('pet:updated', () => this.hub?.refresh()),
      gameEvents.on('inventory:changed', () => this.hub?.refresh()),
      gameEvents.on('currency:changed', () => this.hub?.refresh()),
      gameEvents.on('room:changed', () => this.hub?.refresh()),
    ];

    if (!gameState.getSelectedPet()) {
      this.openPetSelect(true);
    }
  }

  onDestroy(): void {
    for (const unsubscribe of this.unsubscribers) {
      unsubscribe();
    }
    this.unsubscribers = [];
  }

  toast(message: string): void {
    this.toastView?.show(message);
  }

  home(): void {
    this.clearOverlay();
    this.hub?.refresh();
  }

  back(): void {
    this.clearOverlay();
    this.hub?.refresh();
  }

  openPetSelect(required = false): void {
    this.showOverlay((root) => new PetSelectScreen(root, this, required));
  }

  openFeed(): void {
    this.showOverlay((root) => new FeedOverlay(root, this));
  }

  openClean(): void {
    this.showOverlay((root) => {
      const minigame = root.addComponent(CleanMinigame);
      minigame.bind(this);
    });
  }

  openPlay(): void {
    this.showOverlay((root) => {
      const minigame = root.addComponent(PlayMinigame);
      minigame.bind(this);
    });
  }

  openStyle(): void {
    this.showOverlay((root) => new ComingSoonOverlay(root, this, 'Style'));
  }

  openRoom(): void {
    this.showOverlay((root) => new ComingSoonOverlay(root, this, 'Room'));
  }

  private showOverlay(build: (root: Node) => void): void {
    const root = this.clearOverlay();
    if (!root) {
      return;
    }
    build(root);
  }

  private clearOverlay(): Node | null {
    const root = this.overlayRoot;
    if (!root) {
      return null;
    }
    root.removeAllChildren();
    return root;
  }
}
