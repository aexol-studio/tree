import { RegionInterface } from "../Models/QuadTree";
import { Coords } from "../Models/index";

export class Region implements RegionInterface {
  constructor(
    public min: Coords = { x: Infinity, y: Infinity },
    public max: Coords = { x: Infinity, y: Infinity }
  ) {}
  center = (): Coords => {
    return {
      x: (this.min.x + this.max.x) / 2.0,
      y: (this.min.y + this.max.y) / 2.0
    };
  };
  intersect = (bb: RegionInterface) =>
    this.contains(bb.min) || this.contains(bb.max);
  contains = (p: Coords) =>
    this.min.x <= p.x &&
    p.x <= this.max.x &&
    this.min.y <= p.y &&
    p.y <= this.max.y;
}
