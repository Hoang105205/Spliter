import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
// import SignUp from './components/Auth/SignUp';
// import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Chuyển hướng từ trang chủ về login */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;