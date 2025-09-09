import React from 'react';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import { Achievement } from '../../types';

interface AchievementsSectionProps {
  achievements: Achievement[];
}

const AchievementsSection: React.FC<AchievementsSectionProps> = ({ achievements }) => {
  const getAchievementIcon = (type: Achievement['type']) => {
    switch (type) {
      case 'trophy':
        return Trophy;
      case 'medal':
        return Medal;
      case 'certificate':
        return Award;
      case 'record':
        return Star;
      default:
        return Trophy;
    }
  };

  const getAchievementColor = (type: Achievement['type']) => {
    switch (type) {
      case 'trophy':
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'medal':
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
      case 'certificate':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'record':
        return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      default:
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    }
  };

  if (achievements.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 mb-8 text-center">
        <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">No Achievements Yet</h3>
        <p className="text-gray-400 dark:text-gray-500">Start your journey and unlock your first achievement!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Achievements</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement, index) => {
          const Icon = getAchievementIcon(achievement.type);
          const colorClass = getAchievementColor(achievement.type);
          
          return (
            <div
              key={achievement.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                {achievement.title}
              </h4>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                {achievement.description}
              </p>
              
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {new Date(achievement.date).toLocaleDateString()}
              </div>
              
              {achievement.image && (
                <div className="mt-3 rounded-lg overflow-hidden">
                  <img
                    src={achievement.image}
                    alt={achievement.title}
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsSection;