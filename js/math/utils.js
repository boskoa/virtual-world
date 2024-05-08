function getNearestPoint(point, points, treshold = 20) {
  const match = points.find(
    (p) =>
      Math.abs(p.x - point.x) < treshold && Math.abs(p.y - point.y) < treshold
  );

  return match;
}

function add(p1, p2) {
  return new Point(p1.x + p2.x, p1.y + p2.y);
}

function subtract(p1, p2) {
  return new Point(p1.x - p2.x, p1.y - p2.y);
}

function scale(p, scaler) {
  return new Point(p.x * scaler, p.y * scaler);
}
