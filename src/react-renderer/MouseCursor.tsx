import { Action } from '../types';
import * as React from 'react';
import { RendererState } from '../types';
import { Basic, Move, Connect } from '../cursors';
export class MouseCursor extends React.Component<RendererState> {
  render() {
    return {
      [Action.Nothing]: <Basic x={this.props.x} y={this.props.y} />,
      [Action.SelectedNode]: <Basic x={this.props.x} y={this.props.y} />,
      [Action.MoveNode]: <Move x={this.props.x} y={this.props.y} />,
      [Action.Pan]: <Move x={this.props.x} y={this.props.y} />,
      [Action.ConnectPort]: <Connect x={this.props.x} y={this.props.y} />
    }[this.props.action];
  }
}
