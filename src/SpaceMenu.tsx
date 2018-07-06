import * as React from 'react';
import * as styles from './style/SpaceBarMenu';
import { SpaceBarProps, SpaceBarState, Item, NodeType, ActionCategory } from './types';
import * as cx from 'classnames';

type CategoriesProps = {
  categories: ActionCategory[];
  category: string;
  style: any;
  refFunction: React.Ref<HTMLDivElement>;
  mouseOver: (name: string) => void;
  addNode: (n: NodeType) => () => void;
};

class ItemComponent extends React.Component<{
  i: Item;
  mouseOver: (name: string, level: number) => void;
  over: string[];
  level: number;
  addNode: (n: NodeType) => () => void;
}> {
  item: HTMLDivElement;
  render() {
    const { i, mouseOver, over, addNode, level } = this.props;
    return (
      <React.Fragment>
        <div
          ref={(e) => {
            this.item = e;
          }}
          className={styles.Item}
          onClick={() => {
            if (i.action) {
              i.action();
            }
            if (i.node) {
              addNode(i.node)();
            }
          }}
          onMouseOver={() => {
            mouseOver(i.name, level);
          }}
        >
          <div className={styles.ItemName}>{i.name}</div>
        </div>
        {i.items &&
          over.includes(i.name) && (
            <div
              className={styles.ExpandedItems}
              style={
                this.item
                  ? {
                      left: 10 + this.item.offsetWidth,
                      top: -this.item.offsetHeight,
                      marginBottom: (-this.item.offsetHeight + 0.5) * i.items.length
                    }
                  : {}
              }
            >
              {i.items.map((i, index) => (
                <ItemComponent
                  i={i}
                  key={index}
                  mouseOver={mouseOver}
                  level={level + 1}
                  over={over}
                  addNode={addNode}
                />
              ))}
            </div>
          )}
      </React.Fragment>
    );
  }
}
class Category extends React.Component<
  {
    category: ActionCategory;
    categoryName: string;
    mouseOver: (name: string) => void;
    addNode: (n: NodeType) => () => void;
  },
  { over: string[]; paddingBottom: number }
> {
  state = {
    over: [],
    paddingBottom: 0
  };
  componentDidMount() {
    const { category } = this.props;
    function* getLongestItems(items: Item[]) {
      yield items.length;
      for (var i of items) {
        if (i.items) {
          yield* getLongestItems(i.items);
        }
      }
    }
    this.setState({
      paddingBottom: Math.max.apply(Math, [...getLongestItems(category.items)])
    });
  }
  render() {
    const { categoryName, category, mouseOver, addNode } = this.props;
    return (
      <div
        style={{
          position: 'relative',
          paddingBottom: this.state.paddingBottom
        }}
        className={styles.Category}
      >
        <div
          className={cx({
            [styles.CategoryName]: true,
            [styles.CategoryNameActive]: categoryName === category.name
          })}
          onMouseOver={(e) => {
            mouseOver(category.name);
          }}
        >
          {category.name}
        </div>
        {categoryName === category.name && (
          <React.Fragment>
            <div
              className={cx({
                [styles.TriangleCategoryDown]: true,
                [styles.TriangleHidden]: categoryName !== category.name
              })}
            />

            {category.items.map((i, index) => (
              <ItemComponent
                addNode={addNode}
                key={index}
                level={0}
                i={i}
                over={this.state.over}
                mouseOver={(o: string, level: number) => {
                  let over = this.state.over.slice(0, level);
                  over[level] = o;
                  this.setState({
                    over: over
                  });
                }}
              />
            ))}
          </React.Fragment>
        )}
      </div>
    );
  }
}
class Categories extends React.Component<CategoriesProps, { over: string[] }> {
  state = {
    over: [],
    paddingBottom: 0
  };
  render() {
    const { categories, category, style, refFunction, mouseOver, addNode } = this.props;
    return (
      <div
        className={styles.Categories}
        style={{
          ...style
        }}
        ref={refFunction}
      >
        {categories.map((c, cindex) => (
          <Category
            key={cindex}
            category={c}
            categoryName={category}
            mouseOver={mouseOver}
            addNode={addNode}
          />
        ))}
      </div>
    );
  }
}
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
    const { x, y, categories, addNode } = this.props;
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
        />
      </div>
    );
  }
}
