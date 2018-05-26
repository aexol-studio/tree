import * as React from 'react';
import * as styles from './style/SpaceBarMenu';
export type Item = {
  name: string;
  action: Function;
};

export type SpaceBarCategory = {
  name: string;
  items: Array<Item>;
};

export type SpaceBarProps = {
  x: number;
  y: number;
  categories: Array<SpaceBarCategory>;
};
export type SpaceBarState = {
  category?: string;
  menuWidth: number;
};
export enum SpaceBarAction {
  AddNode,
  Action
}
const Categories = ({ categories, category, onMouseOver, top, style, refFunction }) => (
  <div
    className={styles.SpaceBarCategories}
    style={{
      marginTop: top ? -70 : 70,
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
        className={styles.SpaceBarCategory}
      >
        <div
          className={styles.SpaceBarCategoryName}
          onMouseOver={() => {
            onMouseOver(c.name);
          }}
        >
          {c.name}
        </div>
        {category === c.name && (
          <div className={styles.SpaceBarItems}>
            {c.items.map((i, index) => (
              <div
                className={styles.SpaceBarItem}
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
export class SpaceBarMenu extends React.Component<SpaceBarProps, SpaceBarState> {
  menu;
  state = {
    category: null,
    menuWidth: 0
  };
  componentDidMount() {
    this.setState({ menuWidth: this.menu.offsetWidth });
    console.log(this.menu.offsetWidth);
  }
  render() {
    const { x, y, categories } = this.props;
    const { category } = this.state;
    return (
      <div
        className={styles.SpaceBarMenu}
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
          categories={categories.filter((c, i) => i % 2 === 0)}
          category={category}
          onMouseOver={(e) => {
            this.setState({
              category: e
            });
          }}
          top={false}
          style={{ marginLeft: -this.state.menuWidth / 2.0 }}
          refFunction={(ref) => {
            if (ref) {
              this.menu = ref;
            }
          }}
        />
        <Categories
          refFunction={() => {}}
          categories={categories.filter((c, i) => i % 2 !== 0)}
          category={category}
          onMouseOver={(e) => {
            this.setState({
              category: e
            });
          }}
          top={true}
          style={{ marginLeft: -this.state.menuWidth / 2.0 }}
        />
      </div>
    );
  }
}
