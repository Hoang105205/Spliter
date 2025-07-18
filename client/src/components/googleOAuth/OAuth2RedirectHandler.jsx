import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { useUser } from '../../hooks/useUser.js';

function OAuth2RedirectHandler() {
  const { setUserData, findUser } = useUser();
  const navigate = useNavigate();



  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      
      if (token) {
        try {
          localStorage.setItem('token', token);

          // Giải mã token
          let decoded;
          try {
            decoded = jwtDecode(token);
          } catch (error) {
            console.error("Failed to decode token:", error);
            navigate('/login');
            return;
          }

          // Tìm user bằng decoded.username
          const user = await findUser(decoded.username);

          if (!user) {
            console.error('User not found');
            navigate('/login');
            return;
          }

          // Cập nhật userData
          setUserData({ 
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role || 'user',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            bio: user.bio || '',
            bankAccountNumber: user.bankAccountNumber,
            bankAccountName: user.bankAccountName,
            bankName: user.bankName
          });

          // Check if user has all 3 bank info fields
          const hasAllBankInfo = user.bankAccountNumber && user.bankAccountName && user.bankName;
          if (!hasAllBankInfo) {
            navigate('/setup-bank');
          } else {
            navigate(`/dashboard/${user.id}`);
          }
        } catch (error) {
          console.error('Error during OAuth redirect:', error);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    // Gọi hàm xử lý bất đồng bộ
    handleOAuthRedirect();
  }, [navigate, setUserData]);

  return <div>Redirecting...</div>;
}

export default OAuth2RedirectHandler;