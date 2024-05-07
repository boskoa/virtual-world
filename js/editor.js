const myCanvas = document.getElementById("myCanvas");
myCanvas.width = 560;
myCanvas.height = 560;

const ctx = myCanvas.getContext("2d");

const p1 = new Point(200, 200);
const p2 = new Point(500, 200);
const p3 = new Point(400, 400);
const p4 = new Point(100, 300);

const s1 = new Segment(p1, p2);
const s2 = new Segment(p1, p3);
const s3 = new Segment(p1, p4);
const s4 = new Segment(p2, p3);

const graph = new Graph([p1, p2, p3, p4], [s1, s2, s3, s4]);
const graphEditor = new GraphEditor(myCanvas, graph);

animate();

function animate() {
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  graphEditor.display();
  requestAnimationFrame(animate);
}

/* 
graph.draw(ctx);

function addRandomPoint() {
  const success = graph.tryAddPoint(
    new Point(
      Math.floor(Math.random() * myCanvas.width),
      Math.floor(Math.random() * myCanvas.height)
    )
  );

  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  graph.draw(ctx);
}

function addRandomSegment() {
  const index1 = Math.floor(Math.random() * graph.points.length);
  const index2 = Math.floor(Math.random() * graph.points.length);
  const success = graph.tryAddSegment(
    new Segment(graph.points[index1], graph.points[index2])
  );

  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  graph.draw(ctx);
}

function removeRandomSegment() {
  if (!graph.segments.length) {
    return;
  }
  const index = Math.floor(Math.random() * graph.segments.length);
  graph.removeSegment(index);

  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  graph.draw(ctx);
}

function removeRandomPoint() {
  if (!graph.points.length) {
    return;
  }
  const index = Math.floor(Math.random() * graph.points.length);
  graph.removePoint(index);

  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  graph.draw(ctx);
}

function removeAll() {
  graph.dispose();

  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  graph.draw(ctx);
}
 */
