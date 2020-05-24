import { LinkUtils } from "../../Utils/linkUtils";

const NODE_CR_HORIZONTAL_VECTOR = 150;
const NODE_CR_VERTICAL_VECTOR = 50;
const NODE_CIRCULAR_VECTOR = 2.5;

export const QuadraticPath = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cornerRadius: number,
  strokeWidth: number,
  color: string,
  centerPoint: number = 0.5,
  circularReference: boolean
): void => {
  context.beginPath();
  context.moveTo(x1, y1);
  if (circularReference) {
    context.lineTo(x1 + 100 + NODE_CIRCULAR_VECTOR, y1);
    context.arcTo(x1 + NODE_CR_HORIZONTAL_VECTOR, y1, x1 + NODE_CR_HORIZONTAL_VECTOR + 50, y1 + 2 * NODE_CR_VERTICAL_VECTOR, cornerRadius );
    context.arcTo(x1 + NODE_CR_HORIZONTAL_VECTOR + NODE_CIRCULAR_VECTOR, y1 + 3 * NODE_CR_VERTICAL_VECTOR, x1 + NODE_CR_HORIZONTAL_VECTOR, y1 + 3 * NODE_CR_VERTICAL_VECTOR, cornerRadius);
    context.arcTo(x2 - NODE_CR_HORIZONTAL_VECTOR - NODE_CIRCULAR_VECTOR, y1 + 3 * NODE_CR_VERTICAL_VECTOR, x2 - NODE_CR_HORIZONTAL_VECTOR, y1 - 3 * NODE_CR_VERTICAL_VECTOR, cornerRadius);
    context.arcTo(x2 - NODE_CR_HORIZONTAL_VECTOR - NODE_CIRCULAR_VECTOR, y1, x2 - NODE_CR_HORIZONTAL_VECTOR, y1, cornerRadius);
    context.lineTo(x2, y2);
  }
  else {
    const centerX = LinkUtils.calculateLinkXCenterMath(x1, x2, centerPoint);
    const ydiff = Math.abs(y2 - y1);
    const cr = ydiff > cornerRadius * 2 ? cornerRadius : Math.floor(ydiff / 2.0);
    const crx = x2 > x1 ? cr : -cr;
    const cry = y2 > y1 ? cr : -cr;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(centerX - crx, y1);
    context.arcTo(centerX, y1, centerX, y1 + cry, cr);
    context.lineTo(centerX, y2 - cry);
    context.arcTo(centerX, y2, centerX + crx, y2, cr);
    context.lineTo(x2, y2);
  }
  context.lineWidth = strokeWidth;
  context.strokeStyle = color;
  context.stroke();
};
