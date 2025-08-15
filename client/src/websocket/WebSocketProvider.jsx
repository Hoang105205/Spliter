import React, { createContext, useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';

import { useWebSocketHandler } from './useWebSocketHandler.js';

// Tạo Context
export const WebSocketContext = createContext(null);

// Tạo Provider để quản lý WebSocket
export const WebSocketProvider = ({ children }) => {
  const [ws, setWebSocket] = useState(null);
  const { userData } = useUser(); 

  useEffect(() => {
    if (!userData?.id) return;

    const socket = new WebSocket('wss://spliter-gr0z.onrender.com');

    setWebSocket(socket);

    return () => {
      socket.close();
    };
  }, [userData?.id]);

  // 👇 Gọi custom hook lắng nghe sự kiện
  useWebSocketHandler(ws);


  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;