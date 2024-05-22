const phoneCanvas = document.getElementById("phoneCanvas");
const ctx = phoneCanvas.getContext("2d");

let rotation = 0;
const controls = new PhoneControls(phoneCanvas);

animate();

function animate() {
  ctx.clearRect(0, 0, phoneCanvas.width, phoneCanvas.height);
  ctx.beginPath();
  ctx.ellipse(
    phoneCanvas.width / 2,
    phoneCanvas.height / 2,
    100,
    50,
    rotation,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  requestAnimationFrame(animate);
}
