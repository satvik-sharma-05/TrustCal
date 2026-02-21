const { Server } = require('socket.io');

let io;

function init(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected to Risk Stream:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('Client disconnected from Risk Stream');
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

function emitEvent(event, data) {
  if (io) {
    io.emit(event, data);
  }
}

module.exports = {
  init,
  getIO,
  emitEvent
};
