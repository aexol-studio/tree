import * as React from 'react';
import * as styles from '../style/SpaceBarMenu';
import { ContextMenuProps, ContextMenuState } from '../types';
import { Category } from './Category';

export class ContextMenu extends React.Component<ContextMenuProps, ContextMenuState> {
  menu;
  state = {
    category: null,
    menuWidth: 0
  };
  componentDidMount() {
  }
  render() {
    const { x, y, category, addNode } = this.props;
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
        <Category
          addNode={addNode}
          category={category}
          hide={true}
          categoryName={category.name}
          mouseOver={(e) => {
            this.setState({
              category: e
            });
          }}
          setCurrentHover={() => {}}
        />
      </div>
    );
  }
}
