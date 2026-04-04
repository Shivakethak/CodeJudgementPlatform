const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let ioInstance = null;

const initSocketServer = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.SOCKET_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();

    try {
      if (!process.env.JWT_SECRET) return next();
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const id = decoded.id ?? decoded._id ?? decoded.sub;
      socket.user = { ...decoded, id: id != null ? String(id) : undefined };
      next();
    } catch (error) {
      next(new Error('Unauthorized socket'));
    }
  });

  ioInstance.on('connection', (socket) => {
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
    }

    socket.on('challenge:subscribe', (challengeId) => {
      if (challengeId) socket.join(`challenge:${challengeId}`);
    });

    socket.on('challenge:unsubscribe', (challengeId) => {
      if (challengeId) socket.leave(`challenge:${challengeId}`);
    });
  });

  return ioInstance;
};

const getIo = () => ioInstance;

module.exports = { initSocketServer, getIo };
