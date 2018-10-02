import * as React from 'react';
import * as classnames from 'classnames';
import { Port } from './Port';
import { NodeType, NodeActions } from './types';
import * as NodeStyles from './style/Node';
export class Node extends React.Component<NodeType & NodeActions, {}> {
  private node: HTMLDivElement;
  private ports: Port[] = [];
  shouldComponentUpdate(nextProps: NodeType & NodeActions, nextState) {
    let connectionUpdate;
    if (nextProps.inputs) {
      nextProps.inputs.map((inp, index) => {
        if (this.props.inputs[index].connected !== inp.connected) {
          connectionUpdate = true;
        }
      });
    }
    if (nextProps.outputs) {
      nextProps.outputs.map((inp, index) => {
        if (this.props.outputs[index].connected !== inp.connected) {
          connectionUpdate = true;
        }
      });
    }
    if (
      this.props.name !== nextProps.name ||
      this.props.kind !== nextProps.kind ||
      this.props.x !== nextProps.x ||
      this.props.y !== nextProps.y ||
      this.props.renamed !== nextProps.renamed ||
      this.props.selected !== nextProps.selected ||
      this.props.invalid !== nextProps.invalid ||
      connectionUpdate
    ) {
      if (
        this.props.kind !== nextProps.kind ||
        this.props.name !== nextProps.name ||
        connectionUpdate
      ) {
        this.ports.map((p) => p.forceUpdate());
      }
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
      contextMenu,
      nodeUp,
      portUp,
      portDown,
      portPosition,
      kind,
      renamed,
      styles: overrideStyles,
      selected = false,
      invalid = false,
      noDraw
    } = this.props;
    if (noDraw) {
      return <div />;
    }
    let styles = overrideStyles || NodeStyles;
    const renderPorts = (ports, output) =>
      ports.map((i) => (
        <Port
          ref={(ref) => {
            ref && this.ports.push(ref);
          }}
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
        <div className={styles.Name}>
          {name}
          {selected && renamed && <div className={styles.BlinkingCursor}>{'|'}</div>}
        </div>
        <div className={styles.Type}>{kind || type}</div>
      </div>
    );
    return (
      <div
        className={classnames({
          [styles.Node]: true,
          [styles.Selected]: selected,
          [styles.Invalid]: invalid
        })}
        style={{
          top: y,
          left: x,
          pointerEvents: 'all'
        }}
        ref={(ref) => (this.node = ref)}
        onMouseDown={(e) => {
          e.stopPropagation();
          if (e.button === 0 || 2) {
            nodeDown(id, x, y);
          }
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          nodeUp(id);
          if (e.button === 2) {
            e.preventDefault();
            contextMenu(id, x, y);
          }
        }}
      >
        {renderPorts(inputs, false)}
        {nodeIdentity()}
        {renderPorts(outputs, true)}
      </div>
    );
  }
}
