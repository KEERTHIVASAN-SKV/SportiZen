import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  message,
  action,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
        <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-600 dark:text-gray-400">{title}</h3>
        {message && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{message}</p>
        )}
      </div>
      {action && (
        <button onClick={action.onClick} className="btn-primary text-sm">
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
