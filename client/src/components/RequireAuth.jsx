import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import { useUser } from '../hooks/useUser.js';

function RequireAuth({ children }) {
  // const { userData } = useUser(); // Zustand hook to get userData
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect(() => {
  //   // Check if userData is valid
  //   if (userData && userData.id && userData.username && userData.email) {
  //     setIsAuthenticated(true); // User is authenticated
  //   } else {
  //     setIsAuthenticated(false); // User is not authenticated
  //   }
  //   console.log('User data changed:', userData);
  // }, [userData]); // React to changes in userData

  // // Redirect to login if not authenticated
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  // // Render children if authenticated
  // return children;

  const { userData } = useUser(); // Zustand hook to get userData

  // Kiểm tra trực tiếp từ userData
  const isAuthenticated = userData && userData.id && userData.username && userData.email;

  if (!isAuthenticated) {
    console.log('Redirecting to login...');
    return <Navigate to="/login" replace />;
  }

  // Render children nếu đã đăng nhập
  return children;
}

export default RequireAuth;