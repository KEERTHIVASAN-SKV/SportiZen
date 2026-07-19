import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Heart, MessageCircle, MoreHorizontal, Trash2, ChevronDown, Send, ShieldCheck,
} from 'lucide-react';
import { Post, Comment } from '../../types';
import { postService, commentService } from '../../services/supabaseService';
import toast from 'react-hot-toast';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
  style?: React.CSSProperties;
}

const typeEmoji: Record<string, string> = {
  achievement: '🏆',
  milestone: '🎯',
  coaching_update: '📋',
  announcement: '📢',
  general: '💬',
};

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate, style }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(post.likes.includes(user?.id || ''));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [showOptions, setShowOptions] = useState(false);

  const isOwner = user?.id === post.userId;

  const profilePath = () => {
    if (post.role === 'player') return `/player/${post.userId}`;
    if (post.role === 'coach') return `/coach/${post.userId}`;
    return `/organization/${post.userId}`;
  };

  const handleLike = useCallback(async () => {
    if (!user) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => wasLiked ? c - 1 : c + 1);
    try {
      await postService.like(post.id, user.id);
    } catch {
      setLiked(wasLiked);
      setLikesCount((c) => wasLiked ? c + 1 : c - 1);
    }
  }, [liked, user, post.id]);

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const fetched = await commentService.getForPost(post.id);
        setComments(fetched);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentInput.trim()) return;
    setSubmittingComment(true);
    try {
      const newComment = await commentService.add({
        postId: post.id,
        userId: user.id,
        content: commentInput.trim(),
      });
      if (newComment) {
        setComments((prev) => [...prev, newComment]);
        setCommentInput('');
        if (!showComments) setShowComments(true);
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    const success = await postService.delete(post.id);
    if (success) {
      toast.success('Post deleted.');
      onUpdate();
    } else {
      toast.error('Failed to delete post.');
    }
    setShowOptions(false);
  };

  const timeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="post-card card-sports overflow-hidden" style={style}>
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate(profilePath())}
          >
            <Avatar src={post.profilePicture} name={post.name} size="md" role={post.role} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-gray-800 dark:text-white text-sm group-hover:text-blue-500 transition-colors">
                  {post.name}
                </span>
                <Badge variant={post.role} />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-gray-400">@{post.username}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="text-[11px] text-gray-400">{timeAgo(post.timestamp)}</span>
                {post.type !== 'general' && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <span className="text-[11px] font-bold text-blue-500">
                      {typeEmoji[post.type]} {post.type.replace('_', ' ')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Options */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showOptions && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-10 overflow-hidden w-36">
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <p className="mt-3 text-gray-700 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
      </div>

      {/* Media (Image or Video) */}
      {post.image && (
        <div className="mx-5 mb-4">
          {/\.(mp4|webm|ogg|mov)$/i.test(post.image) ? (
            <video
              src={post.image}
              controls
              className="w-full rounded-xl max-h-80 bg-black"
            />
          ) : (
            <img
              src={post.image}
              alt="Post"
              className="w-full rounded-xl object-cover max-h-80"
              loading="lazy"
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-bold transition-all ${
            liked ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4.5 h-4.5 w-[18px] h-[18px] transition-transform ${liked ? 'fill-red-500 scale-110' : ''}`} />
          {likesCount > 0 && <span>{likesCount}</span>}
        </button>

        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="w-[18px] h-[18px]" />
          {comments.length > 0 && <span>{comments.length}</span>}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-5 pb-4 space-y-3">
          {loadingComments ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                  {(comment.username || '?').charAt(0).toUpperCase()}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2 flex-1">
                  <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">@{comment.username} </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{comment.content}</span>
                </div>
              </div>
            ))
          )}

          {/* Add Comment */}
          {user && (
            <form onSubmit={handleAddComment} className="flex gap-2 mt-3">
              <Avatar src={user.profilePicture} name={user.name} size="xs" role={user.role} />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim() || submittingComment}
                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl disabled:opacity-50 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;