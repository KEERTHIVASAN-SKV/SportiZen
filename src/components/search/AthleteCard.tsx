import React from 'react';
import { MapPin, Trophy, Users, MessageCircle } from 'lucide-react';
import { User } from '../../types';

interface AthleteCardProps {
  athlete: User;
}

const AthleteCard: React.FC<AthleteCardProps> = ({ athlete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
      {/* Profile Section */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative">
          {athlete.profilePicture ? (
            <img
              src={athlete.profilePicture}
              alt={athlete.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {athlete.name.charAt(0)}
              </span>
            </div>
          )}
          {/* Online Status */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
            {athlete.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">@{athlete.username}</p>
          
          <div className="flex items-center mt-2">
            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
              {athlete.sport}
            </span>
            {athlete.location && (
              <div className="flex items-center ml-3 text-gray-500 dark:text-gray-400">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="text-xs truncate">{athlete.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {athlete.bio && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {athlete.bio}
        </p>
      )}

      {/* Stats */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 mr-1" />
            <span className="text-sm">{athlete.followers.length}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Trophy className="w-4 h-4 mr-1" />
            <span className="text-sm">{athlete.achievements.length}</span>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          Member since 2024
        </div>
      </div>

      {/* Recent Achievements */}
      {athlete.achievements.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Latest Achievement
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Trophy className="w-4 h-4 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {athlete.achievements[0].title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(athlete.achievements[0].date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200">
          Connect
        </button>
        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
          <MessageCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AthleteCard;