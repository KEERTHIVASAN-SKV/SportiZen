import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Camera, Edit, MapPin, Trophy, Users, Star, Award } from 'lucide-react';
import ProfileEditor from './ProfileEditor';
import AchievementsSection from './AchievementsSection';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cover Photo & Profile Picture */}
      <div className="relative mb-8">
        <div className="h-64 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-2xl relative overflow-hidden">
          {user.coverPhoto && (
            <img
              src={user.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
          
          <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-all duration-200">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 overflow-hidden bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {user.name.charAt(0)}
                </span>
              )}
            </div>
            <button className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-all duration-200">
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-20">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="flex items-center mb-2">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mr-4">
                {user.name}
              </h1>
              <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
                {user.sport}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">@{user.username}</p>
            {user.location && (
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{user.location}</span>
              </div>
            )}
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
              {user.bio || 'Passionate athlete dedicated to excellence in sports and personal growth.'}
            </p>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 md:mt-0 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mx-auto mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {user.followers.length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Followers</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mx-auto mb-3">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {user.achievements.length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Achievements</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-full mx-auto mb-3">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">4.8</h3>
            <p className="text-gray-600 dark:text-gray-400">Rating</p>
          </div>
        </div>

        {/* Experience Section */}
        {user.experience && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Experience</h3>
            <p className="text-gray-600 dark:text-gray-400">{user.experience}</p>
          </div>
        )}

        {/* Achievements Section */}
        <AchievementsSection achievements={user.achievements} />

        {/* Contact Information */}
        {user.contactInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.contactInfo.phone && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Phone</span>
                  <p className="text-gray-800 dark:text-white">{user.contactInfo.phone}</p>
                </div>
              )}
              {user.contactInfo.website && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Website</span>
                  <p className="text-blue-500 hover:text-blue-600">
                    <a href={user.contactInfo.website} target="_blank" rel="noopener noreferrer">
                      {user.contactInfo.website}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile Editor Modal */}
      {isEditing && (
        <ProfileEditor
          user={user}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;