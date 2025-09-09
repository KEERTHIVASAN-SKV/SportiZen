import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Post } from '../../types';
import PostCard from './PostCard';
import CreatePost from './CreatePost';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const samplePosts: Post[] = [
    {
      id: '1',
      userId: '1',
      username: 'athlete_mike',
      name: 'Mike Johnson',
      content: 'Just completed my first marathon! 🏃‍♂️ Amazing feeling crossing that finish line after months of training. Thank you to everyone who supported me along the way!',
      type: 'achievement',
      timestamp: '2 hours ago',
      likes: [],
      comments: []
    },
    {
      id: '2',
      userId: '2',
      username: 'swimmer_sara',
      name: 'Sarah Davis',
      content: 'Early morning pool session ✅ Nothing beats the feeling of gliding through the water as the sun rises. Ready to tackle the day!',
      type: 'general',
      timestamp: '5 hours ago',
      likes: [],
      comments: []
    }
  ];

  const allPosts = [...posts, ...samplePosts];

  const handleCreatePost = (newPost: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments'>) => {
    const post: Post = {
      ...newPost,
      id: Date.now().toString(),
      timestamp: 'just now',
      likes: [],
      comments: []
    };
    setPosts([post, ...posts]);
    setShowCreatePost(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Create Post Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowCreatePost(true)}
          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-left hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-200">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-200">
              Share your athletic journey...
            </span>
          </div>
        </button>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {allPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-400 dark:text-gray-500 mb-4">
              Be the first to share your athletic journey!
            </p>
            <button
              onClick={() => setShowCreatePost(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Create First Post
            </button>
          </div>
        ) : (
          allPosts.map((post, index) => (
            <PostCard 
              key={post.id} 
              post={post} 
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onCreatePost={handleCreatePost}
        />
      )}
    </div>
  );
};

export default Feed;