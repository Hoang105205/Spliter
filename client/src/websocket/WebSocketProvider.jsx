import React, { createContext, useState, useEffect } from 'react';
import connectWebSocket from './websocket-client';

// Tạo Context
export const WebSocketContext = createContext(null);

// Tạo Provider để quản lý WebSocket
export const WebSocketProvider = ({ children }) => {
  const [ws, setWebSocket] = useState(null);

  useEffect(() => {
    // Kết nối WebSocket khi ứng dụng khởi động
    const websocket = connectWebSocket();
    setWebSocket(websocket);

    // Cleanup: Ngắt kết nối WebSocket khi component bị hủy
    return () => {
      websocket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;