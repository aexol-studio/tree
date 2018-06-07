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
