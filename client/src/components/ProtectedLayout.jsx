import React from 'react';
import RequireAuth from './RequireAuth.jsx';
import WebSocketProvider from '../websocket/WebSocketProvider.jsx';

function ProtectedLayout({ children }) {
  return (
    <RequireAuth>
      <WebSocketProvider>
        {children}
      </WebSocketProvider>
    </RequireAuth>
  );
}

export default ProtectedLayout;