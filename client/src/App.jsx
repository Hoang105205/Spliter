import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Toaster } from 'sonner';

import { useUser } from './hooks/useUser.js';

// Import pages (User)
import Login from './pages/Login';
import Signup from './pages/Signup';
import BankAccountSetupPage from './pages/BankAccountSetupPage';
import AccountPage from './pages/Dashboard/Accountpage';
import Admin_accountPage from './pages/Admin/Admin_accountpage';
import Dashboard_main from './pages/Dashboard/Dashboard_main';
import Dashboard_activities from './pages/Dashboard/Dashboard_activities';
import Dashboard_group from './pages/Dashboard/Dashboard_group';
import Dashboard_statistics from './pages/Dashboard/Dashboard_statistics';

// Import pages (Admin)
import AdminDashboard from './pages/Admin/Admin_Dashboard';


// Import components
import OAuth2RedirectHandler from './components/googleOAuth/OAuth2RedirectHandler.jsx';
import ProtectedLayout from './components/ProtectedLayout';

function App() {
  const { userData } = useUser();

  return (
      <div className="App">
        {/* ✅ Hiển thị thông báo toast */}
        <Toaster position="bottom-right" richColors />

        <Routes>

          {/* Routes without authenticated */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/setup-bank" element={<BankAccountSetupPage />} />
          {/* OAuth2 redirect handler */}
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Protected routes với điều kiện role */}
          {userData && userData.role === 'user' && (
            <>
              <Route
                path="/dashboard/:id"
                element={
                  <ProtectedLayout>
                    <Dashboard_main />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/dashboard/:id/activities"
                element={
                  <ProtectedLayout>
                    <Dashboard_activities />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/dashboard/:id/group"
                element={
                  <ProtectedLayout>
                    <Dashboard_group />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/dashboard/:id/statistics"
                element={
                  <ProtectedLayout>
                    <Dashboard_statistics />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/dashboard/:id/account"
                element={
                  <ProtectedLayout>
                    <AccountPage />
                  </ProtectedLayout>
                }
              />
            </>
          )}

          {userData && userData.role === 'admin' && (
            <>
              <Route
                path="/admin/dashboard/:id"
                element={
                  <ProtectedLayout>
                    <AdminDashboard />
                  </ProtectedLayout>
                } 
              />
              <Route
                path="/admin/dashboard/:id/account"
                element={
                  <ProtectedLayout>
                    <Admin_accountPage />
                  </ProtectedLayout>
                }
              />
              {/* Thêm các route admin khác nếu cần */}
            </>
          )}

          

          
          


          {/* Redirect any unknown paths to the login page */}
          <Route path="*" element={<Navigate to="/login" replace />} />

          
        </Routes>
      </div>
  );
}

export default App;