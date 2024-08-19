import { RegionInterface, BoundingBox } from '@/models';
import { Coords } from '@/models';

const MAX_INFINITY = 100000000000000000000;

export class Region implements RegionInterface {
  constructor(
    public min: Coords = { x: -MAX_INFINITY, y: -MAX_INFINITY },
    public max: Coords = { x: MAX_INFINITY, y: MAX_INFINITY },
  ) {}
  center = (): Coords => {
    return {
      x: (this.min.x + this.max.x) / 2.0,
      y: (this.min.y + this.max.y) / 2.0,
    };
  };
  intersect = (bb: BoundingBox) =>
    !(this.max.x < bb.min.x || bb.max.x < this.min.x || this.max.y < bb.min.y || bb.max.y < this.min.y);
  contains = (p: Coords): boolean => Region.regionContains(this, p);
  static regionContains = <T extends BoundingBox>(region: T, p: Coords): boolean =>
    region.min.x <= p.x && p.x <= region.max.x && region.min.y <= p.y && p.y <= region.max.y;
}
