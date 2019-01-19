import { Coords } from "./Coords";
export interface BoundingBox {
  min: Coords;
  max: Coords;
}
export interface DataObjectInTree<T> {
  data: T;
  bb: BoundingBox;
}

export interface RegionInterface extends BoundingBox {
  intersect: (bb: BoundingBox) => boolean;
  contains: (p: Coords) => boolean;
}

export interface Sides<T> {
  nw: QuadTreeInterface<T>;
  ne: QuadTreeInterface<T>;
  sw: QuadTreeInterface<T>;
  se: QuadTreeInterface<T>;
}

export interface QuadTreeInterface<T> {
  capacity: number;
  bb: RegionInterface;
  objects: DataObjectInTree<T>[];
  sides?: Sides<T>;
  insert: (p: DataObjectInTree<T>) => boolean;
  delete: (data: T, e: Coords) => T | undefined;
  update: (data: T, e: Coords, bb: BoundingBox) => void;
  subdivide: () => void;
  queryRange: (bb: RegionInterface) => T[];
  pick: (e: Coords) => T | undefined;
  pickTree: (e: Coords) => QuadTreeInterface<T> | undefined;
}
