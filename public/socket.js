const socket = io();
const id = location.href.split('/').pop();

socket.on('join', (user) => {
  users.set(user.id, new User(user.id, 0, 0, user.username, user.color));
});

socket.on('leave', (user) => {
  users.delete(user);
});

socket.on('move', (user, x, y) => {
  const userToMove = users.get(user);
  if (!userToMove) return;
  userToMove.x = x;
  userToMove.y = y;
});

socket.on('draw', (user, width, color, path) => {
  const userToDraw = users.get(user);
  if (!userToDraw) return;
  previousLines.add(new Line(path, width, 'pencil', color));
  draw(path, width, color);
});

socket.on('request-update', () => {
  socket.emit('update', Array.from(previousLines.values()));
});

socket.on('refresh', (previous) => {
  console.log(previous);
  previousLines.clear();
  previous.forEach((line) => {
    previousLines.add(line);
    draw(line.path, line.width, line.color);
  });
});

socket.emit('join', id, getRandomCSSColor());
