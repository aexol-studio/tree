import * as React from 'react';
import * as classnames from 'classnames';
import * as styles from './style/Port';
import { PortActions, PortType } from './types';
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
          [styles.Port]: true
        })}
        style={{
          flexDirection: output ? 'row' : 'row-reverse'
        }}
      >
        {name && <div className={styles.Name}>{name}</div>}
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
              portDown(e.clientX, e.clientY, output);
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              portUp(e.clientX, e.clientY, output);
            }}
            className={classnames({
              [styles.Dot]: true,
              [styles.DotOutput]: output,
              [styles.DotInput]: !output,
              [styles.DotConnected]: connected
            })}
          />
        )}
      </div>
    );
  }
}
