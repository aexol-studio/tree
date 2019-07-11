import { LinkUtils } from "../../Utils/linkUtils";

export const SimplifiedPath = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeWidth: number,
  color: string,
  centerPoint: number = 0.5
): void => {
  const centerX = LinkUtils.calculateLinkXCenterMath(x1, x2, centerPoint);
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(centerX, y1);
  context.lineTo(centerX, y2);
  context.lineTo(x2, y2);
  context.lineWidth = strokeWidth;
  context.strokeStyle = color;
  context.stroke();
};
