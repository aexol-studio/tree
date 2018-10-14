import * as React from 'react';
import { GraphProps } from 'types';
import { GraphReact } from './Graph';

export class Renderer extends React.Component<GraphProps> {
  background: HTMLDivElement;
  render() {
    return <GraphReact {...this.props} />;
  }
}
