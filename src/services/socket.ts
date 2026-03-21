// src/services/socket.ts
import { io, Socket } from 'socket.io-client';
import config from '@/api/config';

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket?.connected) return socket;
  socket = io(config.hostedUrl, {  // Use hostedUrl instead of socketUrl
    auth: { token },
    transports: ['websocket'],
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};