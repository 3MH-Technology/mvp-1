
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center w-full max-w-xs p-4 text-white rounded-lg shadow-lg ${bgColors[type]} transition-all duration-300 ease-in-out`}>
      <div className="text-sm font-bold">{message}</div>
    </div>
  );
};

export default Toast;
