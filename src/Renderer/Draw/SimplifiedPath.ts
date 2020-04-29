import { LinkUtils } from "../../Utils/linkUtils";

export const SimplifiedPath = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeWidth: number,
  color: string,
  centerPoint: number = 0.5,
  circularReference: boolean
): void => {
  const centerX = LinkUtils.calculateLinkXCenterMath(x1, x2, centerPoint);
  const hv = 150; // horizontal vector
  let vv = 100; // vertical vector
  context.beginPath();
  context.moveTo(x1, y1);
  if (circularReference) {
    context.lineTo(x1 + hv, y1);
    context.lineTo(x1 + hv, y1 + vv);
    context.lineTo(x2 - hv, y2 + vv);
    context.lineTo(x2 - hv, y2);
    context.lineTo(x2, y2);
  }
  else {
    context.lineTo(centerX, y1);
    context.lineTo(centerX, y2);
    context.lineTo(x2, y2);
  }
  context.lineWidth = strokeWidth;
  context.strokeStyle = color;
  context.stroke();
};
