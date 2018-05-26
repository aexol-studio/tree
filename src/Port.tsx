import * as React from 'react';
import * as classnames from 'classnames';
import * as styles from './style'
export type PortType = {
  id?: string;
  name: string;
  unpluggable?: boolean;
  connected?: boolean;
  type?: string;
  output?: boolean;
  x?: number;
  y?: number;
};
export type PortActions = {
  portUp: (x: number, y: number, output: boolean) => void;
  portDown: (x: number, y: number, output: boolean) => void;
  portPosition: (x: number, y: number, output: boolean) => void;
};

export class Port extends React.Component<PortType & PortActions> {
  port;
  portPosition = () => {
    const { portPosition, output = false } = this.props;
    portPosition(
      this.port.offsetLeft + this.port.offsetWidth / 2,
      this.port.offsetTop + this.port.offsetHeight / 2,
      output
    );
  };
  componentDidMount() {
    if (!this.props.unpluggable) {
      this.portPosition();
    }
  }
  render() {
    const { name, portDown, portUp, connected = false, output = false, unpluggable } = this.props;
    return (
      <div
        className={classnames({
          [styles.DependencyNodePort]: true
        })}
        style={{
          flexDirection: output ? 'row' : 'row-reverse'
        }}
      >
        <div
          className={classnames({
            [styles.DependencyNodePortName]: true,
            [styles.DependencyNodePortNameOutput]: output
          })}
        >
          {name}
        </div>
        {!unpluggable && (
          <div
            ref={(ref) => {
              if (ref && this.port !== ref) {
                this.port = ref;
              }
            }}
            style={{
              pointerEvents: 'all'
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              portDown(e.clientX, e.clientY,output);
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              portUp(e.clientX, e.clientY,output);
            }}
            className={classnames({
              [styles.DependencyNodePortDot]: true,
              [styles.DependencyNodePortDotOutput]: output,
              [styles.DependencyNodePortDotInput]: !output,
              [styles.DependencyNodePortDotConnected]: connected
            })}
          />
        )}
      </div>
    );
  }
}
