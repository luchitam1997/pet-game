import {
  BlockInputEvents,
  Color,
  Graphics,
  HorizontalTextAlignment,
  Label,
  Layers,
  Node,
  NodeEventType,
  Overflow,
  UIOpacity,
  UITransform,
  VerticalTextAlignment,
} from 'cc';
import { COLORS } from './theme';

export function createNode(
  parent: Node,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
): Node {
  const node = new Node(name);
  node.layer = Layers.Enum.UI_2D;
  const transform = node.addComponent(UITransform);
  transform.setContentSize(width, height);
  node.setPosition(x, y, 0);
  parent.addChild(node);
  return node;
}

export function createLabel(
  parent: Node,
  name: string,
  text: string,
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    bold?: boolean;
    color?: Color;
    hAlign?: HorizontalTextAlignment;
    vAlign?: VerticalTextAlignment;
    wrap?: boolean;
  },
): Label {
  const node = createNode(parent, name, options.x, options.y, options.width, options.height);
  const label = node.addComponent(Label);
  label.string = text;
  label.fontSize = options.fontSize;
  label.lineHeight = options.fontSize + 6;
  label.useSystemFont = true;
  label.isBold = options.bold ?? false;
  label.color = options.color ?? COLORS.text;
  label.overflow = Overflow.CLAMP;
  label.enableWrapText = options.wrap ?? true;
  label.horizontalAlign = options.hAlign ?? HorizontalTextAlignment.CENTER;
  label.verticalAlign = options.vAlign ?? VerticalTextAlignment.CENTER;
  return label;
}

export function paintRoundRect(graphics: Graphics, width: number, height: number, color: Color, radius = 18): void {
  graphics.clear();
  graphics.fillColor = color;
  graphics.roundRect(-width / 2, -height / 2, width, height, radius);
  graphics.fill();
}

export function paintCircle(graphics: Graphics, radius: number, color: Color): void {
  graphics.clear();
  graphics.fillColor = color;
  graphics.circle(0, 0, radius);
  graphics.fill();
}

export function createPanel(
  parent: Node,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: Color = COLORS.panel,
  radius = 20,
): Node {
  const node = createNode(parent, name, x, y, width, height);
  const graphics = node.addComponent(Graphics);
  paintRoundRect(graphics, width, height, color, radius);
  return node;
}

export function createDim(parent: Node, width: number, height: number): Node {
  const node = createNode(parent, 'Dim', 0, 0, width, height);
  const graphics = node.addComponent(Graphics);
  graphics.fillColor = COLORS.dim;
  graphics.rect(-width / 2, -height / 2, width, height);
  graphics.fill();
  node.addComponent(BlockInputEvents);
  return node;
}

export class UiButton {
  readonly node: Node;
  private readonly label: Label;
  private readonly graphics: Graphics;
  private readonly opacity: UIOpacity;
  private readonly width: number;
  private readonly height: number;
  private color: Color;
  private enabled = true;
  private onTap: () => void;

  constructor(
    parent: Node,
    name: string,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color: Color,
    onTap: () => void,
  ) {
    this.width = width;
    this.height = height;
    this.color = color;
    this.onTap = onTap;
    this.node = createNode(parent, name, x, y, width, height);
    this.graphics = this.node.addComponent(Graphics);
    paintRoundRect(this.graphics, width, height, color, 16);
    this.opacity = this.node.addComponent(UIOpacity);
    this.label = createLabel(this.node, 'Label', text, {
      x: 0,
      y: 0,
      width,
      height,
      fontSize: 24,
      bold: true,
    });
    this.node.on(NodeEventType.TOUCH_END, this.handleTap, this);
  }

  setLabel(text: string): void {
    this.label.string = text;
  }

  setColor(color: Color): void {
    this.color = color;
    paintRoundRect(this.graphics, this.width, this.height, color, 16);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.opacity.opacity = enabled ? 255 : 110;
  }

  private handleTap(): void {
    if (this.enabled) {
      this.onTap();
    }
  }
}

export class UiBar {
  private readonly fill: Graphics;
  private readonly width: number;
  private readonly height: number;
  private readonly fillColor: Color;
  private readonly valueLabel: Label;

  constructor(
    parent: Node,
    name: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: Color,
  ) {
    this.width = width;
    this.height = height;
    this.fillColor = fillColor;
    const node = createNode(parent, name, x, y, width, height);
    const bg = node.addComponent(Graphics);
    paintRoundRect(bg, width, height, COLORS.barBg, height / 2);
    const fillNode = createNode(node, 'Fill', 0, 0, width, height);
    this.fill = fillNode.addComponent(Graphics);
    this.valueLabel = createLabel(node, 'Value', '', {
      x: 0,
      y: 0,
      width,
      height,
      fontSize: 16,
      bold: true,
    });
    this.setValue(0, '');
  }

  setValue(value: number, caption: string): void {
    const ratio = Math.max(0, Math.min(1, value / 100));
    const fillWidth = Math.max(this.height, this.width * ratio);
    this.fill.clear();
    this.fill.fillColor = this.fillColor;
    this.fill.roundRect(-this.width / 2, -this.height / 2, fillWidth, this.height, this.height / 2);
    this.fill.fill();
    this.valueLabel.string = `${caption} ${Math.round(value)}`;
  }
}
