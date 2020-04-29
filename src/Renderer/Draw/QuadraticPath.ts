import { LinkUtils } from "../../Utils/linkUtils";

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
    console.log(x1, y1);
  if (circularReference) {
    let hv = 150; // horizontal vector
    let vv = 50; // vertical vector
    let cv = 2.5; // circular vector
    context.lineTo(x1 + 100 + cv, y1);
    context.arcTo(x1 + hv, y1, x1 + hv + 50, y1 + 2 * vv, cornerRadius );
    context.arcTo(x1 + hv + cv, y1 + 3 * vv, x1 + hv, y1 + 3 * vv, cornerRadius);
    context.arcTo(x2 - hv - cv, y1 + 3 * vv, x2 - hv, y1 - 3 * vv, cornerRadius);
    context.arcTo(x2 - hv - cv, y1, x2 - hv, y1, cornerRadius);
    context.lineTo(x2, y2);
  }
  else {
    const centerX = LinkUtils.calculateLinkXCenterMath(x1, x2, centerPoint);
    let ydiff = Math.abs(y2 - y1);
    let cr = ydiff > cornerRadius * 2 ? cornerRadius : Math.floor(ydiff / 2.0);
    let crx = x2 > x1 ? cr : -cr;
    let cry = y2 > y1 ? cr : -cr;
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
