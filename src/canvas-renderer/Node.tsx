import { NodeType } from '../types/Node';
import * as vars from '../vars';
import { RoundedRectangle } from './draw/RoundedRect';
import { Circle } from './draw/Circle';
import { getNodeWidth } from '../viewport';

export class Node {
  static getNodeFont(ctx: CanvasRenderingContext2D, size: number, weight = 'normal') {
    return `${weight} ${size}px ${ctx.font.split(' ')[ctx.font.split(' ').length - 1]}`;
  }
  static render(
    ctx: CanvasRenderingContext2D,
    props: NodeType,
    visual: {
      width: number;
      height: number;
      port: number;
    }
  ) {
    const { x, y, name, type, kind, selected, inputs, outputs } = props;
    let width = getNodeWidth(props);
    ctx.fillStyle = vars.bglight;
    if (selected) {
      ctx.fillStyle = vars.selected;
    }
    RoundedRectangle(ctx, {
      width: width,
      height: visual.height,
      x,
      y,
      radius: 5
    });
    ctx.font = Node.getNodeFont(ctx, 12, 'bold');
    ctx.fillStyle = vars.text;
    ctx.fillText(name, x + width / 2.0, y + visual.height / 2.0 - 5);
    ctx.font = Node.getNodeFont(ctx, 12, 'normal');
    ctx.fillStyle = vars.text;
    ctx.textAlign = 'center';
    ctx.fillText(kind || type, x + width / 2.0, y + visual.height / 2.0 + 12);

    for (const i of inputs) {
      Circle(ctx, {
        x: x - visual.port,
        y: y + visual.height / 2.0,
        radius: visual.port,
        color: i.connected ? vars.cursorColor : 'transparent',
        stroke: vars.cursorColor
      });
    }
    for (const o of outputs) {
      Circle(ctx, {
        x: x + width + visual.port,
        y: y + visual.height / 2.0,
        radius: visual.port,
        color: o.connected ? vars.cursorColor : 'transparent',
        stroke: vars.cursorColor
      });
    }
  }
}
