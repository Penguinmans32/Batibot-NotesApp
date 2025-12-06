import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CardanoProvider } from './contexts/CardanoContext';
import Dashboard from './components/Dashboard';
import BlockchainAnalytics from './components/BlockchainAnalytics';
import './styles/globals.css';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route 
        path="/dashboard" 
        element={<Dashboard />} 
      />
      <Route 
        path="/analytics" 
        element={<BlockchainAnalytics />} 
      />
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CardanoProvider>
          <Router>
            <AppRoutes />
          </Router>
        </CardanoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;