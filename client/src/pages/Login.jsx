import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Separator } from "../components/ui/seperator.jsx";
import { useNavigate } from 'react-router-dom';


function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
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
    <div className="bg-white flex flex-row justify-center w-full min-h-screen">
      <div className="bg-white w-full max-w-[1500px] relative py-12">
        {/* Logo */}
        <Button
          className="absolute w-[230px] h-[130px] top-8 left-0 font-['Pompiere',Helvetica] font-normal text-center text-[64px]"
          onClick={handleLogoClick}>
          <span className="text-[#4285f4] text-8xl">Spliter</span>
        </Button>
    
        {/* Login Form Container */}
        <div className="flex flex-col items-center justify-center mt-0">
        {/* Form Fields */}
          <Card className="w-full max-w-[489px] border-none shadow-none">
            {/* Login Header */}
            <div className="w-full text-center font-['Bree_Serif',Helvetica] font-normal text-black text-[50px] mb-4">
              Log In
            </div>
            <CardContent className="p-0 space-y-6">
              <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
                {/* Username Field */}
                <div className="flex flex-col gap-0">
                    <label className="font-['Poppins',Helvetica] font-normal text-[#666666] text-2xl">
                      Username
                    </label>
                  <Input
                    type="text"
                    className="h-[35px] rounded-xl border-[#66666659]"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                  <span className={`error-message text-[#ef0a0acc] ${errors.username ? '' : 'invisible'}`}>
                    {errors.username || 'placeholder'} </span>
                </div>

                  {/* Password Field */}
                  <div className="flex flex-col gap-0">
                    <label className="font-['Poppins',Helvetica] font-normal text-[#666666] text-2xl">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="h-[35px] rounded-xl border-[#66666659]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />

                  <button 
                    className="absolute right-3 top-1 flex items-center gap-2 cursor-pointer" 
                    onClick={togglePasswordVisibility}
                    type="button"
                  >
                    {showPassword ? (
                        <EyeIcon className="w-6 h-6" />
                      ) : (
                        <EyeOffIcon className="w-6 h-6" />
                      )}
                    <span className = "font-['Poppins',Helvetica] font-normal text-[#666666cc] text-lg">
                      {showPassword ? 'Show' : 'Hide'}
                    </span>
                  </button>
                </div>
                {<span className={`error-message text-[#ef0a0acc] ${errors.password ? '' : 'invisible'}`}>
                    {errors.password || 'placeholder'} </span>}
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full h-10 bg-[#111111] hover:bg-[#696363] rounded-[20px] font-['Roboto_Flex',Helvetica] font-medium text-white text-[25px]"
                  disabled={isLoading}
                  id="login-btn"
                >
                  {isLoading ? 'Logging in...' : 'Log In'}
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-[23px]">
                <Separator className="flex-1 bg-[#66666680]" />
                <span className="font-['Avenir-Roman',Helvetica] font-normal text-[#666666] text-2xl">
                  OR
                </span>
                <Separator className="flex-1 bg-[#66666680]" />
              </div>
              {/* Google Login Button */}
              <Button 
                className="w-full h-10 rounded-[40px] border-[#333333] font-['Avenir-Roman',Helvetica] font-normal text-[#333333] text-2xl" 
                onClick={handleGoogleLogin}
                variant="outline"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-6 h-6 mr-4"
                />
                Continue with Google
              </Button>

              {/* Sign Up Text */}
              <p className="text-center font-['Inter',Helvetica] font-normal text-black text-2xl">
                Don't have an account ?
              </p>

              {/* Sign Up Button */}
              <Button
                className="w-full h-10 bg-[#4285f4] hover:bg-[#78a7f1] rounded-[20px] font-['Radio_Canada_Big',Helvetica] font-medium text-white text-[25px]"
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