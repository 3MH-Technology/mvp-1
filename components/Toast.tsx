
import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entry animation
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      // Allow exit animation to finish before unmounting
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: { bg: 'bg-green-500', icon: '✓' },
    error: { bg: 'bg-red-500', icon: '✕' },
    info: { bg: 'bg-blue-500', icon: 'ℹ' },
  };

  const style = styles[type];

  return (
    <div 
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center w-auto min-w-[300px] max-w-sm p-4 text-white rounded-xl shadow-2xl ${style.bg} transition-all duration-300 ease-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
    >
      <div className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-full ml-3 font-bold text-lg">
        {style.icon}
      </div>
      <div className="text-sm font-bold flex-1">{message}</div>
      <button onClick={() => setIsVisible(false)} className="mr-4 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
};

export default Toast;
