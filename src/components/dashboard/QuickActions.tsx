import React from 'react';
import { Plus, Camera, Users, Trophy } from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    {
      icon: Plus,
      label: 'New Post',
      description: 'Share an update',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => console.log('New post')
    },
    {
      icon: Trophy,
      label: 'Add Achievement',
      description: 'Record a milestone',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => console.log('Add achievement')
    },
    {
      icon: Users,
      label: 'Find Athletes',
      description: 'Expand your network',
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => console.log('Find athletes')
    },
    {
      icon: Camera,
      label: 'Upload Media',
      description: 'Share photos/videos',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => console.log('Upload media')
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`${action.color} text-white p-4 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex flex-col items-center text-center">
              <action.icon className="w-6 h-6 mb-2" />
              <span className="font-medium text-sm">{action.label}</span>
              <span className="text-xs opacity-80 mt-1">{action.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;