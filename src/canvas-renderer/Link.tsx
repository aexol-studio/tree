import { LinkWidgetProps } from '../types';
import * as vars from '../vars';
export class Link {
  static render(ctx: CanvasRenderingContext2D, l: LinkWidgetProps) {
    ctx.beginPath();
    ctx.fillStyle = vars.lines;
    ctx.moveTo(l.start.x, l.start.y);
    ctx.lineTo(l.end.x, l.end.y);
    ctx.stroke();
  }
}
