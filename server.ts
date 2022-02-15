import { Socket } from 'socket.io';

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const whiteboards = new Map();

class whiteboard {
  id: string;
  users: Map<String, UserElm>;
  constructor(id) {
    this.id = id;
    this.users = new Map();
  }
}

class UserElm {
  id: string;
  username: string;
  color: string;
  constructor(id, color) {
    this.id = id;
    this.color = color;
    this.username = getRandomName();
  }
}

function getRandomName() {
  // prettier-ignore
  const names = ['John', 'Jane', 'Mary', 'Mark', 'Tom', 'Bill', 'Alex', 'Mike', 'Peter', 'Paul', 'Mary', 'Kate', 'Linda', 'Sue', 'Jane', 'Mary', 'Tom', 'Bill', 'Alex', 'Mike', 'Peter', 'Paul', 'Mary', 'Kate', 'Linda', 'Sue', 'Jane', 'Mary', 'Tom', 'Bill', 'Alex', 'Mike', 'Peter', 'Paul', 'Mary', 'Kate', 'Linda', 'Sue', 'Jane', 'Mary', 'Tom', 'Bill', 'Alex', 'Mike', 'Peter', 'Paul', 'Mary', 'Kate', 'Linda', 'Sue', 'Jane', 'Mary', 'Tom', 'Bill', 'Alex', 'Mike', 'Peter', 'Paul', 'Mary', 'Kate', 'Linda', 'Sue', 'Jane', 'Mary', 'Tom', 'Bill', 'Alex', 'Mike', 'Peter', 'Paul', 'Mary', 'Kate', 'Linda', 'Sue', 'Jane', 'Mary', 'Tom', 'Bill', 'Alex', 'Mike', 'Peter', 'Paul', 'Mary', 'Kate', 'Linda', 'Sue', 'Jane', 'Mary', 'Tom', 'Bill', 'Alex', 'Mike', 'Peter', 'Paul', 'Mary', 'Kate', 'Linda', 'Sue', 'Jane', 'Mary', 'Tom', 'Bill', 'Alex', 'Mike', 'Peter', 'Paul', 'Mary', 'Kate', 'Linda', 'Sue', 'Jane', 'Mary', 'Tom', 'Bill', 'Alex', 'Mike', 'Peter', 'Paul', 'Mary', 'Kate', 'Linda', 'Sue', 'Jane', 'Mary', 'Tom', 'Bill', 'Alex', 'Mike', 'Peter', 'Paul', 'Mary', 'Kate', 'Linda', 'Sue', 'Jane', 'Mary', 'Tom', 'Bill', 'Alex', 'Mike', 'Peter', 'Paul', 'Mary', 'Kate', 'Linda', 'Sue', 'Jane', 'Mary', 'Tom', 'Bill', 'Alex', 'Mike', 'Peter', 'Paul', 'Mary', 'Kate', 'Linda'];
  return names[Math.floor(Math.random() * names.length)];
}

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/whiteboard', (req, res) => {
  res.redirect('/');
});

app.get('/whiteboard/:id', (req, res) => {
  const id = req.params.id;

  if (!whiteboards.has(id)) {
    res.redirect('/');
    return;
  }
  res.sendFile(__dirname + '/whiteboard.html');
});

app.get('/api/whiteboard/create', (req, res) => {
  let id;
  while (!id || whiteboards.has(id)) {
    id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  whiteboards.set(id, new whiteboard(id));
  res.send({ id });
});

app.get('/api/whiteboard/:id', (req, res) => {
  const id = req.params.id;
  if (!whiteboards.has(id)) {
    res.send({ exists: false });
    return;
  }
  res.send({ exists: true });
});

io.on('connection', (socket: Socket) => {
  let whiteboard: whiteboard | undefined;
  socket.on('join', (id: string, color: string) => {
    whiteboard = whiteboards.get(id);
    const user = new UserElm(socket.id, color);
    const users = Array.from(whiteboard.users.keys());
    const pullUser = users[0];
    if (pullUser) {
      io.to(pullUser).emit('request-update');
    }
    whiteboard.users.set(socket.id, user);
    socket.join(id);
    for (const value of Array.from(whiteboard.users.values())) {
      socket.emit('join', value);
    }
    socket.to(id).emit('join', user);
  });
  socket.on('update', (data: any) => {
    socket.to(whiteboard.id).emit('refresh', data);
  });
  socket.on('move', (x: number, y: number) => {
    if (!whiteboard) return;
    socket.to(whiteboard.id).emit('move', socket.id, x, y);
  });
  socket.on('draw', (width: number, color: string, path: { x: number; y: number }[]) => {
    if (!whiteboard) return;
    socket.to(whiteboard.id).emit('draw', socket.id, width, color, path);
  });
  socket.on('disconnect', () => {
    if (!whiteboard) return;
    whiteboard.users.delete(socket.id);
    io.to(whiteboard.id).emit('leave', socket.id);
    if (whiteboard.users.size === 0) {
      whiteboards.delete(whiteboard.id);
      whiteboard = undefined;
    }
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
