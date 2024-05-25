class MiniMap {
  constructor(canvas, graph, size, cars) {
    this.canvas = canvas;
    this.graph = graph;
    this.size = size;
    this.cars = cars;

    canvas.width = size;
    canvas.height = size;

    this.ctx = canvas.getContext("2d");
  }

  update(viewPoint) {
    this.ctx.clearRect(0, 0, this.size, this.size);

    const scaler = 0.05;
    const scaledViewPoint = scale(viewPoint, -scaler);
    this.ctx.save();
    this.ctx.translate(
      scaledViewPoint.x + this.size / 2,
      scaledViewPoint.y + this.size / 2
    );
    this.ctx.scale(scaler, scaler);

    for (const segment of this.graph.segments) {
      segment.draw(this.ctx, { width: 3 / scaler, color: "white" });
    }

    for (const car of this.cars) {
      this.ctx.beginPath();
      this.ctx.arc(car.x, car.y, 5 / scaler, 0, Math.PI * 2);
      this.ctx.fillStyle = "rgba(200, 50, 30, 0.9)";
      this.ctx.lineWidth = 2 / scaler;
      this.ctx.fill();
      this.ctx.stroke();
    }

    this.ctx.restore();

    new Point(this.size / 2, this.size / 2).draw(this.ctx, {
      color: "blue",
      outline: "yellow",
    });
  }
}
