import { Coords } from "./Coords";

export interface RegionInterface {
  min: Coords;
  max: Coords;
  intersect: (bb: RegionInterface) => boolean;
  contains: <T extends Coords>(p: T) => boolean;
}

export interface Sides<T extends Coords> {
  nw?: QuadTreeInterface<T>;
  ne?: QuadTreeInterface<T>;
  sw?: QuadTreeInterface<T>;
  se?: QuadTreeInterface<T>;
}

export interface QuadTreeInterface<T extends Coords> {
  capacity: number;
  bb: RegionInterface;
  objects: T[];
  sides?: Sides<T>;
  insert: (p: T) => boolean;
  subdivide: () => void;
  queryRange: (bb: RegionInterface) => T[];
}
