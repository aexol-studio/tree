import * as React from 'react';
import { GraphProps, RendererState, Action } from '../types';
import { GraphReact } from './Graph';
import { MouseCursor } from './MouseCursor';
export class Renderer extends React.Component<GraphProps, RendererState> {
  state: RendererState = {
    x: 0,
    y: 0,
    action: Action.Nothing
  };
  background: HTMLDivElement;
  setCursor = (props: Partial<RendererState>) => {
    this.setState((state) => props as any);
  };
  getCursor = () => {
    const { x, y, action } = this.state;
    return {
      x,
      y,
      action
    };
  };
  render() {
    return (
      <React.Fragment>
        <GraphReact
          setCursor={this.setCursor}
          getCursor={this.getCursor}
          {...this.state}
          {...this.props}
        />
        {this.state.action !== Action.Left && <MouseCursor {...this.state} />}
      </React.Fragment>
    );
  }
}
