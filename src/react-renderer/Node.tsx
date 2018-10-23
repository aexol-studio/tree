import * as React from 'react';
import * as classnames from 'classnames';
import { Port } from './Port';
import { NodeType, NodeActions } from '../types/Node';
import * as NodeStyles from './style/Node';
export class Node extends React.Component<NodeType & NodeActions, {}> {
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
      this.props.x !== nextProps.x ||
      this.props.y !== nextProps.y ||
      this.props.invalid !== nextProps.invalid ||
      connectionUpdate
    ) {
      if (connectionUpdate) {
        this.ports.map((p) => p.forceUpdate());
      }
      return true;
    }
    return false;
  }
  render() {
    const {
      id,
      inputs,
      outputs,
      x = 0,
      y = 0,
      nodeDown,
      contextMenu,
      name,
      kind,
      type,
      nodeUp,
      portUp,
      portDown,
      portPosition,
      nodeDoubleClick,
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
    const width =
      20 + 10 * (name.length > (kind || type).length ? name.length : (kind || type).length);
    const nodeIdentity = () => <div className={styles.Title} style={{ width }} />;

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
          width,
          pointerEvents: 'all'
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (e.button === 0) {
            nodeDoubleClick(id, x, y);
          }
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          if (e.button === 0 || e.button === 2) {
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
