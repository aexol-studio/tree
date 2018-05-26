import * as React from 'react';
import { NodeType } from './Node';
import { PortType } from './Port';
import * as styles from './style';

export type PropsType = {
  node: NodeType;
  canExpand?: boolean;
  canShrink?: boolean;
  onChange: (node: NodeType) => void;
  onExpand: () => void;
  onShrink: () => void;
};

export class Props extends React.Component<PropsType> {
  changePorts = (port: 'inputs' | 'outputs') => {
    const { onChange, node } = this.props;
    return node[port].map((i: PortType) => (
      <div className={styles.PropsPort} key={i.id}>
        <input
          className={styles.PropsPortInput}
          type="text"
          value={i.name}
          onChange={(e) => {
            onChange({
              ...node,
              [port]: node[port].map(
                (input) => (input.name === i.name ? { ...i, name: e.target.value } : input)
              )
            });
          }}
        />
      </div>
    ));
  };
  render() {
    const {  node, onChange } = this.props;
    return (
      <div onMouseUp={(e) => e.stopPropagation()} className={styles.Props}>
        <div className={styles.PropsPort}>
          <input
            className={styles.PropsPortInput}
            type="text"
            value={node.name}
            onChange={(e) => {
              onChange({
                ...node,
                name: e.target.value
              });
            }}
          />
        </div>
      </div>
    );
  }
}
