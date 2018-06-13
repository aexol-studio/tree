import * as React from 'react';
import * as classnames from 'classnames';
import { Port } from './Port';
import { NodeType, NodeActions, NodeState } from './types';
import * as styles from './style/Node';
export class Node extends React.Component<NodeType & NodeActions, NodeState> {
  private node;
  state = {
    input: ''
  };
  render() {
    const {
      id,
      name,
      type,
      inputs,
      outputs,
      x = 0,
      y = 0,
      nodeDown,
      nodeUp,
      portUp,
      portDown,
      portPosition,
      selected = false
    } = this.props;
    const renderPorts = (ports, output) =>
      ports.map((i) => (
        <Port
          portUp={(x, y, output) => {
            portUp(x, y, i.id, id, output);
          }}
          portDown={(x, y, output) => {
            portDown(x, y, i.id, id, output);
          }}
          portPosition={(x, y, output) => {
            portPosition(x, y, i.id, id, output);
          }}
          key={i.name}
          output={output}
          {...i}
        />
      ));
    const nodeIdentity = () => (
      <div className={styles.Title}>
        <div className={styles.Name}>{name}</div>
        <div className={styles.Type}>{type}</div>
      </div>
    );
    return (
      <div
        className={classnames({
          [styles.Node]: true,
          [styles.Selected]: selected
        })}
        style={{
          top: y,
          left: x,
          pointerEvents: 'all'
        }}
        ref={(ref) => (this.node = ref)}
        onMouseDown={(e) => {
          e.stopPropagation();
          nodeDown(id, x, y);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          nodeUp(id);
        }}
      >
        {renderPorts(inputs, false)}
        {nodeIdentity()}
        {renderPorts(outputs, true)}
      </div>
    );
  }
}
