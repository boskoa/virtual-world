class Viewport {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.zoom = 1;
    this.center = new Point(canvas.width / 2, canvas.height / 2);
    this.offset = scale(this.center, -1);
    this.drag = {
      start: new Point(0, 0),
      end: new Point(0, 0),
      offset: new Point(0, 0),
      active: false,
    };

    this.#addEventListeners();
  }

  reset() {
    this.ctx.restore();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.center.x, this.center.y);
    this.ctx.scale(1 / this.zoom, 1 / this.zoom);
    const offset = this.getOffset();
    this.ctx.translate(offset.x, offset.y);
  }

  getMouse(e, subtractDragOffset = false) {
    const p = new Point(
      (e.offsetX - this.center.x) * this.zoom - this.offset.x,
      (e.offsetY - this.center.y) * this.zoom - this.offset.y
    );

    return subtractDragOffset ? subtract(p, this.drag.offset) : p;
  }

  getOffset() {
    return add(this.offset, this.drag.offset);
  }

  #addEventListeners() {
    this.canvas.addEventListener("wheel", this.#handleMouseWheel.bind(this));
    this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.#handleMouseUp.bind(this));
  }

  #handleMouseDown(e) {
    if (e.button === 2) {
      this.drag.start = this.getMouse(e);
      this.drag.active = true;
    }
  }

  #handleMouseMove(e) {
    if (this.drag.active) {
      this.drag.end = this.getMouse(e);
      this.drag.offset = subtract(this.drag.end, this.drag.start);
    }
  }

  #handleMouseUp() {
    if (this.drag.active) {
      this.offset = add(this.offset, this.drag.offset);
      this.drag = {
        start: new Point(0, 0),
        end: new Point(0, 0),
        offset: new Point(0, 0),
        active: false,
      };
    }
  }

  #handleMouseWheel(e) {
    const sign = Math.sign(e.deltaY);
    const step = 0.1;
    this.zoom += sign * step;
    this.zoom = Math.max(1, Math.min(5, this.zoom));
  }
}
