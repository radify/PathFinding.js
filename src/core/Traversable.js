import Box from "geometry/Box";
import Line from "geometry/Line";
import Point from "geometry/Point";

class Traversable {

  constructor(obstacles: Array<Box>) {
    this.directions = [
      { x:  0, y:  1 },
      { x:  0, y: -1 },
      { x:  1, y:  0 },
      { x:  1, y:  1 },
      { x:  1, y: -1 },
      { x: -1, y:  0 },
      { x: -1, y:  1 },
      { x: -1, y: -1 }
    ];
    Object.assign(this, { obstacles });
  }

  step(start: Point, step: number): Array<Point> {
    var { round, cos, sin, atan2, PI } = Math;
    var isDiag  = (dir) => (dir.x && dir.y);
    var toDeg   = (dir) => atan2(dir.y, dir.x) * (180 / PI);
    var toRad   = (deg) => [round(cos(deg)) * step, round(sin(deg)) * step];
    var toPoint = (dir) => isDiag(dir) ? toRad(toDeg(dir)) : [dir.x * step, dir.y * step];
    var addTo   = (pt)  => { return (dir) => pt.add(new Point(...toPoint(dir))); };
    return this.directions.map(addTo(start)).filter(this.from(start));
  }

  intersects(line: Line): Function {
  	return (box) => line.intersects(box);
  }

  from(from: Point): Function {
    return (to) => this.traverse(from, to);
  }

  traverse(from: Point, to: Point): boolean {
    return this.obstacles.map(this.intersects(new Line(from, to))).indexOf(true) === -1;
  }
}

export default Traversable;