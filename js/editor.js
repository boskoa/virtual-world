const myCanvas = document.getElementById("myCanvas");
myCanvas.width = 560;
myCanvas.height = 560;

const ctx = myCanvas.getContext("2d");
const graphString = localStorage.getItem("graph");
const graphInfo = graphString ? JSON.parse(graphString) : null;
const graph = graphInfo ? Graph.load(graphInfo) : new Graph();
const world = new World(graph);
const viewport = new Viewport(myCanvas);
const tools = {
  graph: { button: graphBtn, editor: new GraphEditor(viewport, graph) },
  stop: { button: stopBtn, editor: new StopEditor(viewport, world) },
  crossing: {
    button: crossingBtn,
    editor: new CrossingEditor(viewport, world),
  },
  start: { button: startBtn, editor: new StartEditor(viewport, world) },
  parking: { button: parkingBtn, editor: new ParkingEditor(viewport, world) },
  light: { button: lightBtn, editor: new LightEditor(viewport, world) },
  target: { button: targetBtn, editor: new TargetEditor(viewport, world) },
  yield: { button: yieldBtn, editor: new YieldEditor(viewport, world) },
};

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
  for (const tool of Object.values(tools)) {
    tool.editor.display();
  }
  requestAnimationFrame(animate);
}

function dispose() {
  tools["graph"].editor.dispose();
  world.markings.length = 0;
}

function save() {
  localStorage.setItem("graph", JSON.stringify(graph));
}

function setMode(mode) {
  disableEditors();
  tools[mode].button.style.backgroundColor = "rgb(27, 161, 83)";
  tools[mode].button.style.color = "black";
  tools[mode].button.style.boxShadow = "0 0 5px 0 rgb(27, 161, 83)";
  tools[mode].editor.enable();
}

function disableEditors() {
  [...document.querySelectorAll(".dissable")].forEach((e) => {
    e.style.backgroundColor = "darkgray";
    e.style.color = "lightgray";
    e.style.boxShadow = "none";
  });
  for (const tool of Object.values(tools)) {
    tool.editor.disable();
  }
}
