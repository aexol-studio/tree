import * as React from 'react';
import * as classnames from 'classnames';
import { Port } from './Port';
import { NodeType, NodeActions } from './types';
import * as NodeStyles from './style/Node';
export class Node extends React.Component<NodeType & NodeActions, {}> {
  private node;
  shouldComponentUpdate(nextProps: NodeType & NodeActions, nextState) {
    if (
      this.props.name !== nextProps.name ||
      this.props.kind !== nextProps.kind ||
      this.props.x !== nextProps.x ||
      this.props.y !== nextProps.y ||
      this.props.selected !== nextProps.selected
    ) {
      return true;
    }
    return false;
  }
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
      kind,
      styles: overrideStyles,
      selected = false
    } = this.props;
    let styles = overrideStyles || NodeStyles;
    const renderPorts = (ports, output) =>
      ports.map((i) => (
        <Port
          portUp={(x, y, output) => {
            portUp(x, y, i.id, id, output);
            this.forceUpdate();
          }}
          portDown={(x, y, output) => {
            portDown(x, y, i.id, id, output);
            this.forceUpdate();
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
        <div className={styles.Type}>{kind || type}</div>
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
