import { Coords } from "./Coords";
export interface BoundingBox {
  min: Coords;
  max: Coords;
}

export interface RegionInterface extends BoundingBox {
  intersect: <T extends BoundingBox>(bb: T) => boolean;
  contains: <T extends Coords>(p: T) => boolean;
}

export interface Sides<T extends BoundingBox> {
  nw: QuadTreeInterface<T>;
  ne: QuadTreeInterface<T>;
  sw: QuadTreeInterface<T>;
  se: QuadTreeInterface<T>;
}

export interface QuadTreeInterface<T extends BoundingBox> {
  capacity: number;
  bb: RegionInterface;
  objects: T[];
  sides?: Sides<T>;
  insert: (p: T) => boolean;
  delete: (f: (comparedObject: T) => boolean) => void;
  subdivide: () => void;
  queryRange: (bb: RegionInterface) => T[];
  pick: (e: Coords) => T | undefined;
}
