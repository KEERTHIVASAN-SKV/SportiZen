import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Image, Trophy, Calendar, Type } from 'lucide-react';
import { Post } from '../../types';

interface CreatePostProps {
  onClose: () => void;
  onCreatePost: (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments'>) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onClose, onCreatePost }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'general' | 'achievement' | 'milestone'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    
    const newPost = {
      userId: user.id,
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
      content: content.trim(),
      type: postType,
    };

    onCreatePost(newPost);
    setIsSubmitting(false);
    onClose();
  };

  const postTypeOptions = [
    {
      type: 'general' as const,
      icon: Type,
      label: 'General Update',
      description: 'Share your thoughts or daily activities',
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
    },
    {
      type: 'achievement' as const,
      icon: Trophy,
      label: 'Achievement',
      description: 'Celebrate a milestone or victory',
      color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      type: 'milestone' as const,
      icon: Calendar,
      label: 'Milestone',
      description: 'Mark an important moment in your journey',
      color: 'text-green-500 bg-green-50 dark:bg-green-900/20'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-6">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">{user?.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">@{user?.username}</p>
            </div>
          </div>

          {/* Post Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Post Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {postTypeOptions.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => setPostType(option.type)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    postType === option.type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${option.color} flex items-center justify-center mb-2`}>
                    <option.icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-medium text-gray-800 dark:text-white text-sm">
                    {option.label}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What's on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                postType === 'achievement' 
                  ? "Share your latest achievement..."
                  : postType === 'milestone'
                  ? "What milestone did you reach?"
                  : "Share your thoughts..."
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              rows={4}
              required
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {content.length}/500 characters
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <Image className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;