import {
  QuadTreeInterface,
  Sides,
  RegionInterface,
  BoundingBox
} from "../Models/QuadTree";
import { Region } from "./Region";
import { Coords } from "../Models/index";

export class QuadTree<T extends BoundingBox> implements QuadTreeInterface<T> {
  capacity = 30;
  objects: T[] = [];
  sides?: Sides<T>;
  constructor(public bb: Region = new Region()) {}
  insert = (node: T) => {
    if (!this.bb.intersect(node)) {
      return false;
    }

    if (this.objects.length < this.capacity && !this.sides) {
      this.objects.push(node);
      return true;
    }
    if (!this.sides) {
      this.subdivide();
    }
    let insertedNode = false;
    if (this.sides!.nw.insert(node)) insertedNode = true;
    if (this.sides!.ne.insert(node)) insertedNode = true;
    if (this.sides!.sw.insert(node)) insertedNode = true;
    if (this.sides!.se.insert(node)) insertedNode = true;
    return insertedNode;
  };
  delete = (deleteFunction: (comparedObject: T) => boolean) => {
    const deletedObject = this.objects.findIndex(deleteFunction);
    if (deletedObject) return this.objects.splice(deletedObject, 1);
    if (!this.sides) return;
    this.sides.ne.delete(deleteFunction);
    this.sides.nw.delete(deleteFunction);
    this.sides.se.delete(deleteFunction);
    this.sides.sw.delete(deleteFunction);
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
      bb.intersect(o) && objectsInRange.push(o);
    }
    if (!this.sides) return objectsInRange;
    const { nw, ne, sw, se } = this.sides;
    let allObjectsInRange = objectsInRange
      .concat(nw!.queryRange(bb))
      .concat(ne!.queryRange(bb))
      .concat(se!.queryRange(bb))
      .concat(sw!.queryRange(bb));
    return allObjectsInRange.filter(
      (o, i) => allObjectsInRange.indexOf(o) === i
    );
  };
  pick = (e: Coords) => {
    const objectInRegion = <T extends BoundingBox>(r: T) =>
      Region.regionContains(r, e);
    if (!this.bb.contains(e)) return undefined;
    this.objects.reverse();
    const returnedObjects = this.objects.filter(objectInRegion);
    if (returnedObjects.length > 0)
      return returnedObjects[returnedObjects.length - 1];
    if (!this.sides) return undefined;
    return (
      this.sides.ne!.pick(e) ||
      this.sides.nw!.pick(e) ||
      this.sides.se!.pick(e) ||
      this.sides.sw!.pick(e)
    );
  };
}
