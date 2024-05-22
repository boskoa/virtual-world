class PhoneControls {
  constructor(canvas) {
    this.canvas = canvas;
    this.tilt = 0;
    this.forward = true;
    this.reverse = false;
    this.canvasAngle = 0;
    this.#addEventListeners();
  }

  #addEventListeners() {
    /*     
    window.addEventListener("deviceorientation", (e) => {
      this.tilt = e.beta * (Math.PI / 180);
      const canvasAngle = -this.tilt;
      this.canvas.style.transform = `rotate(${canvasAngle}rad)`;
    });
    */
    window.addEventListener("devicemotion", (e) => {
      this.tilt = Math.atan2(
        e.accelerationIncludingGravity.y,
        e.accelerationIncludingGravity.x
      );
      const newCanvasAngle = -this.tilt;
      this.canvasAngle = this.canvasAngle * 0.6 + newCanvasAngle * 0.4;
      this.canvas.style.transform = `rotate(${this.canvasAngle}rad)`;
    });

    window.addEventListener("touchstart", () => {
      this.forward = false;
      this.reverse = true;
    });

    window.addEventListener("touchend", () => {
      this.forward = true;
      this.reverse = false;
    });
  }
}
