import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-500 dark:border-green-500/50',
      text: 'text-green-800 dark:text-green-200',
      icon: 'text-green-600 dark:text-green-400',
      Icon: CheckCircle
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-500 dark:border-blue-500/50',
      text: 'text-blue-800 dark:text-blue-200',
      icon: 'text-blue-600 dark:text-blue-400',
      Icon: Info
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-500 dark:border-red-500/50',
      text: 'text-red-800 dark:text-red-200',
      icon: 'text-red-600 dark:text-red-400',
      Icon: AlertCircle
    }
  }[type];

  const { bg, border, text, icon, Icon } = styles;

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div className={`${bg} ${border} ${text} border-2 backdrop-blur-sm px-5 py-3.5 rounded-xl shadow-lg toast-enter pointer-events-auto max-w-md w-full flex items-start gap-3`}>
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${icon}`} />
        <p className="flex-1 text-sm font-medium whitespace-pre-line leading-relaxed">{message}</p>
        <button 
          onClick={onClose}
          className={`${text} opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 -mt-0.5`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
