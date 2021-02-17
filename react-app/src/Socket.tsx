import {io} from 'socket.io-client';

const socket = io('http://localhost:5000', {
  rejectUnauthorized: false,
  transports: ['websocket'],
  reconnection: true,
  forceNew: true
});
export {socket};
