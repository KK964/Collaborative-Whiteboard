class User {
  id;
  x;
  y;
  name;
  color;
  constructor(id, x, y, name, color) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.name = name;
    this.color = color;
  }
}

class Path {
  path;
  width;
  tool;
  color;
  constructor(path, width, tool, color) {
    this.path = path;
    this.width = width;
    this.tool = tool;
    this.color = color;
  }
}

const users = new Map();

const previousPaths = new Set();
