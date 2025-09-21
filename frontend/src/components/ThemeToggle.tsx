import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8 p-1',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-3'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        relative rounded-xl bg-background-light hover:bg-background-lighter 
        dark:bg-background-dark-lighter dark:hover:bg-background-dark-light
        border border-secondary/20 dark:border-text-dark-secondary/20
        text-text-secondary hover:text-text-primary 
        dark:text-text-dark-secondary dark:hover:text-text-dark-primary
        transition-all duration-300 ease-in-out
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-blue-400/50
        ${className}
      `}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <div className="relative flex items-center justify-center">
        {/* Sun icon for light mode */}
        <Sun 
          className={`
            ${iconSizes[size]}
            absolute transition-all duration-300 ease-in-out
            ${theme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-0'
            }
          `}
        />
        
        {/* Moon icon for dark mode */}
        <Moon 
          className={`
            ${iconSizes[size]}
            absolute transition-all duration-300 ease-in-out
            ${theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
            }
          `}
        />
      </div>

      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="absolute inset-0 rounded-xl bg-primary/10 scale-0 transition-transform duration-300 hover:scale-100" />
      </div>
    </button>
  );
};

export default ThemeToggle;