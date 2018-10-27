import * as React from 'react';
import { PortType, PropsType } from '../types';
import * as styles from './style/Props';

export class Props extends React.Component<PropsType> {
  nameInput: HTMLInputElement;
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
  focusInput = () => {
    const { canBlurFocus } = this.props;
    if (canBlurFocus) {
      this.nameInput.focus();
      this.nameInput.onblur = (e) => {
        const { canBlurFocus } = this.props;
        if (canBlurFocus) {
          this.nameInput.focus();
        }
      };
    }
  };
  componentDidMount() {
    this.focusInput();
  }
  componentDidUpdate(prevProps: PropsType) {
    this.focusInput();
  }
  render() {
    const { node, onChange } = this.props;
    return (
      <div onMouseUp={(e) => e.stopPropagation()} className={styles.Props}>
        <div className={styles.PropsPort}>
          <input
            className={styles.PropsPortInput}
            type="text"
            ref={(input) => {
              this.nameInput = input;
            }}
            value={node.name}
            disabled={!node.editable}
            onChange={(e) => {
              let name = e.target.value;
              let pattern = new RegExp(/^([a-zA-Z][a-zA-Z_0-9]*)?$/);
              if (!name.match(pattern)) {
                return;
              }
              if (e.target.defaultValue === node.type) {
                name = name.substr(node.type.length);
              }
              onChange({
                ...node,
                name
              });
            }}
          />
        </div>
      </div>
    );
  }
}
