import React from 'react';
import { Trophy, Users, MessageSquare, Calendar } from 'lucide-react';

const RecentActivity: React.FC = () => {
  const activities = [
    {
      id: 1,
      type: 'achievement',
      icon: Trophy,
      title: 'New Achievement Unlocked!',
      description: 'Completed 100 training sessions this month',
      time: '2 hours ago',
      color: 'text-green-500 bg-green-50 dark:bg-green-900/20'
    },
    {
      id: 2,
      type: 'connection',
      icon: Users,
      title: 'New Connection',
      description: 'Sarah Johnson started following you',
      time: '5 hours ago',
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 3,
      type: 'post',
      icon: MessageSquare,
      title: 'Post Engagement',
      description: 'Your training post received 15 new likes',
      time: '1 day ago',
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
    },
    {
      id: 4,
      type: 'event',
      icon: Calendar,
      title: 'Event Reminder',
      description: 'Swimming competition is tomorrow at 9 AM',
      time: '1 day ago',
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`p-2 rounded-lg ${activity.color}`}>
              <activity.icon className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-1">
                {activity.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-blue-500 hover:text-blue-600 text-sm font-medium py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200">
        View All Activity
      </button>
    </div>
  );
};

export default RecentActivity;