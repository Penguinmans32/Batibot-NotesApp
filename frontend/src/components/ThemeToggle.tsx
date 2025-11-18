import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// Theme toggle with proper icon colors for dark/light mode preview
interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const { theme, toggleTheme } = useTheme();
  const [justClicked, setJustClicked] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

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

  const handleClick = () => {
    setJustClicked(true);
    setIsHovering(false);
    toggleTheme();
  };

  const handleMouseEnter = () => {
    if (!justClicked) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setJustClicked(false);
  };

  const shouldShowHover = isHovering && !justClicked;

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        ${sizeClasses[size]}
        relative rounded-xl 
        bg-background-light dark:bg-background-dark-lighter
        border border-secondary/20 dark:border-text-dark-secondary/20
        text-text-secondary dark:text-text-dark-secondary
        transition-all duration-500
        transform hover:scale-[1.02]
        focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-blue-400/50
        group
        ${className}
      `}
      style={{
        backgroundColor: shouldShowHover 
          ? (theme === 'light' ? 'var(--background-dark-card)' : 'var(--background-card)')
          : undefined,
        color: shouldShowHover
          ? (theme === 'light' ? 'var(--text-dark-primary)' : 'var(--text-primary)')
          : undefined
      }}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <div className="relative flex items-center justify-center">
        {/* Sun icon for light mode */}
        <Sun 
          className={`
            ${iconSizes[size]}
            absolute transition-all duration-500
          `}
          style={{
            opacity: theme === 'light' 
              ? (shouldShowHover ? 0 : 1)
              : (shouldShowHover ? 1 : 0),
            transform: theme === 'light'
              ? (shouldShowHover ? 'rotate(90deg) scale(0)' : 'rotate(0deg) scale(1)')
              : (shouldShowHover ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)'),
            color: theme === 'light'
              ? '#6B7280'  // Gray in normal light mode
              : '#F8FAFC'  // Light color when previewing from dark mode
          }}
        />
        
        {/* Moon icon for dark mode */}
        <Moon 
          className={`
            ${iconSizes[size]}
            absolute transition-all duration-500
          `}
          style={{
            opacity: theme === 'dark'
              ? (shouldShowHover ? 0 : 1)
              : (shouldShowHover ? 1 : 0),
            transform: theme === 'dark'
              ? (shouldShowHover ? 'rotate(-90deg) scale(0)' : 'rotate(0deg) scale(1)')
              : (shouldShowHover ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)'),
            color: theme === 'dark'
              ? '#CBD5E1'  // Light gray in normal dark mode
              : '#111827'  // Dark color when previewing from light mode
          }}
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