import { HorizontalTextAlignment, Label, Node, Overflow, VerticalTextAlignment } from 'cc';
import type { Component } from 'cc';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from './theme';
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
    this.panel = createPanel(parent, 'Toast', 0, 430, 640, 88, COLORS.panelAlt, 22);
    this.panel.active = false;
    this.label = createLabel(this.panel, 'Text', '', {
      x: 0,
      y: 0,
      width: 600,
      height: 80,
      fontSize: 22,
      wrap: true,
      hAlign: HorizontalTextAlignment.CENTER,
      vAlign: VerticalTextAlignment.CENTER,
    });
    this.label.overflow = Overflow.SHRINK;
  }

  show(message: string): void {
    this.label.string = message;
    this.panel.active = true;
    this.panel.setSiblingIndex(this.panel.parent ? this.panel.parent.children.length - 1 : 0);
    this.host.unschedule(this.clear);
    this.host.scheduleOnce(this.clear, 2.4);
  }
}

export { DESIGN_HEIGHT, DESIGN_WIDTH };
