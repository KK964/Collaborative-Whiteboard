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
}

setZoom();

document.addEventListener('resize', setZoom);

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
  if (isDrawing === true) {
    const pos = getMousePos(canvas, e);
    x = pos.x;
    y = pos.y;
    drawingArray.push({ x: x, y: y });
  }
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
}

function renderLayers() {
  try {
    toolPreviewCtx.clearRect(0, 0, toolPreview.width, toolPreview.height);
    if (!getActiveTool || !getActiveTool()) return requestAnimationFrame(renderLayers);
    if (drawingArray.length < 2) return requestAnimationFrame(renderLayers);
    preview();
  } catch (e) {
    console.log(e);
  }
  requestAnimationFrame(renderLayers);
}

renderLayers();
