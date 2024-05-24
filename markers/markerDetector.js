class MarkerDetector {
  constructor() {
    this.treshold = document.createElement("input");
    this.treshold.type = "range";
    this.treshold.min = 0;
    this.treshold.max = 255;
    this.treshold.value = 40;
  }

  #averagePoints(points) {
    const center = { x: 0, y: 0 };

    for (const point of points) {
      center.x += point.x;
      center.y += point.y;
    }

    center.x /= points.length;
    center.y /= points.length;

    return center;
  }

  detect(imgData) {
    const points = [];

    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];
      const blueness = b - Math.max(r, g);
      if (blueness > this.treshold.value) {
        const pxIndex = i / 4;
        const y = Math.floor(pxIndex / imgData.width);
        const x = pxIndex % imgData.width;
        points.push({ x, y, blueness });
      }
    }

    let centroid1 = points[0];
    let centroid2 = points[points.length - 1];
    let group1 = [];
    let group2 = [];

    for (let i = 0; i < 10; i++) {
      group1 = points.filter(
        (p) => distance(p, centroid1) < distance(p, centroid2)
      );
      group2 = points.filter(
        (p) => distance(p, centroid1) >= distance(p, centroid2)
      );

      centroid1 = this.#averagePoints(group1);
      centroid2 = this.#averagePoints(group2);
    }

    const size1 = Math.sqrt(group1.length);
    const size2 = Math.sqrt(group2.length);
    const radius1 = size1 / 2;
    const radius2 = size2 / 2;

    const marker1 = {
      centroid: centroid1,
      points: group1,
      radius: radius1,
    };

    const marker2 = {
      centroid: centroid2,
      points: group2,
      radius: radius2,
    };

    return {
      leftMarker: centroid1.x < centroid2.x ? marker1 : marker2,
      rightMarker: centroid1.x < centroid2.x ? marker2 : marker1,
    };
  }
}
