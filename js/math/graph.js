class Graph {
  constructor(points = [], segments = []) {
    this.points = points;
    this.segments = segments;
  }

  addPoint(point) {
    this.points.push(point);
  }

  tryAddPoint(point) {
    if (!this.containsPoint(point)) {
      this.addPoint(point);
      return true;
    }

    return false;
  }

  containsPoint(point) {
    return this.points.find((p) => p.equals(point));
  }

  removePoint(index) {
    const point = this.points[index];
    this.segments = this.segments.filter(
      (s) => !s.p1.equals(point) && !s.p2.equals(point)
    );

    this.points.splice(index, 1);
  }

  addSegment(segment) {
    this.segments.push(segment);
  }

  tryAddSegment(segment) {
    if (!this.containsSegment(segment) && !segment.p1.equals(segment.p2)) {
      this.addSegment(segment);
      return true;
    }

    return false;
  }

  containsSegment(segment) {
    return this.segments.find((s) => s.equals(segment));
  }

  removeSegment(index) {
    this.segments.splice(index, 1);
  }

  dispose() {
    this.points.length = 0;
    this.segments.length = 0;
  }

  draw(ctx) {
    for (const segment of this.segments) {
      segment.draw(ctx);
    }

    for (const point of this.points) {
      point.draw(ctx);
    }
  }
}
