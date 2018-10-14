import { NodeType } from '../types/Node';
import * as vars from '../vars';
import { Port } from './Port';
export class Node {
  static render(ctx: CanvasRenderingContext2D, props: NodeType) {
    const { x, y, name, type, kind, selected, inputs, outputs } = props;
    ctx.fillStyle = vars.bglight;
    if (selected) {
      ctx.fillStyle = vars.selected;
    }
    ctx.fillRect(x, y, 150, 80);
    ctx.fillStyle = vars.text;
    ctx.fillText(name, x + 75, y + 20);
    ctx.fillStyle = vars.text;
    ctx.fillText(kind || type, x + 75, y + 40);
    for (const i of inputs) {
      Port.render(ctx, i);
    }
    for (const o of outputs) {
      Port.render(ctx, { ...o, output: true });
    }
  }
}
