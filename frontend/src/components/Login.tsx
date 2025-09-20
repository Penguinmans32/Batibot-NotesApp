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
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background-light to-background opacity-50"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
        
        {/* Floating Notes */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-16 h-20 bg-yellow-100/20 rounded-lg shadow-lg border border-yellow-200/30" style={{transform: 'rotate(12deg)', animation: 'float 6s ease-in-out infinite'}}></div>
          <div className="absolute top-20 right-20 w-12 h-16 bg-blue-100/20 rounded-lg shadow-lg border border-blue-200/30" style={{transform: 'rotate(-6deg)', animation: 'float 8s ease-in-out infinite', animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-16 w-14 h-18 bg-green-100/20 rounded-lg shadow-lg border border-green-200/30" style={{transform: 'rotate(6deg)', animation: 'float 7s ease-in-out infinite', animationDelay: '2s'}}></div>
          <div className="absolute bottom-16 right-32 w-10 h-14 bg-purple-100/20 rounded-lg shadow-lg border border-purple-200/30" style={{transform: 'rotate(-12deg)', animation: 'float 5s ease-in-out infinite', animationDelay: '3s'}}></div>
          <div className="absolute top-1/2 left-8 w-8 h-10 bg-pink-100/20 rounded-lg shadow-lg border border-pink-200/30" style={{transform: 'rotate(18deg)', animation: 'float 9s ease-in-out infinite', animationDelay: '4s'}}></div>
          <div className="absolute top-1/3 right-8 w-6 h-8 bg-indigo-100/20 rounded-lg shadow-lg border border-indigo-200/30" style={{transform: 'rotate(-15deg)', animation: 'float 6.5s ease-in-out infinite', animationDelay: '5s'}}></div>
        </div>

        {/* Animated Writing Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute top-1/4 left-1/4 w-64 h-32 opacity-10" viewBox="0 0 200 100">
            <path 
              d="M10,30 Q50,10 90,30 T170,30" 
              stroke="currentColor" 
              fill="none" 
              strokeWidth="2"
              className="text-indigo-400"
              strokeDasharray="200"
              strokeDashoffset="200"
              style={{
                animation: 'drawLine 4s ease-in-out infinite',
                animationDelay: '0s'
              }}
            />
            <path 
              d="M10,50 Q30,40 50,50 T90,50 T130,50 T170,50" 
              stroke="currentColor" 
              fill="none" 
              strokeWidth="2"
              className="text-purple-400"
              strokeDasharray="200"
              strokeDashoffset="200"
              style={{
                animation: 'drawLine 4s ease-in-out infinite',
                animationDelay: '1s'
              }}
            />
            <path 
              d="M10,70 Q40,60 70,70 T130,70 T170,70" 
              stroke="currentColor" 
              fill="none" 
              strokeWidth="2"
              className="text-indigo-300"
              strokeDasharray="200"
              strokeDashoffset="200"
              style={{
                animation: 'drawLine 4s ease-in-out infinite',
                animationDelay: '2s'
              }}
            />
          </svg>

          <svg className="absolute bottom-1/4 right-1/4 w-64 h-32 opacity-10" viewBox="0 0 200 100">
            <path 
              d="M30,20 Q70,5 110,20 T190,20" 
              stroke="currentColor" 
              fill="none" 
              strokeWidth="2"
              className="text-blue-400"
              strokeDasharray="200"
              strokeDashoffset="200"
              style={{
                animation: 'drawLine 4s ease-in-out infinite',
                animationDelay: '1.5s'
              }}
            />
            <path 
              d="M30,40 Q50,30 70,40 T110,40 T150,40 T190,40" 
              stroke="currentColor" 
              fill="none" 
              strokeWidth="2"
              className="text-purple-300"
              strokeDasharray="200"
              strokeDashoffset="200"
              style={{
                animation: 'drawLine 4s ease-in-out infinite',
                animationDelay: '2.5s'
              }}
            />
          </svg>
        </div>

        {/* Floating Dots Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/5 w-2 h-2 bg-indigo-300/30 rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-purple-300/40 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-blue-300/30 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/3 right-1/5 w-1 h-1 bg-indigo-400/40 rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-purple-400/30 rounded-full animate-ping" style={{animationDelay: '4s'}}></div>
        </div>

        {/* Pen/Pencil Animation */}
        <div className="absolute top-1/3 right-1/5 opacity-15">
          <div className="relative" style={{animation: 'float 4s ease-in-out infinite', animationDelay: '1s'}}>
            <div className="w-1 h-16 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-full transform rotate-45"></div>
            <div className="absolute -top-2 -left-1 w-3 h-6 bg-gradient-to-b from-pink-300 to-pink-400 rounded-full transform rotate-45"></div>
            <div className="absolute -bottom-1 left-0 w-1 h-2 bg-gray-800 rounded-full transform rotate-45"></div>
          </div>
        </div>

        {/* Another pen */}
        <div className="absolute bottom-1/3 left-1/6 opacity-12">
          <div className="relative" style={{animation: 'float 5s ease-in-out infinite', animationDelay: '3s'}}>
            <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full transform rotate-12"></div>
            <div className="absolute -top-1 -left-0.5 w-2 h-4 bg-gradient-to-b from-silver to-gray-400 rounded-full transform rotate-12"></div>
          </div>
        </div>

        {/* Paper Sheets */}
        <div className="absolute top-16 right-16 opacity-10">
          <div className="w-20 h-24 bg-white/50 rounded-lg shadow-lg border border-gray-200/50" style={{transform: 'rotate(12deg)', animation: 'float 8s ease-in-out infinite'}}>
            <div className="h-2 bg-indigo-200/40 mx-2 mt-4 rounded"></div>
            <div className="h-1 bg-gray-200/30 mx-2 mt-2 rounded"></div>
            <div className="h-1 bg-gray-200/30 mx-2 mt-1 rounded"></div>
            <div className="h-1 bg-purple-200/40 mx-2 mt-1 rounded w-3/4"></div>
            <div className="h-1 bg-gray-200/20 mx-2 mt-1 rounded w-1/2"></div>
          </div>
        </div>

        <div className="absolute bottom-20 left-20 opacity-10">
          <div className="w-16 h-20 bg-white/50 rounded-lg shadow-lg border border-gray-200/50" style={{transform: 'rotate(-6deg)', animation: 'float 6s ease-in-out infinite', animationDelay: '2s'}}>
            <div className="h-2 bg-blue-200/40 mx-2 mt-3 rounded"></div>
            <div className="h-1 bg-gray-200/30 mx-2 mt-2 rounded"></div>
            <div className="h-1 bg-gray-200/30 mx-2 mt-1 rounded w-4/5"></div>
            <div className="h-1 bg-green-200/40 mx-2 mt-1 rounded w-2/3"></div>
          </div>
        </div>

        {/* Additional floating paper */}
        <div className="absolute top-1/2 right-10 opacity-8">
          <div className="w-12 h-15 bg-white/40 rounded-lg shadow-lg border border-gray-200/40" style={{transform: 'rotate(25deg)', animation: 'float 7s ease-in-out infinite', animationDelay: '4s'}}>
            <div className="h-1 bg-gray-200/30 mx-1 mt-2 rounded"></div>
            <div className="h-1 bg-gray-200/20 mx-1 mt-1 rounded w-3/4"></div>
            <div className="h-1 bg-gray-200/25 mx-1 mt-1 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-6xl">
        <div className="bg-background-card backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-background-light">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left Column - App Info */}
            <div className="lg:col-span-3 flex flex-col justify-center p-8 lg:border-r border-background-lighter">
              <div className="mb-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl shadow-xl">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-text-primary bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      Note App
                    </h1>
                    <p className="text-text-secondary text-lg">by Team Batibot</p>
                  </div>
                </div>
                <p className="text-text-secondary mb-10 text-lg leading-relaxed">
                  Your personal note-taking companion that helps you stay organized and productive with powerful features designed for modern workflows.
                </p>

                <div className="space-y-6">
                  {/* Rich Text Editor */}
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-background-lighter flex items-center justify-center backdrop-blur-sm">
                      <Type className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-text-primary font-semibold text-lg">Rich Text Editor</p>
                      <p className="text-text-secondary">Format your notes with this powerful tool</p>
                    </div>
                  </div>

                  {/* Secure & Private */}
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-background-lighter flex items-center justify-center backdrop-blur-sm">
                      <Shield className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-text-primary font-semibold text-lg">Secure & Private</p>
                      <p className="text-text-secondary">Your notes are encrypted and protected</p>
                    </div>
                  </div>

                  {/* Team Collaboration */}
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-background-lighter flex items-center justify-center backdrop-blur-sm">
                      <Users className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-text-primary font-semibold text-lg">Team Collaboration</p>
                      <p className="text-text-secondary">Share and collaborate with your team</p>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            
            {/* Right Column - Login Form */}
            <div className="lg:col-span-2 p-8 flex flex-col justify-center">
              <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-text-primary mb-3">
                  Welcome Back
                </h1>
                <p className="text-text-secondary text-xl">
                  Sign in to your account
                </p>
              </div>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-background-light hover:bg-background-lighter backdrop-blur-sm border border-background-lighter rounded-2xl p-5 mb-8 transition-all duration-300 group hover:scale-[1.02] hover:shadow-xl"
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
              <div className="relative flex items-center justify-center mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-background-lighter"></div>
                </div>
                <div className="relative bg-background-card px-6">
                  <span className="text-text-light font-medium text-lg">or</span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
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
      </div>
    </div>
  );
};

export default Login;