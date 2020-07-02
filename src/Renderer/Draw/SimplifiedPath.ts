import { LinkUtils } from "@utils";

const NODE_CR_HORIZONTAL_VECTOR = 150;
const NODE_CR_VERTICAL_VECTOR = 50;

export const SimplifiedPath = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeWidth: number,
  color: string,
  centerPoint = 0.5,
  circularReference?: boolean
): void => {
  const centerX = LinkUtils.calculateLinkXCenterMath(x1, x2, centerPoint);
  context.beginPath();
  context.moveTo(x1, y1);
  if (circularReference) {
    context.lineTo(x1 + NODE_CR_HORIZONTAL_VECTOR, y1);
    context.lineTo(
      x1 + NODE_CR_HORIZONTAL_VECTOR,
      y1 + NODE_CR_VERTICAL_VECTOR
    );
    context.lineTo(
      x2 - NODE_CR_HORIZONTAL_VECTOR,
      y2 + NODE_CR_VERTICAL_VECTOR
    );
    context.lineTo(x2 - NODE_CR_HORIZONTAL_VECTOR, y2);
    context.lineTo(x2, y2);
  } else {
    context.lineTo(centerX, y1);
    context.lineTo(centerX, y2);
    context.lineTo(x2, y2);
  }
  context.lineWidth = strokeWidth;
  context.strokeStyle = color;
  context.stroke();
};
