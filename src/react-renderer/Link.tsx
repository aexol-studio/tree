import * as React from 'react';
import * as vars from '../vars';
import { LinkWidgetProps } from '../types';
// const buildSquarePath = (x1: number, y1: number, x2: number, y2: number): Array<number> => {
//   let centerX = (x1 + x2) / 2.0;
//   return [x1, y1, centerX, y1, centerX, y2, x2, y2];
// };
const buildQuadraticPath = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cornerRadius: number
): string => {
  let centerX = (x1 + x2) / 2.0;
  let ydiff = Math.abs(y2 - y1);
  let cr = ydiff > cornerRadius ? cornerRadius : ydiff;
  let crx = x2 > x1 ? cr : -cr;
  let cry = y2 > y1 ? cr : -cr;

  return `M ${x1} ${y1} ${centerX - crx} ${y1} Q ${centerX} ${y1} ${centerX} ${y1 +
    cry} L ${centerX} ${y2 - cry} Q ${centerX} ${y2} ${centerX + crx} ${y2} L ${x2} ${y2}`;
};
export class LinkWidget extends React.Component<LinkWidgetProps> {
  render() {
    const { start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, selected, required } = this.props;
    return (
      <path
        fill="none"
        stroke={selected ? vars.selected : vars.lines}
        strokeWidth={required ? '3' : '1'}
        d={buildQuadraticPath(x1, y1, x2, y2, 5)}
      />
    );
  }
}
