import { LinkUtils } from "../../Utils/linkUtils";
import { EyeImage } from "../Draw/EyeImage";
const IMAGE_DISTANCE_RATIO = 0.3;
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
  hidden: boolean
): void => {
  const centerX = LinkUtils.calculateLinkXCenterMath(x1, x2, centerPoint);
  const img = new EyeImage(hidden);
  let ydiff = Math.abs(y2 - y1);
  let cr = ydiff > cornerRadius * 2 ? cornerRadius : Math.floor(ydiff / 2.0);
  let crx = x2 > x1 ? cr : -cr;
  let cry = y2 > y1 ? cr : -cr;
  let imgx = x1 + (centerX - x1) * IMAGE_DISTANCE_RATIO;
  let imgy = y1 - img.image.height / 2;
  context.beginPath();
  context.moveTo(x1, y1);
  if (x2 > x1) {
    context.lineTo(imgx, y1);
    context.drawImage(img.image, imgx, imgy);
    context.moveTo(imgx + img.image.width, y1);
    context.lineTo(centerX - crx, y1);
  }
  else {
    context.lineTo(centerX - crx, y1);
  }
  context.arcTo(centerX, y1, centerX, y1 + cry, cr);
  context.lineTo(centerX, y2 - cry);
  context.arcTo(centerX, y2, centerX + crx, y2, cr);
  context.lineTo(x2, y2);
  context.lineWidth = strokeWidth;
  context.strokeStyle = color;
  context.stroke();
};
