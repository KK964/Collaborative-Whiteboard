const socket = io();
const id = location.href.split('/').pop();

socket.on('join', (user) => {
  console.log('join', user);
  users.set(user.id, new User(user.id, 0, 0, user.username, user.color));
});

socket.on('user-update', (user, name, color) => {
  console.log('user-update', user, name, color);
  const u = users.get(user.id);
  if (!u) return;
  u.name = name;
  u.color = color;
});

socket.on('leave', (user) => {
  console.log('leave', user);
  users.delete(user);
});

socket.on('move', (user, x, y) => {
  const userToMove = users.get(user);
  if (!userToMove) return;
  userToMove.x = x;
  userToMove.y = y;
});

socket.on('draw', (exportedPath) => {
  console.log('draw', exportedPath);
  const p = convertExported(exportedPath);
  addOtherPath(p.id, p.tool, p.path);
});

socket.on('delete', (id) => {
  console.log('delete', id);
  previousPaths.delete(id);
  rerender();
});

socket.on('image', (buffer) => {
  console.log('image', buffer);
  const blob = new Blob([buffer]);
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
  };
  img.src = url;
});

socket.on('request-update', () => {
  console.log('request-update');
  let d = [];
  for (let p of Array.from(previousPaths.values())) {
    let t = new toolLookupTable[p.tool_name](p.tool_data);
    d.push(p.id + ',' + t.export(p.path));
  }
  socket.emit('update', d);
});

socket.on('refresh', (previous) => {
  console.log('refresh', previous);
  let d = [];
  for (let p of previous) {
    d.push(convertExported(p));
  }
  previousPaths.clear();
  for (let p of d) {
    console.log(p);
    const pa = new Path(p.path, p.tool);
    console.log(pa);
    previousPaths.set(p.id, pa);
  }
  rerender();
});

socket.emit('join', id, getRandomCSSColor());
