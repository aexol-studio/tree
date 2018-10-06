import * as React from 'react';
import * as styles from '../style/SpaceBarMenu';
import { ActionCategory, Item, NodeType } from '../types';
import { Category } from './Category';
export type CategoriesProps = {
  categories: ActionCategory[];
  category: string;
  style: any;
  refFunction: React.Ref<HTMLDivElement>;
  mouseOver: (name: string) => void;
  addNode: (n: NodeType) => () => void;
  setCurrentHover: (currentHover: Item | null) => void;
};

export class Categories extends React.Component<CategoriesProps, { over: string[] }> {
  state = {
    over: [],
    paddingBottom: 0
  };
  render() {
    const {
      categories,
      category,
      style,
      refFunction,
      mouseOver,
      addNode,
      setCurrentHover
    } = this.props;
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
            setCurrentHover={setCurrentHover}
          />
        ))}
      </div>
    );
  }
}
