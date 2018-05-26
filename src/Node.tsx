import * as React from 'react';
import * as classnames from 'classnames';
import { PortType, Port } from './Port';
import * as styles from './style';
export type NodeType = {
  id?: string;
  x?: number;
  y?: number;
  selected?: boolean;
  editable?: boolean;
  name: string;
  type?: string;
  inputs: Array<PortType>;
  outputs: Array<PortType>;
  nodes?: Array<NodeType>;
  clone?: string;
};
export type NodeTypePartial = { [P in keyof NodeType]?: NodeType[P] };
export type NodeActions = {
  nodeDown: (id: string, x: number, y: number) => void;
  nodeUp: (id: string) => void;
  portUp: (x: number, y: number, portId: string, id: string, output: boolean) => void;
  portDown: (x: number, y: number, portId: string, id: string, output: boolean) => void;
  portPosition: (x: number, y: number, portId: string, id: string, output: boolean) => void;
  addPort: (port: PortType) => void;
};
export type NodeState = {
  input: string;
};
export class Node extends React.Component<NodeType & NodeActions, NodeState> {
  private node;
  state = {
    input: ''
  };
  render() {
    const {
      id,
      name,
      inputs,
      outputs,
      x = 0,
      y = 0,
      nodeDown,
      nodeUp,
      portUp,
      portDown,
      portPosition,
      addPort,
      selected = false,
      editable = false
    } = this.props;
    const { input } = this.state;
    return (
      <div
        className={classnames({
          [styles.DependencyNode]: true,
          [styles.DependencyNodeSelected]: selected
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
        <div className={styles.DependencyNodeTitle}>{name}</div>
        <div className={styles.DependencyNodePorts}>
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
          {editable && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addPort({
                  name: input,
                  unpluggable: true
                });
              }}
            >
              <input
                type="text"
                placeholder="Add input..."
                value={input}
                className={styles.DependencyNodePortInputAdd}
                onChange={(e) => {
                  this.setState({
                    input: e.target.value
                  });
                }}
              />
            </form>
          )}
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
      </div>
    );
  }
}
