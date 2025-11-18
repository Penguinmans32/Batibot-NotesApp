import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface AnimatedSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  icon?: React.ReactNode;
}

const AnimatedSelect: React.FC<AnimatedSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200); // Match the animation duration
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    handleClose();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (isOpen) {
            handleClose();
          } else {
            setIsOpen(true);
          }
        }}
        className={`flex items-center justify-between w-full ${className} transition-all duration-200`}
      >
        <div className="flex items-center space-x-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="truncate">{selectedOption?.label || 'Select...'}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 w-full bg-background-card dark:bg-background-dark-card border border-secondary/20 dark:border-border-dark-primary rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_25px_rgba(0,0,0,0.3)] overflow-hidden ${
            isClosing ? 'dropdown-menu-closing' : 'dropdown-menu'
          }`}
          style={{ top: 'calc(100% + 4px)' }}
        >
          <div className="max-h-60 overflow-y-auto dropdown-scroll py-1">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-4 py-2.5 transition-all duration-150 ${
                  index !== 0 ? 'border-t border-secondary/10 dark:border-border-dark-primary/20' : ''
                } ${
                  option.value === value
                    ? 'bg-primary/10 dark:bg-blue-600/20 text-primary dark:text-blue-400 font-semibold'
                    : 'text-text-primary dark:text-text-dark-primary hover:bg-secondary/10 dark:hover:bg-text-dark-secondary/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimatedSelect;
