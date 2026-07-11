import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Post } from '../../types';
import { postService } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import SkeletonCard from '../ui/SkeletonCard';

const PAGE_SIZE = 10;

const Feed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const loadPosts = useCallback(async (pageNum = 0, append = false) => {
    if (pageNum === 0) setLoading(true); else setLoadingMore(true);
    try {
      const newPosts = await postService.getFeed(pageNum, PAGE_SIZE);
      if (append) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      setHasMore(newPosts.length === PAGE_SIZE);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(0);
  }, [loadPosts]);

  // Realtime: prepend new posts as they arrive
  useEffect(() => {
    const channel = supabase
      .channel('posts-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, async () => {
        // Reload page 0 fresh
        const fresh = await postService.getFeed(0, PAGE_SIZE);
        setPosts(fresh);
        setPage(0);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage, true);
  };

  const handlePostCreated = () => {
    setShowCreatePost(false);
    loadPosts(0);
    setPage(0);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Create Post Trigger */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreatePost(true)}
          className="w-full glass rounded-2xl p-4 text-left hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-sports rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-400 dark:text-gray-500 font-semibold text-sm group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              Share your athletic achievements, coach tips, or announcement...
            </span>
          </div>
        </button>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-6">
          <SkeletonCard type="post" count={3} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 card-sports">
          <Plus className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-1">No posts yet</h3>
          <p className="text-gray-400 text-sm mb-4">Be the first to share your athletic journey!</p>
          <button onClick={() => setShowCreatePost(true)} className="btn-primary text-sm">
            Create First Post
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {posts.map((post, index) => (
              <div key={post.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}>
                <PostCard post={post} onUpdate={() => loadPosts(0)} />
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn-ghost text-sm px-8"
              >
                {loadingMore ? 'Loading...' : 'Load More Posts'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onCreatePost={handlePostCreated}
        />
      )}
    </div>
  );
};

export default Feed;