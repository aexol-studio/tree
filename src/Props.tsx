import * as React from 'react';
import { PortType, PropsType } from './types';
import * as styles from './style/Props';


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
    const { node, onChange } = this.props;
    return (
      <div onMouseUp={(e) => e.stopPropagation()} className={styles.Props}>
        <div className={styles.PropsPort}>
          <input
            className={styles.PropsPortInput}
            type="text"
            value={node.name}
            disabled={!node.editable}
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
