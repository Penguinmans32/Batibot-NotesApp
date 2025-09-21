import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AuthCallback from './components/AuthCallback';
import './styles/globals.css';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center theme-transition">
        <div className="bg-white/10 dark:bg-slate-800/30 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-white/30 dark:border-slate-300/30 border-t-white dark:border-t-slate-300 rounded-full animate-spin"></div>
            <span className="text-white dark:text-slate-100 text-xl font-semibold">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/signup" 
        element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/auth/callback" 
        element={<AuthCallback />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;