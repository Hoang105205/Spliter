import React, { useEffect, useState } from 'react';
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser.js';

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addUser } = useUser();

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Navigate to Login
  const handleLogoClick = () => {
    navigate('/login');
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

    // Validate confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm Password is required';
      isValid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      // Call addUser from your hook
      await addUser({ username, email, password });
      setIsLoading(false);
      navigate('/setup-bank'); // Redirect to bank setup after successful signup
    } catch (error) {
      setIsLoading(false);
      // Optionally, set an error message to display to the user
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred during signup' || 'Failed to sign up. Please try again.';
      setErrors(prev => ({
        ...prev,
        username: errorMessage.includes('Username already exists') ? errorMessage : prev.username,
        general: !errorMessage.includes('Username already exists') ? errorMessage : ''
      }));
    }
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

        {/* Form Signup ở giữa */}
        <div className="w-full max-w-[500px] flex flex-col justify-center min-h-[calc(100vh-120px)]">
          <Card className="w-full border-none shadow-none">
            {/* SignUp Header */}
            <div className="w-full text-center font-['Bree_Serif',Helvetica] font-normal text-black text-4xl mb-6">
              Sign Up
            </div>
            <CardContent className="p-0 space-y-4">
              <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                {/* Username Field */}
                <div className="flex flex-col gap-1">
                  <label className="font-['Poppins',Helvetica] font-normal text-[#666666] text-lg">
                    Username
                  </label>
                  <Input
                    type="text"
                    className="h-[35px] rounded-xl border-[#66666659]"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                  <span className={`error-message text-[#ef0a0acc] text-sm min-h-[18px] ${errors.username ? '' : 'invisible'}`}>
                    {errors.username || 'placeholder'}
                  </span>
                </div>

                {/* Email Field */}
                <div className="flex flex-col gap-1">
                  <label className="font-['Poppins',Helvetica] font-normal text-[#666666] text-lg">
                    Email
                  </label>
                  <Input
                    type="email"
                    className="h-[35px] rounded-xl border-[#66666659]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  <span className={`error-message text-[#ef0a0acc] text-sm min-h-[18px] ${errors.email ? '' : 'invisible'}`}>
                    {errors.email || 'placeholder'}
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
                      className="h-[35px] rounded-xl border-[#66666659] pr-20 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-strong-password-auto-fill-button]:hidden"
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
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer" 
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
                  <span className={`error-message text-[#ef0a0acc] text-sm min-h-[18px] ${errors.password ? '' : 'invisible'}`}>
                    {errors.password || 'placeholder'}
                  </span>
                </div>
                
                {/* Confirm Password Field */}
                <div className="flex flex-col gap-1">
                  <label className="font-['Poppins',Helvetica] font-normal text-[#666666] text-lg">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      className="h-[35px] rounded-xl border-[#66666659] pr-20 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-strong-password-auto-fill-button]:hidden"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      style={{ 
                        WebkitTextSecurity: showConfirmPassword ? 'none' : 'disc',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none'
                      }}
                    />
                    <button 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      type="button"
                    >
                      {showConfirmPassword ? (
                        <EyeOffIcon className="w-4 h-4 text-gray-600" />
                      ) : (
                        <EyeIcon className="w-4 h-4 text-gray-600" />
                      )}
                      <span className="font-['Poppins',Helvetica] font-normal text-[#666666cc] text-sm whitespace-nowrap">
                        {showConfirmPassword ? 'Hide' : 'Show'}
                      </span>
                    </button>
                  </div>
                  <span className={`error-message text-[#ef0a0acc] text-sm min-h-[18px] ${errors.confirmPassword ? '' : 'invisible'}`}>
                    {errors.confirmPassword || 'placeholder'}
                  </span>
                </div>

                {/* Sign Up Button */}
                <Button
                  type="submit"
                  className="w-full h-[40px] bg-[#111111] hover:bg-[#3d3333] rounded-[20px] font-['Roboto_Flex',Helvetica] font-medium text-white text-lg"
                  disabled={isLoading}
                  id="signup-btn"
                >
                  {isLoading ? 'Signing up...' : 'Sign Up'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Signup;