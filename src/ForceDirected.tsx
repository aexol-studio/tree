import { NodeType, LinkType } from './types';
export class Vector {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  static random = () => new Vector(Math.random() * 1000.0 - 500.0, Math.random() * 1000.0 - 500.0);
  add = (v: Vector): Vector => new Vector(this.x + v.x, this.y + v.y);
  subtract = (v: Vector): Vector => new Vector(this.x - v.x, this.y - v.y);
  multiply = (n: number): Vector => new Vector(this.x * n, this.y * n);
  divide = (n: number): Vector => new Vector(this.x / n || 0, this.y / n || 0);
  magnitude = (): number => Math.sqrt(this.x * this.x + this.y * this.y);
  normal = () => new Vector(-this.y, this.x);
  normalize = () => this.divide(this.magnitude());
}
export class Point {
  p: Vector;
  mass: number;
  v = new Vector(0, 0);
  a = new Vector(0, 0);
  constructor(position: Vector, mass: number) {
    this.p = position;
    this.mass = mass;
  }
  applyForce = (force: Vector) => {
    this.a = this.a.add(force.divide(this.mass));
  };
}

export class Spring {
  point1: Point;
  point2: Point;
  length: number;
  k: number;
  constructor(point1, point2, length, k) {
    this.point1 = point1;
    this.point2 = point2;
    this.length = length;
    this.k = k;
  }
}
export class ForceDirected {
  stiffness = 1.0;
  repulsion = 400000.0;
  damping = 0.25;
  minEnergyThreshold = 3.5;
  maxSpeed = Infinity;
  maxDistance = 200.0;
  springLength = 230.0;
  minimumXDistance = 1.0;
  energy = 0;
  _stop = false;
  _started = false;
  nodePoints: {
    [x: string]: Point;
  } = {};
  edgeSprings: {
    [x: string]: Spring;
  } = {};
  nodes: NodeType[];
  links: LinkType[];
  constructor(nodes: NodeType[], links: LinkType[]) {
    this.nodes = nodes;
    this.links = links;
  }
  getNewNodes = (): NodeType[] =>
    this.nodes.map((n) => ({
      ...n,
      x: this.nodePoints[n.id].p.x,
      y: this.nodePoints[n.id].p.y
    }));
  simulate: (resolve: (nodes: NodeType[]) => void) => void = (resolve) => {
    if (this._started) {
      return;
    }
    this.energy = 0;
    this._started = true;
    this._stop = false;
    const update = () => {
      this.tick();
      resolve(this.getNewNodes());
      if (this._stop || this.energy < this.minEnergyThreshold) {
        this._started = false;
      } else {
        window.requestAnimationFrame(update);
      }
    };
    window.requestAnimationFrame(update);
  };
  simulateRec: (resolve: (nodes: NodeType[]) => void) => void = (resolve) => {
    if (this._started) {
      return;
    }
    this.energy = 0;
    this._started = true;
    this._stop = false;
    let operations = 0;
    const sim = () => {
      this.tick();
      if (this._stop || operations > 1000 || this.energy < this.minEnergyThreshold) {
        this._started = false;
        console.log(`Operations:${operations}`);
        return resolve(this.getNewNodes());
      } else {
        operations++;
        return sim();
      }
    };
    sim();
  };
  stop = () => {
    this._stop = true;
  };
  tick = () => {
    this.applyCoulombsLaw();
    this.applyHookesLaw();
    // this.attractToCenter();
    this.updateVelocity();
    this.updatePosition();
  };
  point = (node: NodeType): Point => {
    if (!(node.id in this.nodePoints)) {
      this.nodePoints[node.id] = new Point(new Vector(node.x, node.y), 1.0);
    }
    return this.nodePoints[node.id];
  };
  spring = (link: LinkType) => {
    const uniqueId = `${link.from.portId}-${link.to.portId}`;
    if (!(uniqueId in this.edgeSprings)) {
      return new Spring(
        this.point(this.nodes.find((n) => n.id === link.from.nodeId)),
        this.point(this.nodes.find((n) => n.id === link.to.nodeId)),
        this.springLength,
        this.stiffness
      );
    }
    return this.edgeSprings[uniqueId];
  };

  gravity = () => {};

  applyCoulombsLaw = () => {
    for (const node of this.nodes) {
      const p1 = this.point(node);
      for (const node2 of this.nodes) {
        const p2 = this.point(node2);
        if (p1 !== p2) {
          const d = p1.p.y - p2.p.y;
          const dx = Math.abs(p1.p.x - p2.p.x);
          const distance = Math.abs(d) + 10.0;
          if (distance < this.maxDistance && dx < this.minimumXDistance*20) {
            const direction = new Vector(0.0, d < 0 ? -1 : 1);
            p1.applyForce(
              direction.multiply(this.repulsion).divide(distance * distance * distance * 0.5)
            );
            p2.applyForce(
              direction.multiply(this.repulsion).divide(distance * distance * distance * -0.5)
            );
          }
        }
      }
    }
  };

  applyHookesLaw = () => {
    for (const link of this.links) {
      const spring = this.spring(link);
      const d = spring.point2.p.x - spring.point1.p.x;
      const distance = Math.abs(d);
      if (Math.abs(this.springLength - distance) < this.minimumXDistance) {
        continue;
      }
      const displacement = spring.length - distance;
      const direction = new Vector(d < 0 ? -1 : 1, 0);
      spring.point1.applyForce(direction.multiply(spring.k * displacement * -0.5));
      spring.point2.applyForce(direction.multiply(spring.k * displacement * 0.5));
    }
  };

  attractToCenter = () => {
    for (const node of this.nodes) {
      const point = this.point(node);
      const direction = point.p.multiply(-1.0);
      point.applyForce(direction.multiply(this.repulsion / 50.0));
    }
  };

  updateVelocity = () => {
    this.energy = 0;
    for (const node of this.nodes) {
      const point = this.point(node);
      point.v = point.v.add(point.a);
      const magnitude = point.v.magnitude();
      this.energy = this.energy > magnitude ? this.energy : magnitude;
      if (magnitude > this.maxSpeed) {
        point.v = point.v.normalize().multiply(this.maxSpeed);
      }
      point.a = new Vector(0, 0);
      point.v = point.v.multiply(this.damping);
    }
  };

  updatePosition = () => {
    for (const node of this.nodes) {
      const point = this.point(node);
      point.p = point.p.add(point.v);
    }
  };
}
