import { RegionInterface, BoundingBox } from "../Models/QuadTree";
import { Coords } from "../Models/index";

export class Region implements RegionInterface {
  constructor(
    public min: Coords = { x: -Infinity, y: -Infinity },
    public max: Coords = { x: Infinity, y: Infinity }
  ) {}
  center = (): Coords => {
    return {
      x: (this.min.x + this.max.x) / 2.0,
      y: (this.min.y + this.max.y) / 2.0
    };
  };
  intersect = <T extends BoundingBox>(bb: T) =>
    !(
      this.max.x < bb.min.x ||
      bb.max.x < this.min.x ||
      this.max.y < bb.min.y ||
      bb.max.y < this.min.y
    );
  contains = (p: Coords) => Region.regionContains(this, p);
  static regionContains = <T extends BoundingBox>(region: T, p: Coords) =>
    region.min.x <= p.x &&
    p.x <= region.max.x &&
    region.min.y <= p.y &&
    p.y <= region.max.y;
}
