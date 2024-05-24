const myVideo = document.createElement("video");
const ctx = myCanvas.getContext("2d", { willReadFrequently: true });
const markerDetector = new MarkerDetector();

function distance(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function loop() {
  ctx.drawImage(myVideo, 0, 0, myCanvas.width, myCanvas.height);
  const imgData = ctx.getImageData(0, 0, myCanvas.width, myCanvas.height);
  const res = markerDetector.detect(imgData);
  if (res) {
    ctx.fillStyle = "red";
    for (const point of res.leftMarker.points) {
      ctx.fillRect(point.x, point.y, 1, 1);
    }

    ctx.fillStyle = "yellow";
    for (const point of res.rightMarker.points) {
      ctx.fillRect(point.x, point.y, 1, 1);
    }
  }
  requestAnimationFrame(loop);
}

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((rawData) => {
    myVideo.srcObject = rawData;
    myVideo.play();
    myVideo.onloadeddata = () => {
      myCanvas.width = myVideo.videoWidth;
      myCanvas.height = myVideo.videoHeight;
      loop();
    };
  })
  .catch((e) => alert(e));
