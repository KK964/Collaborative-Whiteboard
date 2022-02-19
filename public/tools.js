const toolContainerElement = document.getElementById('tool-container');
const colorPickersContainer = document.getElementById('color-pickers');
const lineColorPickerContainer = document.getElementById('line-color-container');
const fillColorPickerContainer = document.getElementById('fill-color-container');

const lineColorPicker = document.getElementById('line-color');
const fillColorPicker = document.getElementById('fill-color');

const lineCheckbox = document.getElementById('line-enabled');
const fillCheckbox = document.getElementById('fill-enabled');

const sizeSlider = document.getElementById('size-slider');
const currentSizeSliderValue = document.getElementById('current-size');

function compressPath(path) {
  return path.map((p) => Math.round(p.x * 100) / 100 + ',' + Math.round(p.y * 100) / 100).join(',');
}
class Tool {
  name;
  data;
  constructor(name, data) {
    this.name = name;
    this.data = data;
  }

  simplify(path) {
    return path;
  }
}

class Pen extends Tool {
  constructor(data) {
    super('pen', data);
  }

  render(context, path) {
    if (path.length < 2) return;
    context.beginPath();
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = this.data.color;
    context.lineWidth = this.data.width;
    context.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      context.lineTo(path[i].x, path[i].y);
    }
    context.stroke();
  }

  preview(context, path) {
    this.render(context, path); // Preview is the same as render
  }

  export(path) {
    // pen, color, width, path
    return `pen,${this.data.color},${this.data.width},${compressPath(path)}`;
  }
}

class Eraser extends Tool {
  preview_pen;
  constructor(data) {
    super('eraser', data);
    this.preview_pen = new Pen({ width: data.width, color: '#fff' });
  }

  render(context, path) {
    if (path.length < 2) return;
    context.beginPath();
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.globalCompositeOperation = 'destination-out';
    context.lineWidth = this.data.width;
    context.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      context.lineTo(path[i].x, path[i].y);
    }
    context.stroke();
    context.globalCompositeOperation = 'source-over';
  }

  preview(context, path) {
    this.preview_pen.data.width = this.data.width;
    this.preview_pen.render(context, path);
  }

  export(path) {
    // eraser, width, path
    return `eraser,${this.data.width},${compressPath(path)}`;
  }
}

class Line extends Tool {
  constructor(data) {
    super('line', data);
  }

  render(context, path) {
    if (path.length < 2) return;
    context.beginPath();
    context.lineCap = 'round';
    context.strokeStyle = this.data.color;
    context.lineWidth = this.data.width;
    context.moveTo(path[0].x, path[0].y);
    context.lineTo(path[path.length - 1].x, path[path.length - 1].y);
    context.stroke();
  }

  preview(context, path) {
    this.render(context, path);
  }

  export(path) {
    // line, color, width, path
    const newPath = [];
    newPath.push(path[0]);
    newPath.push(path[path.length - 1]);
    return `line,${this.data.color},${this.data.width},${compressPath(newPath)}`;
  }

  simplify(path) {
    const simplified = [];
    simplified.push(path[0]);
    simplified.push(path[path.length - 1]);
    return simplified;
  }
}

class Rectangle extends Tool {
  constructor(data) {
    super('rectangle', data);
  }

  render(context, path) {
    if (path.length < 2) return;
    if (this.data.fill) {
      context.fillStyle = this.data.fillColor;
      context.fillRect(
        path[0].x,
        path[0].y,
        path[path.length - 1].x - path[0].x,
        path[path.length - 1].y - path[0].y
      );
    }
    if (this.data.line) {
      context.beginPath();
      context.strokeStyle = this.data.color;
      context.lineWidth = this.data.width;
      context.rect(
        path[0].x,
        path[0].y,
        path[path.length - 1].x - path[0].x,
        path[path.length - 1].y - path[0].y
      );
      context.stroke();
    }
  }

  preview(context, path) {
    this.render(context, path);
  }

  export(path) {
    // rectangle, color, width, fillColor, fill, line, path
    const newPath = [];
    newPath.push(path[0]);
    newPath.push(path[path.length - 1]);
    return `rectangle,${this.data.color},${this.data.width},${this.data.fillColor},${
      this.data.fill
    },${this.data.line},${compressPath(newPath)}`;
  }

  simplify(path) {
    const simplified = [];
    simplified.push(path[0]);
    simplified.push(path[path.length - 1]);
    return simplified;
  }
}

class Circle extends Tool {
  constructor(data) {
    super('circle', data);
  }

  render(context, path) {
    if (path.length < 2) return;
    context.beginPath();
    context.strokeStyle = this.data.color;
    context.lineWidth = this.data.width;
    context.arc(
      path[0].x,
      path[0].y,
      distance(path[0].x, path[0].y, path[path.length - 1].x, path[path.length - 1].y),
      0,
      2 * Math.PI
    );
    if (this.data.fill) {
      context.fillStyle = this.data.fillColor;
      context.fill();
    }
    if (this.data.line) {
      context.stroke();
    }
  }

  preview(context, path) {
    this.render(context, path);
  }

  export(path) {
    // circle, color, width, fillColor, fill, line, path
    const newPath = [];
    newPath.push(path[0]);
    newPath.push(path[path.length - 1]);
    return `circle,${this.data.color},${this.data.width},${this.data.fillColor},${this.data.fill},${
      this.data.line
    },${compressPath(newPath)}`;
  }

  simplify(path) {
    const simplified = [];
    simplified.push(path[0]);
    simplified.push(path[path.length - 1]);
    return simplified;
  }
}

var selectedTool;
let selectedElement = document.querySelector('[data-selected]');

const toolLookupTable = {
  pen: Pen,
  eraser: Eraser,
  line: Line,
  rectangle: Rectangle,
  circle: Circle,
};

const allowedToolTags = ['IMG', 'BUTTON'];

function disableElement(element) {
  element.classList.add('disabled');
  element.disabled = true;
  if (element.children) for (let child of element.children) disableElement(child);
}

function enableElement(element) {
  element.classList.remove('disabled');
  element.disabled = false;
  if (element.children) for (let child of element.children) enableElement(child);
}

function updateToolData() {
  if (!selectedTool) return setTimeout(updateToolData, 100);
  selectedTool.data.color = lineColorPicker.value;
  selectedTool.data.fillColor = fillColorPicker.value;
  selectedTool.data.width = sizeSlider.value;
  selectedTool.data.line = lineCheckbox.checked;
  selectedTool.data.fill = fillCheckbox.checked;
  currentSizeSliderValue.innerText = sizeSlider.value;
}

toolContainerElement.addEventListener('click', (event) => {
  let tool = event.target;
  if (!allowedToolTags.includes(tool.tagName)) return;
  if (tool.tagName === 'IMG') {
    tool = tool.parentElement;
  }
  setActiveTool(tool);
});

function setActiveTool(tool) {
  if (!tool) return;
  if (!toolLookupTable[tool.id]) return;
  selectedElement.removeAttribute('data-selected');
  tool.setAttribute('data-selected', true);
  selectedTool = new toolLookupTable[tool.id]({
    color: lineColorPicker.value,
    fillColor: fillColorPicker.value,
    width: sizeSlider.value,
    line: lineCheckbox.checked,
    fill: fillCheckbox.checked,
  });
  selectedElement = tool;

  switch (tool.id) {
    case 'pen':
    case 'line':
      enableElement(colorPickersContainer);
      disableElement(fillColorPickerContainer);
      disableElement(lineCheckbox);
      break;
    case 'eraser':
      disableElement(colorPickersContainer);
      break;
    default:
      enableElement(colorPickersContainer);
      break;
  }
}

function convertExported(exp) {
  const data = exp.split(',');
  const id = data.shift();
  const tool = data[0];
  let toolData = {};
  switch (tool) {
    case 'eraser': {
      toolData.width = data[1];
      break;
    }
    case 'rectangle':
    case 'circle': {
      toolData.fillColor = data[3];
      toolData.fill = data[4] === 'true';
      toolData.line = data[5] === 'true';
    }
    case 'pen':
    case 'line': {
      toolData.color = data[1];
    }
    default: {
      toolData.width = data[2];
    }
  }
  let path = [];
  let x;
  let y;
  for (let i = Object.keys(toolData).length + 1; i < data.length; i++) {
    x = parseInt(data[i]);
    i++;
    y = parseInt(data[i]);
    path.push({ x, y });
  }
  console.log({ id, tool, toolData, path });
  return { id: id, tool: new toolLookupTable[tool](toolData), path };
}

function getActiveTool() {
  try {
    updateToolData();
  } catch (e) {
    console.error(e);
  }
  return selectedTool;
}

setActiveTool(document.getElementById('pen'));
updateToolData();

// Tools Update
lineColorPicker.addEventListener('change', (e) => updateToolData);
fillColorPicker.addEventListener('change', (e) => updateToolData);
lineCheckbox.addEventListener('change', (e) => updateToolData);
fillCheckbox.addEventListener('change', (e) => updateToolData);
sizeSlider.addEventListener('input', (e) => updateToolData);
sizeSlider.addEventListener('change', (e) => () => updateToolData);
