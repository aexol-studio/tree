import { PortType } from '../types';
export class Port {
  static render(ctx: CanvasRenderingContext2D, props: PortType) {
    const { x, y, output } = props;
    if (output) {
      ctx.fillRect(x + 160, y + 35, 10, 10);
    } else {
      ctx.fillRect(x - 10, y + 35, 10, 10);
    }
  }
}
