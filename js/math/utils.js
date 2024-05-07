function getNearestPoint(point, points, treshold = 20) {
  const match = points.find(
    (p) =>
      Math.abs(p.x - point.x) < treshold && Math.abs(p.y - point.y) < treshold
  );

  return match;
}
