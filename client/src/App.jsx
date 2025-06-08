import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import Signup from './pages/Signup';
import AcountPage from './pages/Accountpage';

import Dashboard_main from './pages/Dashboard/Dashboard_main';
import Dashboard_recently from './pages/Dashboard/Dashboard_recently';
import Dashboard_group from './pages/Dashboard/Dashboard_group';
import Dashboard_statistics from './pages/Dashboard/Dashboard_statistics';

function App() {
  return (
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard_main />} />
          <Route path="/dashboard/recently" element={<Dashboard_recently />} />
          <Route path="/dashboard/group" element={<Dashboard_group />} />
          <Route path="/dashboard/statistics" element={<Dashboard_statistics />} />
          <Route path="/account" element={<AcountPage />} />

          {/* Redirect any unknown paths to the login page */}
        
        </Routes>
      </div>
  );
}

export default App;