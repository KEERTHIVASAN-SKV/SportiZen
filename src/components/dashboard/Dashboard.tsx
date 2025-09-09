import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Users, MessageSquare, TrendingUp, Calendar, Target } from 'lucide-react';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      icon: Users,
      label: 'Followers',
      value: user?.followers.length || 0,
      change: '+12%',
      changeType: 'positive' as const,
      color: 'blue'
    },
    {
      icon: Trophy,
      label: 'Achievements',
      value: user?.achievements.length || 0,
      change: '+2 new',
      changeType: 'positive' as const,
      color: 'green'
    },
    {
      icon: MessageSquare,
      label: 'Connections',
      value: user?.following.length || 0,
      change: '+5 this week',
      changeType: 'positive' as const,
      color: 'orange'
    },
    {
      icon: TrendingUp,
      label: 'Profile Views',
      value: 156,
      change: '+23%',
      changeType: 'positive' as const,
      color: 'purple'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your athletic journey today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
          
          {/* Upcoming Events */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-orange-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Upcoming Events</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Training Session</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tomorrow, 9:00 AM</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Competition</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">March 15, 2024</p>
                </div>
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
            <div className="flex items-center mb-4">
              <Target className="w-5 h-5 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Goals</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Training Sessions</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">12/15</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Connections</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">8/10</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;