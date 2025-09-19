import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sparkles, Star, Type, Shield, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

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
        // Use the login function from context
        login(data.token, data.user);
        // No need to navigate - the context will handle the redirect
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Simple background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-light to-background opacity-50"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="bg-background-card backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-background-light animate-float">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - App Info */}
            <div className="flex flex-col justify-center p-6 lg:border-r border-background-lighter">
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
                      Note App
                    </h1>
                    <p className="text-text-secondary">by Team Batibot</p>
                  </div>
                </div>
                <p className="text-text-secondary mb-8">
                  Your personal note-taking companion that helps you stay organized and productive.
                </p>

                <div className="space-y-5">
                  {/* Rich Text Editor */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-background-lighter flex items-center justify-center">
                      <Type className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-text-primary font-semibold">Rich Text Editor</p>
                      <p className="text-text-secondary text-sm">Format your notes with this powerful tool</p>
                    </div>
                  </div>

                  {/* Secure & Private */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-background-lighter flex items-center justify-center">
                      <Shield className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-text-primary font-semibold">Secure & Private</p>
                      <p className="text-text-secondary text-sm">Your notes are encrypted and protected</p>
                    </div>
                  </div>

                  {/* Team Collaboration */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-background-lighter flex items-center justify-center">
                      <Users className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-text-primary font-semibold">Team Collaboration</p>
                      <p className="text-text-secondary text-sm">Share and collaborate with your team</p>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            
            {/* Right Column - Login Form */}
            <div className="p-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2">
                  Welcome Back
                </h1>
                <p className="text-text-secondary text-lg">
                  Sign in to your account
                </p>
              </div>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-background-light hover:bg-background-lighter backdrop-blur-sm border border-background-lighter rounded-2xl p-4 mb-6 transition-all duration-300 group hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-text-primary font-semibold text-lg group-hover:text-text-primary/90">
                    Continue with Google
                  </span>
                </div>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-background-lighter"></div>
                </div>
                <div className="relative bg-background-card px-4">
                  <span className="text-text-light font-medium">or</span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-text-primary font-medium text-sm block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-background-light border border-background-lighter rounded-xl pl-12 pr-4 py-4 text-text-primary placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-text-primary font-medium text-sm block">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-background-light border border-background-lighter rounded-xl pl-12 pr-12 py-4 text-text-primary placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-light hover:text-text-secondary transition-colors duration-200"
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
                  className="w-full bg-primary hover:bg-primary-dark disabled:bg-secondary rounded-xl py-4 text-white font-semibold text-lg transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 group-hover:animate-gradient"></div>
                  <span className="relative">
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </span>
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center mt-8">
                <p className="text-text-secondary">
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

        {/* Bottom decoration */}
        <div className="text-center mt-6">
          <p className="text-text-light text-sm">
            Secure • Fast • Beautiful
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;