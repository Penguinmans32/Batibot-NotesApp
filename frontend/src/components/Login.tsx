import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sparkles, Star, FileText, Users, Shield, CheckCircle} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const location = useLocation();

  const successMessage = location.state?.message;
  const prefillEmail = location.state?.email;

  useEffect(() => {
    if(prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-background-light flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-light relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white rounded-full mix-blend-overlay"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-white rounded-full mix-blend-overlay"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <Star className="absolute top-20 left-20 text-white/20 w-6 h-6 animate-pulse" />
          <Sparkles className="absolute top-32 right-32 text-white/30 w-8 h-8 animate-pulse animation-delay-1000" />
          <FileText className="absolute bottom-32 left-24 text-white/20 w-7 h-7 animate-pulse animation-delay-2000" />
          <Users className="absolute bottom-20 right-20 text-white/25 w-6 h-6 animate-pulse animation-delay-3000" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 xl:px-20 text-white">
          {/* Logo and Title */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl xl:text-5xl font-bold mb-1">
                  Note App
                </h1>
                <p className="text-xl text-white/80 font-medium">
                  Team Batibot
                </p>
              </div>
            </div>
            
            <p className="text-xl xl:text-2xl text-white/90 leading-relaxed mb-8">
              Your ideas deserve a beautiful home. Create, organize, and access your notes from anywhere with our powerful note-taking platform.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Rich Text Editor</h3>
                <p className="text-white/70">Format your notes with powerful editing tools</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Secure & Private</h3>
                <p className="text-white/70">Your notes are encrypted and protected</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Team Collaboration</h3>
                <p className="text-white/70">Share and collaborate with your team</p>
              </div>
            </div>
          </div>

          {/* Team Credit */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-white/60 text-sm">
              Crafted with ❤️ by <span className="font-semibold text-white">Team Batibot</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo (only visible on small screens) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">Note App</h1>
            <p className="text-text-secondary">Team Batibot</p>
          </div>

          <div className="bg-background-card rounded-3xl p-8 shadow-xl border border-secondary/10">
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-green-800 text-sm font-medium">{successMessage}</p>
                  </div>
                </div>
              )}
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2">
                Welcome Back
              </h2>
              <p className="text-text-secondary text-base lg:text-lg">
                Sign in to your account
              </p>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-background-light hover:bg-secondary/5 border border-secondary/20 rounded-2xl p-4 mb-6 transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-text-primary font-semibold text-lg group-hover:text-primary">
                  Continue with Google
                </span>
              </div>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary/20"></div>
              </div>
              <div className="relative bg-background-card px-4">
                <span className="text-text-secondary font-medium text-sm">or continue with email</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-text-secondary font-medium text-sm block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background-light border border-secondary/20 rounded-xl pl-12 pr-4 py-3.5 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-text-secondary font-medium text-sm block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background-light border border-secondary/20 rounded-xl pl-12 pr-12 py-3.5 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-error/10 border border-error/30 rounded-xl p-4">
                  <p className="text-error text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-light disabled:bg-secondary disabled:opacity-50 rounded-xl py-4 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:scale-100 mt-6"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-text-secondary text-sm">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-primary hover:text-primary-light font-semibold transition-colors duration-200 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;