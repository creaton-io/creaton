import {io, Socket} from 'socket.io-client';
import React, {createContext, useEffect, useState} from "react";

const NuCypherSocketContext = createContext<Socket | null>(null)
const NuCypherSocketProvider = (props) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    let sock = io('http://localhost:5000', {
      rejectUnauthorized: false,
      transports: ['websocket'],
      reconnection: true,
      forceNew: true
    });
    sock.on('connect', () => {
      console.log('connected to the backend');
      setSocket(sock);
    })
    sock.on('disconnect', () => {
      console.log('disconnected to the backend');
      setSocket(null);
    })
    console.log('initializing the socket', sock)
    return () => {
      socket?.disconnect();
      setSocket(null);
      console.log('tearing it down')
    }
  }, []);
  return (<NuCypherSocketContext.Provider value={socket}>{props.children}</NuCypherSocketContext.Provider>)
}
export {NuCypherSocketContext, NuCypherSocketProvider};
