import * as React from 'react';
import * as styles from '../style/SpaceBarMenu';
import { SpaceBarProps, SpaceBarState } from '../types';
import { Categories } from './Categories';

export class SpaceMenu extends React.Component<SpaceBarProps, SpaceBarState> {
  menu;
  state = {
    category: null,
    menuWidth: 0
  };
  componentDidMount() {
    this.setState({ menuWidth: this.menu.offsetWidth });
  }
  render() {
    const { x, y, categories, addNode, setCurrentHover } = this.props;
    const { category } = this.state;
    return (
      <div
        className={styles.Menu}
        style={{
          position: 'fixed',
          zIndex: 99,
          top: y,
          left: x,
          pointerEvents: 'all'
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <Categories
          categories={categories}
          category={category}
          addNode={addNode}
          mouseOver={(e) => {
            this.setState({
              category: e
            });
          }}
          style={{ marginLeft: -this.state.menuWidth / 2.0 }}
          refFunction={(ref) => {
            if (ref) {
              this.menu = ref;
            }
          }}
          setCurrentHover={setCurrentHover}
        />
      </div>
    );
  }
}
