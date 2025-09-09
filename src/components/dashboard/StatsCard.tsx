import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  color: 'blue' | 'green' | 'orange' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  change,
  changeType,
  color
}) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-green-500 text-green-500 bg-green-50 dark:bg-green-900/20',
    orange: 'bg-orange-500 text-orange-500 bg-orange-50 dark:bg-orange-900/20',
    purple: 'bg-purple-500 text-purple-500 bg-purple-50 dark:bg-purple-900/20'
  };

  const changeColors = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-gray-500'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color].split(' ')[2]} ${colorClasses[color].split(' ')[3]}`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[1]}`} />
        </div>
        <div className={`text-sm font-medium ${changeColors[changeType]}`}>
          {change}
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
          {value.toLocaleString()}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          {label}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;