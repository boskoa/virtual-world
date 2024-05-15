const carCanvas = document.getElementById("carCanvas");
carCanvas.width = window.innerWidth - 330;
carCanvas.height = window.innerHeight;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;
networkCanvas.height = window.innerHeight - 300;
const miniMapCanvas = document.getElementById("miniMapCanvas");
miniMapCanvas.width = 300;
miniMapCanvas.height = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
/* 
const worldString = localStorage.getItem("world");
const worldInfo = worldString ? JSON.parse(worldString) : null;
const world = worldInfo ? World.load(worldInfo) : new World(new Graph());
 */
const viewport = new Viewport(carCanvas, world.zoom, world.offset);
const miniMap = new MiniMap(miniMapCanvas, world.graph, 300);

const N = 1;
const trafficCount = 20;
const positions = getPositions(trafficCount);
const cars = generateCars(N);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
  cars.forEach((car, i) => {
    car.brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i !== 0) {
      NeuralNetwork.mutate(car.brain, 0.2);
    }
  });
}

const traffic =
  []; /* [...new Array(trafficCount)].map((i) => (i = generateDummy())) */
const roadBorders = world.roadBorders.map((s) => [s.p1, s.p2]);

animate();

function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
  localStorage.removeItem("bestBrain");
}

function generateCars(N) {
  const startPoints = world.markings.filter((m) => m instanceof Start);
  const startPoint = startPoints.length
    ? startPoints[0].center
    : new Point(100, 100);
  const dir = startPoints.length
    ? startPoints[0].directionVector
    : new Point(0, -1);
  const startAngle = -angle(dir) + Math.PI / 2;
  const cars = [];
  for (let i = 0; i < N; i++) {
    cars.push(
      new Car(startPoint.x, startPoint.y, 30, 50, "AI", startAngle, 3, "blue")
    );
  }

  return cars;
}

function generateDummy() {
  const position = positions.splice(
    Math.round(Math.random() * (positions.length - 1)),
    1
  )[0];

  const car = new Car(
    road.getLaneCenter(getRandomLane(road.laneCount)),
    position,
    30,
    50,
    "DUMMY",
    2,
    getRandomColor()
  );

  return car;
}

function animate(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(roadBorders, []);
  }

  for (let i = 0; i < cars.length; i++) {
    cars[i].update(roadBorders, traffic);
  }

  bestCar = cars.find(
    (c) => c.fittness === Math.max(...cars.map((a) => a.fittness))
  );

  world.cars = cars;
  world.bestCar = bestCar;

  viewport.offset.x = -bestCar.x;
  viewport.offset.y = -bestCar.y;

  viewport.reset();
  const viewPoint = scale(viewport.getOffset(), -1);
  world.draw(carCtx, viewPoint, false);
  miniMap.update(viewPoint);

  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx);
  }

  networkCtx.lineDashOffset = -time / 100;
  networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);
  Visualizer.drawNetwork(networkCtx, bestCar.brain);
  requestAnimationFrame(animate);
}
