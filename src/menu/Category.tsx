import * as React from 'react';
import * as styles from '../style/SpaceBarMenu';
import { Item, NodeType, ActionCategory } from '../types';
import * as cx from 'classnames';
import { ItemComponent } from './ItemComponent';

export type CategoryProps = {
  category: ActionCategory;
  categoryName: string;
  hide?: boolean;
  mouseOver: (name: string) => void;
  addNode: (n: NodeType) => () => void;
  setCurrentHover: (currentHover: Item | null) => void;
};
export class Category extends React.Component<
  CategoryProps,
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
    const { categoryName, category, mouseOver, addNode, hide, setCurrentHover } = this.props;
    return (
      <div
        style={{
          position: 'relative',
          paddingBottom: this.state.paddingBottom
        }}
        className={styles.Category}
      >
        {!hide && (
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
        )}
        {categoryName === category.name && (
          <React.Fragment>
            {!hide && (
              <div
                className={cx({
                  [styles.TriangleCategoryDown]: true,
                  [styles.TriangleHidden]: categoryName !== category.name
                })}
              />
            )}

            {category.items.map((i, index) => (
              <ItemComponent
                addNode={addNode}
                key={index}
                level={0}
                i={i}
                over={this.state.over}
                mouseOver={(o: string, level: number, hoveredItem: Item) => {
                  let over = this.state.over.slice(0, level);
                  over[level] = o;
                  this.setState({
                    over: over
                  });
                  setCurrentHover(hoveredItem);
                }}
                mouseOut={(o: string, level: number, thisItem: Item) => {
                  setCurrentHover(null);
                }}
              />
            ))}
          </React.Fragment>
        )}
      </div>
    );
  }
}
