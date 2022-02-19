function getRandomCSSColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function simplifyPoint(point) {
  return { x: Math.round(point.x * 100) / 100, y: Math.round(point.y * 100) / 100 };
}

function interpolate(previous, next) {
  const maxDistance = 5;
  previous = simplifyPoint(previous);
  next = simplifyPoint(next);

  const result = [];
  const dist = distance(previous.x, previous.y, next.x, next.y);
  if (dist < maxDistance) return [previous, next];
  const steps = Math.floor(dist / maxDistance);
  const stepX = (next.x - previous.x) / steps;
  const stepY = (next.y - previous.y) / steps;
  for (let i = 0; i < steps; i++) {
    result.push(simplifyPoint({ x: previous.x + stepX * i, y: previous.y + stepY * i }));
  }
  return result;
}

window.onbeforeunload = () => {
  return true;
};
