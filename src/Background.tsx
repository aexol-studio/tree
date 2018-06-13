import * as React from 'react';
import { Action } from './types/Graph';
import * as styles from './style/Background';
import { BackgroundProps } from './types';
export const Background: React.SFC<BackgroundProps> = (props) => (
  <div
    ref={(ref) => {
      props.onRef(ref);
    }}
    className={styles.Background}
    onMouseDown={(e) => {
      props.switchAction(Action.Pan);
    }}
    onMouseUp={(e) => {
      props.reset();
    }}
    onMouseEnter={(e) => {
      props.switchAction(Action.Nothing);
    }}
    onMouseLeave={(e) => {
      props.switchAction(Action.Left);
    }}
    style={{
      cursor: 'none'
    }}
  >
    {props.children}
  </div>
);
