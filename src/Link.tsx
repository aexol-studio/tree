import * as React from 'react';
import * as vars from './style/vars';
export type LinkType = {
  from: {
    nodeId: string;
    portId: string;
  };
  to: {
    nodeId: string;
    portId: string;
  };
};
export type LinkWidgetProps = {
  start: {
    x: number;
    y: number;
  };
  end: {
    x: number;
    y: number;
  };
  selected?: boolean;
};

const buildSquarePath = (x1: number, y1: number, x2: number, y2: number): Array<number> => {
  let centerX = (x1 + x2) / 2.0;
  return [x1, y1, centerX, y1, centerX, y2, x2, y2];
};
export class LinkWidget extends React.Component<LinkWidgetProps> {
  render() {
    const { start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, selected } = this.props;
    return (
      <path
        fill="none"
        stroke={selected ? vars.selected : vars.off}
        strokeWidth="2"
        d={`M ${buildSquarePath(x1, y1, x2, y2).join(',')}`}
      />
    );
  }
}
