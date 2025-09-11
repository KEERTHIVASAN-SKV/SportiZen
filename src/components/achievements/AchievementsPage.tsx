import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Star, Award, Medal, Plus } from 'lucide-react';
import AchievementsSection from '../profile/AchievementsSection';
import ProfileEditor from '../profile/ProfileEditor';

const AchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Your Achievements
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Celebrate your athletic journey and milestones
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Achievement
        </button>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full mx-auto mb-2">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {user.achievements.length}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-yellow-500 rounded-full mx-auto mb-2">
            <Medal className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {user.achievements.filter(a => a.type === 'medal').length}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Medals</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-500 rounded-full mx-auto mb-2">
            <Award className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {user.achievements.filter(a => a.type === 'certificate').length}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Certificates</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full mx-auto mb-2">
            <Star className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {user.achievements.filter(a => a.type === 'record').length}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Records</p>
        </div>
      </div>

      {/* Achievements Grid */}
      <AchievementsSection achievements={user.achievements} />

      {/* Profile Editor Modal for Adding Achievements */}
      {isEditing && (
        <ProfileEditor
          user={user}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default AchievementsPage;