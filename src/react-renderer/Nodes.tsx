import * as React from 'react';
import { NodeType, NodeActions } from '../types';
import { Node } from '.';
export class Nodes extends React.PureComponent<{ nodes: NodeType[] } & NodeActions> {
  render() {
    const { nodes, ...actions } = this.props;
    return nodes.map((node) => <Node {...node} key={node.id} {...actions} />);
  }
}
