import React, { createContext, useState, useEffect } from 'react';
import connectWebSocket from './websocket-client';
import { useUser } from '../hooks/useUser';


// Tạo Context
export const WebSocketContext = createContext(null);

// Tạo Provider để quản lý WebSocket
export const WebSocketProvider = ({ children }) => {
  const [ws, setWebSocket] = useState(null);
  const { userData } = useUser(); 
  useEffect(() => {
    let websocket;
    
    try {
      websocket = connectWebSocket(userData);
      setWebSocket(websocket);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }

    return () => {
      websocket && websocket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;