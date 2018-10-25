import * as React from 'react';
import * as styles from './style/SpaceBarMenu';
import { Item, NodeType } from '../types';

export class ItemComponent extends React.Component<{
  i: Item;
  mouseOver: (name: string, level: number, i: Item) => void;
  mouseOut: (name: string, level: number, i: Item) => void;
  over: string[];
  level: number;
  addNode: (n: NodeType) => () => void;
  setCurrentHover: (currentHover: Item | null) => void;
}> {
  item: HTMLDivElement;
  render() {
    const { i, mouseOver, mouseOut, over, addNode, level, setCurrentHover } = this.props;
    return (
      <React.Fragment>
        <div
          ref={(e) => {
            this.item = e;
          }}
          className={styles.Item}
          onClick={() => {
            if (i.action) {
              setCurrentHover(null);
              i.action();
            }
            if (i.node) {
              setCurrentHover(null);
              addNode(i.node)();
            }
          }}
          onMouseOver={() => {
            mouseOver(i.name, level, i);
          }}
          onMouseOut={() => {
            mouseOut(i.name, level, i);
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
                      marginBottom: -this.item.offsetHeight * i.items.length
                    }
                  : {}
              }
            >
              {i.items.map((i, index) => (
                <ItemComponent
                  setCurrentHover={setCurrentHover}
                  i={i}
                  key={index}
                  mouseOver={mouseOver}
                  mouseOut={mouseOut}
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
