class Graph {
  constructor(points = [], segments = []) {
    this.points = points;
    this.segments = segments;
  }

  static load(info) {
    const points = info.points.map((p) => new Point(p.x, p.y));
    const segments = info.segments.map(
      (s) =>
        new Segment(
          points.find((p) => p.equals(s.p1)),
          points.find((p) => p.equals(s.p2)),
          s.oneWay
        )
    );

    return new Graph(points, segments);
  }

  hash() {
    return JSON.stringify(this);
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

  getSegmentsWithPoint(point) {
    const segments = [];
    for (const segment of this.segments) {
      if (segment.includes(point)) {
        segments.push(segment);
      }
    }

    return segments;
  }
  getSegmentsLeavingFromPoint(point) {
    const segments = [];
    for (const segment of this.segments) {
      if (segment.oneWay) {
        if (segment.p1.equals(point)) {
          segments.push(segment);
        }
      } else {
        if (segment.includes(point)) {
          segments.push(segment);
        }
      }
    }

    return segments;
  }

  getShortestPath(start, end) {
    for (const point of this.points) {
      point.dist = Number.MAX_SAFE_INTEGER;
      point.visited = false;
    }

    let currentPoint = start;
    currentPoint.dist = 0;

    while (!end.visited) {
      const segments = this.getSegmentsLeavingFromPoint(currentPoint);
      for (const segment of segments) {
        const otherPoint = segment.p1.equals(currentPoint)
          ? segment.p2
          : segment.p1;
        if (currentPoint.dist + segment.length() < otherPoint.dist) {
          otherPoint.dist = currentPoint.dist + segment.length();
          otherPoint.prev = currentPoint;
        }
      }
      currentPoint.visited = true;

      const unvisited = this.points.filter((p) => !p.visited);
      const dists = unvisited.map((u) => u.dist);
      currentPoint = unvisited.find((u) => u.dist === Math.min(...dists));
    }

    const path = [];
    currentPoint = end;
    while (currentPoint) {
      path.unshift(currentPoint);
      currentPoint = currentPoint.prev;
    }

    for (const point of this.points) {
      delete point.dist;
      delete point.visited;
      delete point.prev;
    }

    return path;
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
