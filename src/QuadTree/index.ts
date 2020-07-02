import {
  QuadTreeInterface,
  Sides,
  RegionInterface,
  BoundingBox,
  DataObjectInTree,
} from "@models";
import { Region } from "./Region";
import { Coords } from "@models";
export { Region };
export class QuadTree<T> implements QuadTreeInterface<T> {
  objects: DataObjectInTree<T>[] = [];
  sides?: Sides<T>;
  constructor(
    public bb: Region = new Region(),
    public capacity: number = 50,
    public maxDepth = 10,
    public depth = 0
  ) {}
  insert = (node: DataObjectInTree<T>) => {
    if (!this.bb.intersect(node.bb)) {
      return false;
    }

    if (
      (this.objects.length < this.capacity && !this.sides) ||
      this.depth === this.maxDepth
    ) {
      this.objects.push(node);
      return true;
    }
    if (!this.sides) {
      this.subdivide();
    }
    let insertedNode = false;
    if (!this.sides) {
      throw new Error("Cannot subdivide sides");
    }
    if (this.sides.nw.insert(node)) insertedNode = true;
    if (this.sides.ne.insert(node)) insertedNode = true;
    if (this.sides.sw.insert(node)) insertedNode = true;
    if (this.sides.se.insert(node)) insertedNode = true;
    return insertedNode;
  };
  delete = (data: T, e: Coords) => {
    const tree = this.pickTree({
      ...e,
    })!;
    let index = 0;
    for (const o of tree.objects) {
      if (o.data === data) tree.objects.splice(index, 1)[0].data;
      index++;
    }
  };
  update = (data: T, e: Coords, bb: BoundingBox) => {
    this.delete(data, e);
    this.insert({
      data,
      bb,
    });
  };
  subdivide = () => {
    const c = this.bb.center();
    this.sides = {
      nw: new QuadTree<T>(
        new Region(this.bb.min, c),
        this.capacity,
        this.maxDepth,
        this.depth + 1
      ),
      ne: new QuadTree<T>(
        new Region(
          {
            x: c.x,
            y: this.bb.min.y,
          },
          {
            x: this.bb.max.x,
            y: c.y,
          }
        ),
        this.capacity,
        this.maxDepth,
        this.depth + 1
      ),
      sw: new QuadTree<T>(
        new Region(
          {
            x: this.bb.min.x,
            y: c.y,
          },
          {
            x: c.x,
            y: this.bb.max.y,
          }
        ),
        this.capacity,
        this.maxDepth,
        this.depth + 1
      ),
      se: new QuadTree<T>(
        new Region(c, this.bb.max),
        this.capacity,
        this.maxDepth,
        this.depth + 1
      ),
    };
    for (const object of this.objects) this.insert(object);
  };
  queryRange = (bb: RegionInterface) => {
    const objectsInRange: T[] = [];
    if (!this.bb.intersect(bb)) return objectsInRange;
    for (const o of this.objects) {
      bb.intersect(o.bb) && objectsInRange.push(o.data);
    }

    if (!this.sides) return objectsInRange;
    const { nw, ne, sw, se } = this.sides;
    const allObjectsInRange = objectsInRange
      .concat(nw.queryRange(bb))
      .concat(ne.queryRange(bb))
      .concat(se.queryRange(bb))
      .concat(sw.queryRange(bb));
    return allObjectsInRange.filter(
      (o, i) => allObjectsInRange.indexOf(o) === i
    );
  };
  pick = (e: Coords) => {
    const goToTree = this.pickTree(e)!;
    const objectInRegion = (o: DataObjectInTree<T>) =>
      Region.regionContains(o.bb, e);
    const returnedObjects = goToTree.objects.filter(objectInRegion);
    if (returnedObjects.length > 0)
      return returnedObjects[returnedObjects.length - 1].data;
  };
  pickTree = (e: Coords): QuadTreeInterface<T> | undefined => {
    if (!this.sides) {
      if (this.bb.contains(e)) {
        return this;
      }
      return;
    }
    return (
      this.sides.ne.pickTree(e) ||
      this.sides.nw.pickTree(e) ||
      this.sides.se.pickTree(e) ||
      this.sides.sw.pickTree(e)!
    );
  };
}
