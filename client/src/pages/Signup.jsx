import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { useNavigate } from 'react-router-dom';


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
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
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
    
        {/* SignUp Form Container */}
        <div className="flex flex-col items-center justify-center mt-0 scale-80">
        {/* Form Fields */}
          
          <Card className="w-full max-w-[489px] border-none shadow-none scale-80">
            {/* SignUp Header */}
            <div className="w-full text-center font-['Bree_Serif',Helvetica] font-normal text-black text-[50px] mb-4">
              Sign Up
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

                {/* Email Field */}
                <div className="flex flex-col gap-0">
                  <label className="font-['Poppins',Helvetica] font-normal text-[#666666] text-2xl">
                    Email
                  </label>
                  <Input
                    type="email"
                    className="h-[35px] rounded-xl border-[#66666659]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  <span className={`error-message text-[#ef0a0acc] ${errors.email ? '' : 'invisible'}`}>
                    {errors.email || 'placeholder'} </span>
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
                  <span className={`error-message text-[#ef0a0acc] ${errors.password ? '' : 'invisible'}`}>
                    {errors.password || 'placeholder'} </span>
                </div>
                
                {/* Confirm Password Field */}
                <div className="flex flex-col gap-0">
                  <label className="font-['Poppins',Helvetica] font-normal text-[#666666] text-2xl">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      className="h-[35px] rounded-xl border-[#66666659]"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />

                  <button 
                    className="absolute right-3 top-1 flex items-center gap-2 cursor-pointer" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    type="button"
                  >
                    {showConfirmPassword ? (
                        <EyeIcon className="w-6 h-6" />
                      ) : (
                        <EyeOffIcon className="w-6 h-6" />
                      )}
                    <span className = "font-['Poppins',Helvetica] font-normal text-[#666666cc] text-lg">
                      {showConfirmPassword ? 'Show' : 'Hide'}
                    </span>
                  </button>
                </div>
                  <span className={`error-message text-[#ef0a0acc] ${errors.confirmPassword ? '' : 'invisible'}`}>
                    {errors.confirmPassword || 'placeholder'} </span>
                </div>
                {/* Sign Up Button */}
              <Button
                  type="submit"
                  className="w-full h-10 bg-[#111111] hover:bg-[#3d3333] rounded-[20px] font-['Roboto_Flex',Helvetica] font-medium text-white text-[25px]"
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