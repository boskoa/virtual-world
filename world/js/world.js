class World {
  constructor(
    graph,
    roadWidth = 100,
    roadRoundness = 10,
    buildingWidth = 150,
    buildingMinLength = 150,
    spacing = 50,
    treeSize = 160
  ) {
    this.graph = graph;
    this.roadWidth = roadWidth;
    this.roadRoundness = roadRoundness;
    this.buildingWidth = buildingWidth;
    this.buildingMinLength = buildingMinLength;
    this.spacing = spacing;
    this.treeSize = treeSize;

    this.buildings = [];
    this.trees = [];
    this.envelopes = [];
    this.roadBorders = [];
    this.laneGuides = [];
    this.markings = [];

    this.cars = [];
    this.bestCar = null;

    this.frameCount = 0;

    this.generate();
  }

  static load(info) {
    const world = new World(new Graph());
    world.graph = Graph.load(info.graph);
    world.roadWidth = info.roadWidth;
    world.roadRoundness = info.roadRoundness;
    world.buildingWidth = info.buildingWidth;
    world.buildingMinLength = info.buildingMinLength;
    world.spacing = info.spacing;
    world.treeSize = info.treeSize;
    world.envelopes = info.envelopes.map((e) => Envelope.load(e));
    world.roadBorders = info.roadBorders.map((b) => new Segment(b.p1, b.p2));
    world.buildings = info.buildings.map((b) => Building.load(b));
    world.trees = info.trees.map((t) => new Tree(t.center, info.treeSize));
    world.laneGuides = info.laneGuides.map((g) => new Segment(g.p1, g.p2));
    world.markings = info.markings.map((m) => Marking.load(m));
    world.zoom = info.zoom;
    world.offset = info.offset;

    return world;
  }

  generate() {
    this.envelopes.length = 0;

    for (const segment of this.graph.segments) {
      this.envelopes.push(
        new Envelope(segment, this.roadWidth, this.roadRoundness)
      );
    }

    this.roadBorders = Polygon.union(this.envelopes.map((e) => e.poly));
    this.buildings = this.#generateBuildings();
    this.trees = this.#generateTrees();

    this.laneGuides.length = 0;
    this.laneGuides.push(...this.#generateLaneGuides());
  }

  #generateBuildings() {
    const tmpEnvelopes = [];
    for (const segment of this.graph.segments) {
      tmpEnvelopes.push(
        new Envelope(
          segment,
          this.roadWidth + this.buildingWidth + this.spacing * 2,
          this.roadRoundness
        )
      );
    }

    const guides = Polygon.union(tmpEnvelopes.map((e) => e.poly));
    for (let i = 0; i < guides.length; i++) {
      const segment = guides[i];
      if (segment.length() < this.buildingMinLength) {
        guides.splice(i, 1);
        i--;
      }
    }

    const supports = [];
    for (const segment of guides) {
      const len = segment.length() + this.spacing;
      const buildingCount = Math.floor(
        len / (this.buildingMinLength + this.spacing)
      );
      const buildingLength = len / buildingCount - this.spacing;

      const dir = segment.directionVector();

      let q1 = segment.p1;
      let q2 = add(q1, scale(dir, buildingLength));
      supports.push(new Segment(q1, q2));

      for (let i = 2; i <= buildingCount; i++) {
        q1 = add(q2, scale(dir, this.spacing));
        q2 = add(q1, scale(dir, buildingLength));
        supports.push(new Segment(q1, q2));
      }
    }

    const bases = [];
    for (const segment of supports) {
      bases.push(new Envelope(segment, this.buildingWidth).poly);
    }

    const eps = 0.001;
    for (let i = 0; i < bases.length - 1; i++) {
      for (let j = i + 1; j < bases.length; j++) {
        if (
          bases[i].intersectsPoly(bases[j]) ||
          bases[i].distanceToPoly(bases[j]) < this.spacing - eps
        ) {
          bases.splice(j, 1);
          j--;
        }
      }
    }

    return bases.map((b) => new Building(b));
  }

  #generateTrees() {
    const points = [
      ...this.roadBorders.map((s) => [s.p1, s.p2]).flat(),
      ...this.buildings.map((b) => b.base.points).flat(),
    ];
    const left = Math.min(...points.map((p) => p.x));
    const right = Math.max(...points.map((p) => p.x));
    const top = Math.min(...points.map((p) => p.y));
    const bottom = Math.max(...points.map((p) => p.y));

    const illegalPolys = [
      ...this.buildings.map((b) => b.base),
      ...this.envelopes.map((e) => e.poly),
    ];
    const trees = [];
    let tryCount = 0;
    while (tryCount < 100) {
      const p = new Point(
        lerp(left, right, Math.random()),
        lerp(top, bottom, Math.random())
      );
      // tree near/inside building/road
      let keep = true;
      for (const poly of illegalPolys) {
        if (
          poly.containsPoint(p) ||
          poly.distanceToPoint(p) < this.treeSize / 2
        ) {
          keep = false;
          break;
        }
      }
      // tree too close to other trees
      if (keep) {
        for (const tree of trees) {
          if (distance(tree.center, p) < this.treeSize) {
            keep = false;
            break;
          }
        }
      }
      // avoid far away trees
      if (keep) {
        let closeToSomething = false;
        for (const poly of illegalPolys) {
          if (poly.distanceToPoint(p) < this.treeSize * 2) {
            closeToSomething = true;
            break;
          }
        }

        keep = closeToSomething;
      }

      if (keep) {
        trees.push(new Tree(p, this.treeSize));
        tryCount = 0;
      }

      tryCount++;
    }

    return trees;
  }

  generateCorridor(start, end, extendEnd = false) {
    const startSegment = getNearestSegment(start, this.graph.segments);
    const endSegment = getNearestSegment(end, this.graph.segments);

    const { point: projectionStart } = startSegment.projectPoint(start);
    const { point: projectionEnd } = endSegment.projectPoint(end);

    this.graph.points.push(projectionStart);
    this.graph.points.push(projectionEnd);

    const tmpSegments = [
      new Segment(startSegment.p1, projectionStart),
      new Segment(projectionStart, startSegment.p2),
      new Segment(endSegment.p1, projectionEnd),
      new Segment(projectionEnd, endSegment.p2),
    ];

    if (startSegment.equals(endSegment)) {
      tmpSegments.push(new Segment(projectionStart, projectionEnd));
    }

    this.graph.segments = this.graph.segments.concat(tmpSegments);

    const path = this.graph.getShortestPath(projectionStart, projectionEnd);

    this.graph.removePoint(this.graph.points.indexOf(projectionStart));
    this.graph.removePoint(this.graph.points.indexOf(projectionEnd));

    const segs = [];

    for (let i = 1; i < path.length; i++) {
      segs.push(new Segment(path[i - 1], path[i]));
    }

    if (extendEnd) {
      const lastSegment = segs[segs.length - 1];
      const lastSegmentDir = lastSegment.directionVector();
      segs.push(
        new Segment(
          lastSegment.p2,
          add(lastSegment.p2, scale(lastSegmentDir, this.roadWidth * 2))
        )
      );
    }

    const tmpEnvelopes = segs.map(
      (s) => new Envelope(s, this.roadWidth, this.roadRoundness)
    );
    if (extendEnd) segs.pop();

    const segments = Polygon.union(tmpEnvelopes.map((e) => e.poly));

    this.corridor = { borders: segments, skeleton: segs };
  }

  #generateLaneGuides() {
    const tmpEnvelopes = [];
    for (const segment of this.graph.segments) {
      tmpEnvelopes.push(
        new Envelope(segment, this.roadWidth / 2, this.roadRoundness)
      );
    }

    const segments = Polygon.union(tmpEnvelopes.map((e) => e.poly));

    return segments;
  }

  #getIntersections() {
    const subset = [];
    for (const point of this.graph.points) {
      let degree = 0;
      for (const seg of this.graph.segments) {
        if (seg.includes(point)) {
          degree++;
        }
      }

      if (degree > 2) {
        subset.push(point);
      }
    }

    return subset;
  }

  #updateLights() {
    const lights = this.markings.filter((m) => m instanceof Light);
    const controlCenters = [];
    for (const light of lights) {
      const point = getNearestPoint(light.center, this.#getIntersections());
      let controlCenter = controlCenters.find((c) => c.equals(point));
      if (!controlCenter) {
        controlCenter = new Point(point.x, point.y);
        controlCenter.lights = [light];
        controlCenters.push(controlCenter);
      } else {
        controlCenter.lights.push(light);
      }
    }
    const greenDuration = 2,
      yellowDuration = 1;
    for (const center of controlCenters) {
      center.ticks = center.lights.length * (greenDuration + yellowDuration);
    }
    const tick = Math.floor(this.frameCount / 60);
    for (const center of controlCenters) {
      const cTick = tick % center.ticks;
      const greenYellowIndex = Math.floor(
        cTick / (greenDuration + yellowDuration)
      );
      const greenYellowState =
        cTick % (greenDuration + yellowDuration) < greenDuration
          ? "green"
          : "yellow";
      for (let i = 0; i < center.lights.length; i++) {
        if (i == greenYellowIndex) {
          center.lights[i].state = greenYellowState;
        } else {
          center.lights[i].state = "red";
        }
      }
    }
    this.frameCount++;
  }

  draw(ctx, viewPoint, showStartMarkings = true, renderRadius = 1000) {
    this.#updateLights();

    for (const envelope of this.envelopes) {
      envelope.draw(ctx, { fill: "#BBB", stroke: "#BBB", lineWidth: 15 });
    }

    for (const marking of this.markings) {
      if (!(marking instanceof Start) || showStartMarkings) {
        marking.draw(ctx);
      }
    }

    for (const segment of this.graph.segments) {
      segment.draw(ctx, { color: "white", width: 4, dash: [10, 10] });
    }

    for (const segment of this.roadBorders) {
      segment.draw(ctx, { color: "white", width: 4 });
    }

    if (this.corridor) {
      for (const segment of this.corridor.borders) {
        segment.draw(ctx, { color: "red", width: 4 });
      }
    }

    ctx.globalAlpha = 0.2;
    for (let i = 0; i < this.cars.length; i++) {
      this.cars[i].draw(ctx);
    }
    ctx.globalAlpha = 1;
    if (this.bestCar) this.bestCar.draw(ctx, true);

    const items = [...this.buildings, ...this.trees].filter(
      (i) => i.base.distanceToPoint(viewPoint) < renderRadius
    );
    items.sort(
      (a, b) =>
        b.base.distanceToPoint(viewPoint) - a.base.distanceToPoint(viewPoint)
    );
    for (const item of items) {
      item.draw(ctx, viewPoint);
    }
  }
}
