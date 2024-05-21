const rightPanelWidth = 200;

const carCanvas = document.getElementById("carCanvas");
carCanvas.width = window.innerWidth;
carCanvas.height = window.innerHeight / 2;
const cameraCanvas = document.getElementById("cameraCanvas");
cameraCanvas.width = window.innerWidth;
cameraCanvas.height = window.innerHeight / 2;
const miniMapCanvas = document.getElementById("miniMapCanvas");
miniMapCanvas.width = rightPanelWidth;
miniMapCanvas.height = rightPanelWidth;
const statistics = document.getElementById("statistics");
statistics.style.width = `${rightPanelWidth}px`;
statistics.style.height = `${window.innerHeight - rightPanelWidth - 30}px`;

const carCtx = carCanvas.getContext("2d");
const cameraCtx = cameraCanvas.getContext("2d");

const viewport = new Viewport(carCanvas, world.zoom, world.offset);
const miniMap = new MiniMap(miniMapCanvas, world.graph, rightPanelWidth);

const N = 50;
const cars = generateCars(1, "KEYS").concat(generateCars(N, "AI"));
const myCar = cars[0];
const camera = new Camera(myCar);

if (localStorage.getItem("bestBrain")) {
  cars.forEach((car, i) => {
    car.brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i > 1) {
      NeuralNetwork.mutate(car.brain, 0.1);
    }
  });
}

for (let i = 0; i < cars.length; i++) {
  const div = document.createElement("div");
  div.id = "Car-" + i;
  div.innerText = "Car-" + i;
  div.style.color = cars[i].color;
  statistics.appendChild(div);
}

let roadBorders = [];
const target = world.markings.find((m) => m instanceof Target);

if (target) {
  world.generateCorridor(myCar, target.center, true);
  roadBorders = world.corridor.borders.map((s) => [s.p1, s.p2]);
} else {
  roadBorders = world.roadBorders.map((s) => [s.p1, s.p2]);
}

let frameCount = 0;
let started = false;

function startCounter() {
  counter.innerText = "3";
  beep(400);
  setTimeout(() => {
    counter.innerText = "2";
    beep(400);
    setTimeout(() => {
      counter.innerText = "1";
      beep(400);
      setTimeout(() => {
        counter.innerText = "GO!";
        beep(700);
        setTimeout(() => {
          counter.innerText = "";
          started = true;
          frameCount = 0;
          myCar.engine = new Engine();
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
}

startCounter();

animate();

function save() {
  localStorage.setItem("bestBrain", JSON.stringify(myCar.brain));
}

function discard() {
  localStorage.removeItem("bestBrain");
}

function generateCars(N, type) {
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
    const color = type === "AI" ? getRandomColor() : "blue";
    const car = new Car(
      startPoint.x,
      startPoint.y,
      30,
      50,
      type,
      startAngle,
      3,
      color
    );
    car.name = car.type === "AI" ? `AI ${i}` : "Me";
    car.load(carInfo);
    cars.push(car);
  }

  return cars;
}

function updateCarProgress(car) {
  if (!car.finishTime) {
    car.progress = 0;
    const carSegment = getNearestSegment(car, world.corridor.skeleton);

    for (let i = 0; i < world.corridor.skeleton.length; i++) {
      const s = world.corridor.skeleton[i];
      if (s.equals(carSegment)) {
        const projection = s.projectPoint(car);
        //projection.point.draw(carCtx);
        const firstPartOfSegment = new Segment(s.p1, projection.point);
        //firstPartOfSegment.draw(carCtx, { color: "red", width: 4 });
        car.progress += firstPartOfSegment.length();
        break;
      } else {
        //s.draw(carCtx, { color: "red", width: 4 });
        car.progress += s.length();
      }
    }

    const totalDistance = world.corridor.skeleton.reduce(
      (p, c) => p + c.length(),
      0
    );
    car.progress /= totalDistance;
    if (car.progress >= 1) {
      car.progress = 1;
      car.finishTime = frameCount;
      if (car == myCar) {
        taDaa();
      }
    }
  }
}

function animate() {
  if (started) {
    for (let i = 0; i < cars.length; i++) {
      cars[i].update(roadBorders, []);
    }
  }

  world.cars = cars;
  world.bestCar = myCar;

  viewport.offset.x = -myCar.x;
  viewport.offset.y = -myCar.y;

  viewport.reset();
  const viewPoint = scale(viewport.getOffset(), -1);
  world.draw(carCtx, viewPoint, false);
  miniMap.update(viewPoint);

  for (let i = 0; i < cars.length; i++) {
    this.updateCarProgress(cars[i]);
  }

  if (frameCount % 3 === 0) {
    cars.sort((a, b) => b.progress - a.progress);
    for (let i = 0; i < cars.length; i++) {
      const stat = document.getElementById("Car-" + i);
      stat.style.color = cars[i].color;
      stat.style.backgroundColor = cars[i].type === "AI" ? "black" : "white";
      stat.innerText = `${cars[i].name}${cars[i].damaged ? ": damaged" : ""}`;

      if (cars[i].finishTime) {
        stat.innerHTML += `<span style="float:right;">${(
          cars[i].finishTime / 60
        ).toFixed(2)} s</span>`;
      }
    }
  }

  camera.move(myCar);
  camera.draw(carCtx);
  camera.render(cameraCtx, world);

  frameCount++;
  requestAnimationFrame(animate);
}
