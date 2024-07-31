import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('authenticate', (token) => {
    const isAuthenticated = authenticateUser(token);
    if (isAuthenticated) {
      socket.emit('authenticated', { success: true });
      console.log('User authenticated');
    } else {
      socket.emit('authenticated', { success: false });
      console.log('Authentication failed');
    }
  });

  const authenticateUser = (token: string): boolean => {
    // Implement your authentication logic here
    // This is a placeholder implementation
    return token === 'valid_token';
  };

  socket.on('room_created', (room) => {
    socket.join(room);
    socket.data.room = room;
    socket.broadcast.emit('room_created', room);
  });

  socket.on('join', (group) => {
    // is there room in the group?
    // if not, return error
    // if so, join the group
    socket.data.group = group;
  });

  socket.on('click', (message) => {
    console.log('click', message);
    io.emit('pong');

    // check authentication
    if (message.authToken === 'valid_token') {
      socket.broadcast.emit('count', message.count);
      socket.to(socket.data.group).emit('count', message.count);
    } else {
      socket.emit('unauthenticated', { success: false });
      socket.emit('count', 0);
    }
  });

  socket.on('message', (message) => {
    socket.broadcast.emit('message', message);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Socket.IO server is ready for connections`);
});

// Error handling for server
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Error handling for Socket.IO
io.engine.on('connection_error', (err) => {
  console.error('Socket.IO connection error:', err);
});