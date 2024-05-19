class GraphEditor {
  constructor(viewport, graph) {
    this.viewport = viewport;
    this.canvas = viewport.canvas;
    this.graph = graph;

    this.ctx = this.canvas.getContext("2d");

    this.selected = null;
    this.hovered = null;
    this.draggable = false;
    this.mouse = null;
  }

  enable() {
    this.#addEventListeners();
  }

  disable() {
    this.#removeEventListeners();
    this.selected = false;
    this.hovered = false;
  }

  #addEventListeners() {
    this.boundMouseDown = this.#handleMouseDown.bind(this);
    this.boundMouseMove = this.#handleMouseMove.bind(this);
    this.boundMouseUp = () => {
      this.draggable = false;
    };
    this.boundContextMenu = (e) => {
      e.preventDefault();
    };

    this.canvas.addEventListener("mousedown", this.boundMouseDown);
    this.canvas.addEventListener("mousemove", this.boundMouseMove);
    this.canvas.addEventListener("contextmenu", this.boundContextMenu);
    this.canvas.addEventListener("mouseup", this.boundMouseUp);

    window.addEventListener("keydown", (e) => {
      if (e.key === "s") {
        this.start = this.mouse;
      }
      if (e.key === "e") {
        this.end = this.mouse;
      }
      if (this.start && this.end) {
        world.generateCorridor(this.start, this.end);
      }
    });
  }

  #removeEventListeners() {
    this.canvas.removeEventListener("mousedown", this.boundMouseDown);
    this.canvas.removeEventListener("mousemove", this.boundMouseMove);
    this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
    this.canvas.removeEventListener("mouseup", this.boundMouseUp);
  }

  #handleMouseDown(e) {
    if (e.button === 2) {
      if (this.selected) {
        this.selected = null;
      } else if (this.hovered) {
        this.#removePoint(this.hovered);
      }
    }

    if (e.button === 0) {
      if (this.hovered) {
        this.#select(this.hovered);
        this.draggable = true;
        return;
      }

      this.graph.addPoint(this.mouse);
      this.#select(this.mouse);
      this.hovered = this.mouse;
    }
  }

  #handleMouseMove(e) {
    this.mouse = this.viewport.getMouse(e, true);
    this.hovered = getNearestPoint(
      this.mouse,
      this.graph.points,
      20 + this.viewport.zoom * this.viewport.zoom
    );

    if (this.draggable) {
      this.selected.x = this.mouse.x;
      this.selected.y = this.mouse.y;
    }
  }

  #select(point) {
    if (this.selected) {
      this.graph.tryAddSegment(new Segment(this.selected, point));
    }
    this.selected = point;
  }

  #removePoint(point) {
    this.graph.removePoint(this.graph.points.indexOf(point));
    this.hovered = null;
    if (this.selected === point) {
      this.selected = null;
    }
  }

  dispose() {
    this.graph.dispose();
    this.selected = null;
    this.hovered = null;
  }

  display() {
    this.graph.draw(this.ctx);

    if (this.hovered) {
      this.hovered.draw(this.ctx, { fill: true });
    }

    if (this.selected) {
      const intent = this.hovered ?? this.mouse;
      new Segment(this.selected, intent).draw(this.ctx, { dash: [5, 2] });
      this.selected.draw(this.ctx, { outline: true });
    }
    /* 
    if (this.start && this.end) {
      const path = this.graph.getShortestPath(this.start, this.end);
      for (const point of path) {
        point.draw(this.ctx, { size: 50, color: "blue" });
        if (point.prev) {
          new Segment(point, point.prev).draw(this.ctx, { width: 20 });
        }
      }
    }
     */
  }
}
