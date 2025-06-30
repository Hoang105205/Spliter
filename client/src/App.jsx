import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Toaster } from 'sonner';

// Import pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AccountPage from './pages/Dashboard/Accountpage';
import Dashboard_main from './pages/Dashboard/Dashboard_main';
import Dashboard_activities from './pages/Dashboard/Dashboard_activities';
import Dashboard_group from './pages/Dashboard/Dashboard_group';
import Dashboard_statistics from './pages/Dashboard/Dashboard_statistics';


// Import components
import OAuth2RedirectHandler from './components/googleOAuth/OAuth2RedirectHandler.jsx';
import ProtectedLayout from './components/ProtectedLayout';

function App() {
  return (
      <div className="App">
        {/* ✅ Hiển thị thông báo toast */}
        <Toaster position="bottom-right" richColors />

        <Routes>

          {/* Routes without authenticated */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Protected routes */}
          
          <Route path="/dashboard/:id" element={
            <ProtectedLayout> 
              <Dashboard_main />
            </ProtectedLayout>             
            } 
          />
          <Route path="/dashboard/:id/activities" element={
            <ProtectedLayout> 
              <Dashboard_activities />
            </ProtectedLayout>
            }
          />
          <Route path="/dashboard/:id/group" element={
            <ProtectedLayout> 
              <Dashboard_group />
            </ProtectedLayout>
            }
          />
          <Route path="/dashboard/:id/statistics" element={
            <ProtectedLayout>
              <Dashboard_statistics />
            </ProtectedLayout>
            }
          />
          <Route path="/dashboard/:id/account" element={
            <ProtectedLayout>
              <AccountPage />
            </ProtectedLayout>
            }
          />

          
          


          {/* Redirect any unknown paths to the login page */}
          <Route path="*" element={<Navigate to="/login" replace />} />

          
        </Routes>
      </div>
  );
}

export default App;