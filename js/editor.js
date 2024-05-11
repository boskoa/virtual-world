const myCanvas = document.getElementById("myCanvas");
myCanvas.width = 560;
myCanvas.height = 560;

const ctx = myCanvas.getContext("2d");
/* 
const p1 = new Point(200, 200);
const p2 = new Point(500, 200);
const p3 = new Point(400, 400);
const p4 = new Point(100, 300);

const s1 = new Segment(p1, p2);
const s2 = new Segment(p1, p3);
const s3 = new Segment(p1, p4);
const s4 = new Segment(p2, p3);
 */
const graphString = localStorage.getItem("graph");
const graphInfo = graphString ? JSON.parse(graphString) : null;
const graph = graphInfo ? Graph.load(graphInfo) : new Graph();
const world = new World(graph);
const viewport = new Viewport(myCanvas);
const graphEditor = new GraphEditor(viewport, graph);

let oldGraphHash = graph.hash();

setMode("graph");

animate();

function animate() {
  viewport.reset();

  if (graph.hash() !== oldGraphHash) {
    world.generate();
    oldGraphHash = graph.hash();
  }

  const viewPoint = scale(viewport.getOffset(), -1);
  world.draw(ctx, viewPoint);
  ctx.globalAlpha = 0.3;
  graphEditor.display();
  requestAnimationFrame(animate);
}

function dispose() {
  graphEditor.dispose();
}

function save() {
  localStorage.setItem("graph", JSON.stringify(graph));
}

function setMode(mode) {
  disableEditors();
  switch (mode) {
    case "graph":
      graphBtn.style.backgroundColor = "rgb(27, 161, 83)";
      graphBtn.style.color = "black";
      graphBtn.style.boxShadow = "0 0 5px 0 rgb(27, 161, 83)";
      break;
    case "stop":
      stopBtn.style.backgroundColor = "rgb(27, 161, 83)";
      stopBtn.style.color = "black";
      stopBtn.style.boxShadow = "0 0 5px 0 rgb(27, 161, 83)";
      break;
    default:
      return;
  }
}

function disableEditors() {
  [...document.querySelectorAll(".dissable")].forEach((e) => {
    e.style.backgroundColor = "darkgray";
    e.style.color = "lightgray";
    e.style.boxShadow = "none";
  });
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
