import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login?error=oauth_failed');
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        login(token, user);
        navigate('/dashboard');
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login?error=oauth_failed');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center">
      <div className="bg-background-card rounded-3xl p-8 shadow-2xl border border-secondary/20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-secondary/30 border-t-primary rounded-full animate-spin"></div>
          <span className="text-text-primary text-xl font-semibold">Completing Google sign-in...</span>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;