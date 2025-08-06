import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Separator } from "../components/ui/seperator.jsx";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser.js';


function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();


  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Form validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = { username: '', password: '' };

    // Validate username
    if (!username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    } 

    // Validate password
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const user = await login(username, password);
      setLoading(false);
      if (user.role === 'admin') {
        navigate(`/admin/dashboard/${user.id}`);
        
      } else if (user.role === 'user') {
        if (user.status === 'Banned'){
          setErrors({ username: 'Your account is banned', password: '' });
          return;
        }
        if (!user.bankAccountNumber || !user.bankAccountName || !user.bankName) { // Check if user has bank info
          navigate('/setup-bank');
        } else {
          navigate(`/dashboard/${user.id}`);
        }
      }
    } catch (error) {
      setLoading(false);
      if (error.status === 401) {
      setErrors({ username: '', password: 'Incorrect password' });
      } else if (error.status === 404) {
        setErrors({ username: 'User not found', password: '' });
      } else {
        console.log(error);
        setErrors({ username: 'Login failed', password: '' });
      }
    }
  };

  // Handle Google login
  const handleGoogleLogin = () => {
    window.location.href = '/auth/google';
  };

  // Navigate to signup
  const handleSignupClick = () => {
    navigate('/signup');
  };

  // Navigate to Login
  const handleLogoClick = () => {
    navigate('/login');
  };

  return (
    <div className="page-container">
      {/* Main Content - Chứa tất cả */}
      <div className="page-main-content relative flex items-center justify-center p-8">
        {/* Logo góc trên trái */}
        <Button
          className="absolute top-4 left-8 w-[180px] h-[100px] font-['Pompiere',Helvetica] font-normal text-center"
          onClick={handleLogoClick}
        >
          <span className="text-[#4285f4] text-6xl">Spliter</span>
        </Button>

        {/* Form Login ở giữa */}
        <div className="w-full max-w-[500px] flex flex-col justify-center min-h-[calc(100vh-120px)]">
          <Card className="w-full border-none shadow-none">
            {/* Login Header */}
            <div className="w-full text-center font-['Bree_Serif',Helvetica] font-normal text-black text-4xl mb-6">
              Log In
            </div>
            
            <CardContent className="p-0 space-y-5">
              <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
                {/* Username Field */}
                <div className="flex flex-col gap-1">
                  <label className="font-['Poppins',Helvetica] font-normal text-[#666666] text-lg">
                    Username
                  </label>
                  <Input
                    type="text"
                    className="h-[40px] rounded-xl border-[#66666659] text-base"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                  <span className={`error-message text-[#ef0a0acc] text-sm min-h-[20px] ${errors.username ? '' : 'invisible'}`}>
                    {errors.username || 'placeholder'} 
                  </span>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1">
                  <label className="font-['Poppins',Helvetica] font-normal text-[#666666] text-lg">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="h-[40px] rounded-xl border-[#66666659] pr-20 text-base [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-strong-password-auto-fill-button]:hidden"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      style={{ 
                        WebkitTextSecurity: showPassword ? 'none' : 'disc',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none'
                      }}
                    />
                    <style jsx>{`
                      input[type="password"]::-ms-reveal,
                      input[type="password"]::-ms-clear {
                        display: none;
                      }
                      input[type="password"]::-webkit-credentials-auto-fill-button {
                        display: none !important;
                      }
                      input[type="password"]::-webkit-strong-password-auto-fill-button {
                        display: none !important;
                      }
                    `}</style>
                    <button 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer" 
                      onClick={togglePasswordVisibility}
                      type="button"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-4 h-4 text-gray-600" />
                      ) : (
                        <EyeIcon className="w-4 h-4 text-gray-600" />
                      )}
                      <span className="font-['Poppins',Helvetica] font-normal text-[#666666cc] text-sm whitespace-nowrap">
                        {showPassword ? 'Hide' : 'Show'}
                      </span>
                    </button>
                  </div>
                  <span className={`error-message text-[#ef0a0acc] text-sm min-h-[20px] ${errors.password ? '' : 'invisible'}`}>
                    {errors.password || 'placeholder'}
                  </span>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full h-[45px] bg-[#111111] hover:bg-[#696363] rounded-[20px] font-['Roboto_Flex',Helvetica] font-medium text-white text-lg"
                  disabled={loading}
                  id="login-btn"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <Separator className="flex-1 bg-[#66666680]" />
                <span className="font-['Avenir-Roman',Helvetica] font-normal text-[#666666] text-lg">
                  OR
                </span>
                <Separator className="flex-1 bg-[#66666680]" />
              </div>

              {/* Google Login Button */}
              <Button 
                className="w-full h-[45px] rounded-[40px] border-[#333333] font-['Avenir-Roman',Helvetica] font-normal text-[#333333] text-lg" 
                onClick={handleGoogleLogin}
                variant="outline"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5 mr-3"
                />
                Continue with Google
              </Button>

              {/* Sign Up Text */}
              <p className="text-center font-['Inter',Helvetica] font-normal text-black text-lg mt-6">
                Don't have an account ?
              </p>

              {/* Sign Up Button */}
              <Button
                className="w-full h-[45px] bg-[#4285f4] hover:bg-[#78a7f1] rounded-[20px] font-['Radio_Canada_Big',Helvetica] font-medium text-white text-lg"
                onClick={handleSignupClick}
              >
                Sign Up
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>  
  );
}

export default Login;