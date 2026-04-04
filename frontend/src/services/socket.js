import { io } from 'socket.io-client';

let socketInstance = null;
let boundToken = null;

const url = () => import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const getSocket = (token) => {
  const t = token && token !== 'undefined' ? token : null;
  if (!socketInstance || boundToken !== t) {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    boundToken = t;
    socketInstance = io(url(), {
      transports: ['websocket'],
      auth: t ? { token: t } : {},
    });
  }
  return socketInstance;
};

export const resetSocket = () => {
  boundToken = null;
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
