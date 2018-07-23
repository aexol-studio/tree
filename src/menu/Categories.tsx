import * as React from 'react';
import * as styles from '../style/SpaceBarMenu';
import { NodeType, ActionCategory } from '../types';
import { Category } from "./Category";
export type CategoriesProps = {
  categories: ActionCategory[];
  category: string;
  style: any;
  refFunction: React.Ref<HTMLDivElement>;
  mouseOver: (name: string) => void;
  addNode: (n: NodeType) => () => void;
};

export class Categories extends React.Component<CategoriesProps, { over: string[] }> {
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
