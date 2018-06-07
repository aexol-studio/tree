import * as React from 'react';
import * as styles from './style/SpaceBarMenu';
import { SpaceBarProps, SpaceBarState } from './types';
import * as cx from 'classnames';
const Categories = ({ categories, category, onMouseOver, style, refFunction }) => (
  <div
    className={styles.Categories}
    style={{
      ...style
    }}
    ref={refFunction}
  >
    {categories.map((c, cindex) => (
      <div
        key={cindex}
        style={{
          position: 'relative'
        }}
        className={styles.Category}
      >
        <div
          className={cx({
            [styles.CategoryName]: true,
            [styles.CategoryNameActive]: category === c.name
          })}
          onMouseOver={() => {
            onMouseOver(c.name);
          }}
        >
          {c.name}
        </div>
        {category === c.name && (
          <div className={styles.Items}>
            {c.items.map((i, index) => (
              <div
                className={styles.Item}
                key={index}
                onClick={() => {
                  i.action();
                }}
              >
                {i.name}
              </div>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
);
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
    const { x, y, categories } = this.props;
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
          onMouseOver={(e) => {
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
        />
      </div>
    );
  }
}
