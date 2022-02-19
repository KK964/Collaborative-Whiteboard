const canvas = document.getElementById('draw-area');
const whoisDrawing = document.getElementById('whois-area');
const toolPreview = document.getElementById('tool-preview');

const drawListener = document.getElementById('draw-listener');

const ctx = canvas.getContext('2d');
const whoisCtx = whoisDrawing.getContext('2d');
const toolPreviewCtx = toolPreview.getContext('2d');

const topBar = document.getElementById('top-bar');
const sideBar = document.getElementById('side-bar');

function setZoom() {
  for (const canv of document.getElementsByTagName('canvas')) {
    const bb = canv.getBoundingClientRect();
    canv.width = bb.width;
    canv.height = bb.height;
  }
  rerender();
}

setZoom();

document.addEventListener('resize', setZoom);
window.addEventListener('resize', setZoom);

let isDrawing = false;
let drawingArray = [];

let x = 0;
let y = 0;

drawListener.addEventListener('mousedown', (e) => {
  const pos = getMousePos(canvas, e);
  x = pos.x;
  y = pos.y;
  isDrawing = true;
  drawingArray.push({ x: x, y: y });
});

drawListener.addEventListener('mousemove', (e) => {
  const pos = getMousePos(canvas, e);
  if (isDrawing === true) {
    const newx = pos.x;
    const newy = pos.y;
    const interpolated = interpolate({ x: x, y: y }, { x: newx, y: newy });
    x = pos.x;
    y = pos.y;
    for (const point of interpolated) {
      drawingArray.push(point);
    }
  }
  socket.emit('move', pos.x, pos.y);
});

drawListener.addEventListener('mouseup', (e) => {
  if (isDrawing === true) {
    isDrawing = false;
    const pos = getMousePos(canvas, e);
    drawingArray.push({ x: pos.x, y: pos.y });
    draw();
    drawingArray = [];
    x = 0;
    y = 0;
  }
});

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: ((evt.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
    y: ((evt.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
  };
}

function preview() {
  if (!getActiveTool()) return;
  getActiveTool().preview(toolPreviewCtx, drawingArray);
}

function draw() {
  if (!getActiveTool()) return;
  getActiveTool().render(ctx, drawingArray);
  addUserPath(drawingArray);
}

function renderLayers() {
  t: try {
    toolPreviewCtx.clearRect(0, 0, toolPreview.width, toolPreview.height);
    if (!getActiveTool || !getActiveTool()) break t;
    if (drawingArray.length < 2) break t;
    preview();
  } catch (e) {}
  try {
    whoisCtx.clearRect(0, 0, whoisDrawing.width, whoisDrawing.height);
    for (const user of Array.from(users.values())) {
      // draw name above user.x, user.y
      whoisCtx.fillStyle = user.color;
      whoisCtx.font = '15px Arial';
      whoisCtx.fillText(user.name, user.x, user.y - 20);
    }
  } catch (e) {}
  requestAnimationFrame(renderLayers);
}

renderLayers();

// drag and drop files listeners

drawListener.ondrop = (e) => {
  e.preventDefault();
  console.log('drop', e);
  const itm = e.dataTransfer.items[0];
  if (itm.kind !== 'file') return;
  if (!itm.type.startsWith('image/')) return;
  const file = itm.getAsFile();
  var img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
  };
  img.src = URL.createObjectURL(file);
  file.arrayBuffer().then((buffer) => {
    socket.emit('image', buffer);
  });
};

drawListener.ondragover = (e) => {
  e.preventDefault();
};
