export function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function smooth(value) {
  const t = clamp(value, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function circle(radius, count = 96) {
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });
}

function resampleClosed(points, count) {
  const segments = points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    return {
      from: point,
      to: next,
      length: Math.hypot(next.x - point.x, next.y - point.y),
    };
  });
  const perimeter = segments.reduce((total, segment) => total + segment.length, 0);
  let segmentIndex = 0;
  let segmentStart = 0;

  return Array.from({ length: count }, (_, index) => {
    const distance = (perimeter * index) / count;

    while (
      segmentIndex < segments.length - 1 &&
      distance > segmentStart + segments[segmentIndex].length
    ) {
      segmentStart += segments[segmentIndex].length;
      segmentIndex += 1;
    }

    const segment = segments[segmentIndex];
    const progress = segment.length
      ? (distance - segmentStart) / segment.length
      : 0;

    return {
      x: segment.from.x + (segment.to.x - segment.from.x) * progress,
      y: segment.from.y + (segment.to.y - segment.from.y) * progress,
    };
  });
}

function roundedRectangle(width, height, radius, count) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const cornerRadius = Math.min(radius, halfWidth, halfHeight);
  const curveSteps = Math.max(12, Math.ceil(count / 8));
  const points = [{ x: 0, y: -halfHeight }, { x: halfWidth - cornerRadius, y: -halfHeight }];
  const corners = [
    { x: halfWidth - cornerRadius, y: -halfHeight + cornerRadius, start: -Math.PI / 2 },
    { x: halfWidth - cornerRadius, y: halfHeight - cornerRadius, start: 0 },
    { x: -halfWidth + cornerRadius, y: halfHeight - cornerRadius, start: Math.PI / 2 },
    { x: -halfWidth + cornerRadius, y: -halfHeight + cornerRadius, start: Math.PI },
  ];

  corners.forEach((corner) => {
    for (let step = 1; step <= curveSteps; step += 1) {
      const angle = corner.start + (Math.PI / 2) * (step / curveSteps);
      points.push({
        x: corner.x + Math.cos(angle) * cornerRadius,
        y: corner.y + Math.sin(angle) * cornerRadius,
      });
    }
  });

  return resampleClosed(points, count);
}

function pointTowards(origin, target, distance) {
  const length = Math.hypot(target.x - origin.x, target.y - origin.y);
  const progress = length ? Math.min(1, distance / length) : 0;
  return {
    x: origin.x + (target.x - origin.x) * progress,
    y: origin.y + (target.y - origin.y) * progress,
  };
}

function roundedPolygon(vertices, cornerCut, count) {
  const curveSteps = Math.max(16, Math.ceil(count / vertices.length));
  const corners = vertices.map((vertex, index) => ({
    vertex,
    entry: pointTowards(
      vertex,
      vertices[(index - 1 + vertices.length) % vertices.length],
      cornerCut,
    ),
    exit: pointTowards(
      vertex,
      vertices[(index + 1) % vertices.length],
      cornerCut,
    ),
  }));
  const points = [];

  corners.forEach(({ vertex, entry, exit }) => {
    points.push(entry);
    for (let step = 1; step <= curveSteps; step += 1) {
      const progress = step / curveSteps;
      const inverse = 1 - progress;
      points.push({
        x:
          inverse * inverse * entry.x +
          2 * inverse * progress * vertex.x +
          progress * progress * exit.x,
        y:
          inverse * inverse * entry.y +
          2 * inverse * progress * vertex.y +
          progress * progress * exit.y,
      });
    }
  });

  const sampled = resampleClosed(points, count);
  const topIndex = sampled.reduce((bestIndex, point, index) => {
    const best = sampled[bestIndex];
    if (point.y < best.y - 0.001) return index;
    if (Math.abs(point.y - best.y) <= 0.001 && Math.abs(point.x) < Math.abs(best.x)) {
      return index;
    }
    return bestIndex;
  }, 0);

  return [...sampled.slice(topIndex), ...sampled.slice(0, topIndex)];
}

export function motifShape(name, radius, count = 96) {
  if (name === "circle") return circle(radius, count);

  if (name === "line") {
    return roundedRectangle(radius * 2, (radius * 2) / 3, radius / 3, count);
  }

  if (name === "square") {
    const size = radius * (20 / 11);
    return roundedRectangle(size, size, size * 0.135, count);
  }

  if (name === "triangle") {
    const scale = radius / 16;
    return roundedPolygon(
      [
        { x: 0, y: -17 * scale },
        { x: 15.8 * scale, y: 14.6 * scale },
        { x: -15.8 * scale, y: 14.6 * scale },
      ],
      2.3 * scale,
      count,
    );
  }

  throw new Error(`Unknown motif shape: ${name}`);
}

export function interpolate(from, to, progress) {
  if (from.length !== to.length) {
    throw new Error("Motif geometry requires matching sample counts.");
  }

  return from.map((point, index) => ({
    x: point.x + (to[index].x - point.x) * progress,
    y: point.y + (to[index].y - point.y) * progress,
  }));
}

export function path(points, smoothPath = false) {
  if (!points.length) return "";

  if (!smoothPath) {
    return `${points
      .map(
        (point, index) =>
          `${index ? "L" : "M"}${point.x.toFixed(3)},${point.y.toFixed(3)}`,
      )
      .join(" ")} Z`;
  }

  const midpoint = (a, b) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });
  const start = midpoint(points.at(-1), points[0]);
  let data = `M${start.x.toFixed(3)},${start.y.toFixed(3)}`;

  points.forEach((point, index) => {
    const end = midpoint(point, points[(index + 1) % points.length]);
    data += ` Q${point.x.toFixed(3)},${point.y.toFixed(3)} ${end.x.toFixed(3)},${end.y.toFixed(3)}`;
  });

  return `${data} Z`;
}
