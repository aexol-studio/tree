import * as React from 'react';
import {
  GraphProps,
  RendererState,
  Action,
  GraphGetAction,
  GraphSetAction,
  GraphGetCursor,
  GraphSetCursor
} from '../types';
import { GraphReact } from './Graph';
import { MouseCursor } from './MouseCursor';
export class Renderer extends React.Component<GraphProps, RendererState> {
  state: RendererState = {
    action: Action.Nothing
  };
  x = 0;
  y = 0;
  cursorDiv: HTMLDivElement;
  setAction: GraphSetAction = (action) => {
    this.setState({ action });
  };
  getAction: GraphGetAction = () => {
    return this.state.action;
  };
  getCursor: GraphGetCursor = () => {
    return {
      x: this.x,
      y: this.y
    };
  };
  setCursor: GraphSetCursor = ({ x, y }) => {
    this.x = x;
    this.y = y;
    this.cursorDiv.style.top = `${y}px`;
    this.cursorDiv.style.left = `${x}px`;
  };
  render() {
    return (
      <React.Fragment>
        <GraphReact
          setCursor={this.setCursor}
          getCursor={this.getCursor}
          setAction={this.setAction}
          getAction={this.getAction}
          action={this.state.action}
          {...this.props}
        />
        <div
          style={{
            position: 'fixed',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
          ref={(ref) => {
            if (ref) {
              this.cursorDiv = ref;
            }
          }}
        >
          <MouseCursor action={this.state.action} />
        </div>
      </React.Fragment>
    );
  }
}
