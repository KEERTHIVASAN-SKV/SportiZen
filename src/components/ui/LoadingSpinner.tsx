import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  size = 'md',
  text,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl gradient-sports flex items-center justify-center shadow-xl shadow-blue-500/30">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-2xl gradient-sports opacity-30 blur-md animate-pulse" />
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 animate-pulse">
            {text || 'Loading SportiZen...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={`${sizeClasses[size]} text-blue-500 animate-spin`} />
      {text && <span className="ml-2 text-sm font-semibold text-gray-500">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
