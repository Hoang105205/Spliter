import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
// import SignUp from './components/Auth/SignUp';
// import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

function App() {
  return (
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Chuyển hướng từ trang chủ về login */}
          <Route path="/login" element={<Login />} />

          {/* <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} /> */}
        </Routes>
      </div>
  );
}

export default App;