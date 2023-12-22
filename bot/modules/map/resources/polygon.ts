import pointInPolygon from "point-in-polygon";
import Point from "./point";

export default class Polygon {
  public points: Point[];

  constructor(points: Point[]) {
    this.points = points;
  }

  public isInside(point: Point) {
    const p = [point.x, point.z];
    const polygon = this.points.map((p) => [p.x, p.z]);

    const out = pointInPolygon(p, polygon);

    return out;
  }

  public calcuateChunkArea() {
   
    let area = 0;

    const minX = Math.min(...this.points.map((p) => p.x));
    const maxX = Math.max(...this.points.map((p) => p.x));
    const minZ = Math.min(...this.points.map((p) => p.z));
    const maxZ = Math.max(...this.points.map((p) => p.z));

    for (let x = minX; x < maxX; x += 16) {
      for (let z = minZ; z < maxZ; z += 16) {
        if (this.isInside(new Point(x, z))) {
          area += 1;
        }
      }
    }

    return area;

  }
}
