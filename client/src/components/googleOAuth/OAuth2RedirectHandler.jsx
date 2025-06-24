import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { useUser } from '../../hooks/useUser.js';

function OAuth2RedirectHandler() {
  const { setUserData } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Giải mã lấy username từ JWT
      const decoded = jwtDecode(token);
      setUserData({ 
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role || 'user', // Default to 'user' if role is not present
        createdAt: decoded.createdAt,
        updatedAt: decoded.updatedAt,
        bio: decoded.bio || ''
      });
      navigate(`/dashboard/${decoded.id}`);
    } else {
      navigate('/login');
    }
  }, [navigate, setUserData]);

  return <div>Redirecting...</div>;
}

export default OAuth2RedirectHandler;