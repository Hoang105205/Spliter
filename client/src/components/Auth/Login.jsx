import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

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

  return (
    <div className="container">
      <div className="logo">
        <span className="logo-h">h</span>
        <span className="logo-text">Spliter</span>
      </div>
      <div className="login-container">
        <h1>Log In</h1>
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              <span className="error-message">{errors.username}</span>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <div className="password-toggle" onClick={togglePasswordVisibility}>
                  <img
                    src={
                      showPassword
                        ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'%3E%3C/path%3E%3Ccircle cx='12' cy='12' r='3'%3E%3C/circle%3E%3C/svg%3E"
                        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9.88 9.88a3 3 0 1 0 4.24 4.24'%3E%3C/path%3E%3Cpath d='M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68'%3E%3C/path%3E%3Cpath d='M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61'%3E%3C/path%3E%3Cline x1='2' y1='2' x2='22' y2='22'%3E%3C/line%3E%3C/svg%3E"
                    }
                    alt={showPassword ? "Show" : "Hide"}
                    className="eye-icon"
                  />
                  <span>{showPassword ? 'Show' : 'Hide'}</span>
                </div>
              </div>
              <span className="error-message">{errors.password}</span>
            </div>
            <button
              type="submit"
              className="btn btn-login"
              disabled={isLoading}
              id="login-btn"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          <div className="divider">
            <div className="line"></div>
            <span>OR</span>
            <div className="line"></div>
          </div>
          <button className="btn btn-google" onClick={handleGoogleLogin}>
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="google-icon"
            />
            Continue with Google
          </button>
          <p className="signup-text">Don't have an account?</p>
          <button
            type="button"
            className="btn btn-signup"
            onClick={handleSignupClick}
            id="signup-btn"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;