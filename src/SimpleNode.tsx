import * as React from 'react';
import * as classnames from 'classnames';
import { Port } from './Port';
import { NodeType, NodeActions, NodeState } from './Node';
import * as styles from './style/SimpleNode';
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
    return (
      <div
        className={classnames({
          [styles.DependencySimpleNode]: true,
          [styles.DependencySimpleNodeSelected]: selected
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
        {inputs.map((i) => (
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
            {...i}
          />
        ))}
        <div className={styles.DependencySimpleNodeTitle}>
          <div className={styles.DependencySimpleNodeName}>{name}</div>
          <div className={styles.DependencySimpleNodeType}>{type}</div>
        </div>
        {outputs.map((i) => (
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
            output={true}
            key={i.name}
            {...i}
          />
        ))}
      </div>
    );
  }
}
