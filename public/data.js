class User {
  id;
  x;
  y;
  name;
  color; // Name color
  constructor(id, x, y, name, color) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.name = name;
    this.color = color;
  }
}

class Path {
  tool_name;
  tool_data;
  path;
  constructor(path, tool) {
    this.tool_name = tool.name;
    this.tool_data = tool.data;
    this.path = path;
  }
}

const users = new Map();

const previousPaths = new Map();

var userHistory = [];
var undoHistory = [];
var redoHistory = [];

function makeId() {
  let id;
  while (!id || previousPaths.has(id)) {
    id = Math.random().toString(36).substring(0, 12);
  }
  return id;
}

function addUserPath(path) {
  const id = makeId();
  const tool = getActiveTool();
  const p = new Path(path, tool);
  previousPaths.set(id, p);
  userHistory.push(id);
  if (userHistory.length > 10) userHistory.shift();
  if (redoHistory.length > 0) {
    redoHistory = [];
  }
}

function addOtherPath(path, tool) {
  const id = makeId();
  const p = new Path(path, tool);
  previousPaths.set(id, p);
}

function rerender() {
  console.log('re-rendering', previousPaths.size);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const [id, p] of previousPaths) {
    const t = new toolLookupTable[p.tool_name](p.tool_data);
    t.render(ctx, p.path);
  }
}

// Undo and Redo
function undo() {
  if (redoHistory.length > 0) {
    const id = redoHistory.pop();
    const p = previousPaths.get(id);
    userHistory.pop();
    previousPaths.delete(id);
    undoHistory.push(p);
    rerender();
    return;
  }
  if (userHistory.length === 0) return;
  const id = userHistory.pop();
  const p = previousPaths.get(id);
  previousPaths.delete(id);
  console.log(p);
  undoHistory.push(p);
  rerender();
}

function redo() {
  console.log(undoHistory);
  if (undoHistory.length === 0) return;
  const p = undoHistory.pop();
  const newId = makeId();
  userHistory.push(newId);
  previousPaths.set(newId, p);
  rerender();
}

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === 'z') {
    if (e.shiftKey) redo();
    else undo();
  }
});
