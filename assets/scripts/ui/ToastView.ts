import { BlockInputEvents, HorizontalTextAlignment, Label, Node, Overflow, VerticalTextAlignment } from 'cc';
import type { Component } from 'cc';
import { COLORS, TOAST_HEIGHT, TOAST_WIDTH, TOAST_Y } from './theme';
import { createLabel, createPanel } from './uiKit';

export class ToastView {
  private readonly label: Label;
  private readonly panel: Node;
  private readonly clear = (): void => {
    this.panel.active = false;
  };

  constructor(
    parent: Node,
    private readonly host: Component,
  ) {
    this.panel = createPanel(parent, 'Toast', 0, TOAST_Y, TOAST_WIDTH, TOAST_HEIGHT, COLORS.panelAlt, 18);
    this.panel.addComponent(BlockInputEvents);
    this.panel.active = false;
    this.label = createLabel(this.panel, 'Text', '', {
      x: 0,
      y: 0,
      width: TOAST_WIDTH - 40,
      height: TOAST_HEIGHT - 8,
      fontSize: 18,
      wrap: true,
      hAlign: HorizontalTextAlignment.CENTER,
      vAlign: VerticalTextAlignment.CENTER,
    });
    this.label.overflow = Overflow.SHRINK;
    this.label.lineHeight = 22;
  }

  show(message: string): void {
    this.label.string = message;
    this.panel.active = true;
    this.panel.setSiblingIndex(this.panel.parent ? this.panel.parent.children.length - 1 : 0);
    this.host.unschedule(this.clear);
    this.host.scheduleOnce(this.clear, 2.4);
  }
}
