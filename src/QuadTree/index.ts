import { QuadTreeInterface, Sides, RegionInterface } from "../Models/QuadTree";
import { Region } from "./Region";
import { Coords } from "../Models/index";

export class QuadTree<T extends Coords> implements QuadTreeInterface<T> {
  capacity = 30;
  objects: T[] = [];
  sides?: Sides<T>;
  constructor(public bb: Region = new Region()) {}
  insert = (node: T) => {
    if (!this.bb.contains(node)) {
      return false;
    }

    if (this.objects.length < this.capacity && !this.sides) {
      this.objects.push(node);
      return true;
    }
    if (!this.sides) {
      this.subdivide();
    }
    if (this.sides!.nw!.insert(node)) return true;
    if (this.sides!.ne!.insert(node)) return true;
    if (this.sides!.sw!.insert(node)) return true;
    if (this.sides!.se!.insert(node)) return true;
    return false;
  };
  subdivide = () => {
    const c = this.bb.center();
    this.sides = {
      nw: new QuadTree<T>(new Region(this.bb.min, c)),
      ne: new QuadTree<T>(
        new Region(
          {
            x: c.x,
            y: this.bb.min.y
          },
          {
            x: this.bb.max.x,
            y: c.y
          }
        )
      ),
      sw: new QuadTree<T>(
        new Region(
          {
            x: this.bb.min.x,
            y: c.y
          },
          {
            x: c.x,
            y: this.bb.max.y
          }
        )
      ),
      se: new QuadTree<T>(new Region(c, this.bb.max))
    };
  };
  queryRange = (bb: RegionInterface) => {
    const objectsInRange: T[] = [];
    if (!this.bb.intersect(bb)) return objectsInRange;
    for (const o of this.objects) {
      bb.contains(o) && objectsInRange.push(o);
    }
    if (!this.sides) return objectsInRange;
    const { nw, ne, sw, se } = this.sides;
    return objectsInRange
      .concat(nw!.queryRange(bb))
      .concat(ne!.queryRange(bb))
      .concat(se!.queryRange(bb))
      .concat(sw!.queryRange(bb));
  };
}
