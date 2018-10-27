import { Action } from '../types';
import * as React from 'react';
import { RendererState } from '../types';
import { Basic, Move, Connect, Left } from '../cursors';
export class MouseCursor extends React.Component<RendererState> {
  render() {
    return {
      [Action.Left]: <Left x={0} y={0} />,
      [Action.Nothing]: <Basic x={0} y={0} />,
      [Action.SelectedNode]: <Basic x={0} y={0} />,
      [Action.MoveNode]: <Move x={0} y={0} />,
      [Action.Pan]: <Move x={0} y={0} />,
      [Action.ConnectPort]: <Connect x={0} y={0} />
    }[this.props.action];
  }
}
