import React, { useState, useRef } from 'react';
import { X, Image, Trophy, Megaphone, Target, BookOpen, MessageCircle, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { postService } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface CreatePostProps {
  onClose: () => void;
  onCreatePost: () => void;
}

type PostType = 'general' | 'achievement' | 'milestone' | 'coaching_update' | 'announcement';

const typeOptions: { value: PostType; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'general', label: 'General', icon: MessageCircle, color: 'text-blue-500' },
  { value: 'achievement', label: 'Achievement', icon: Trophy, color: 'text-amber-500' },
  { value: 'milestone', label: 'Milestone', icon: Target, color: 'text-purple-500' },
  { value: 'coaching_update', label: 'Coaching Update', icon: BookOpen, color: 'text-green-500' },
  { value: 'announcement', label: 'Announcement', icon: Megaphone, color: 'text-orange-500' },
];

const CreatePost: React.FC<CreatePostProps> = ({ onClose, onCreatePost }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('general');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setUploading(true);
    try {
      let imageUrl: string | undefined;

      // Upload image to Supabase Storage if provided
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(path, imageFile, { upsert: false });

        if (!uploadError) {
          const { data } = supabase.storage.from('post-media').getPublicUrl(path);
          imageUrl = data.publicUrl;
        }
      }

      const newPost = await postService.create({
        userId: user.id,
        content: content.trim(),
        type: postType,
        image: imageUrl,
      });

      if (newPost) {
        toast.success('Post published!');
        onCreatePost();
      } else {
        toast.error('Failed to publish post. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const selectedType = typeOptions.find((t) => t.value === postType)!;
  const Icon = selectedType.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-2">
            <Icon className={`w-5 h-5 ${selectedType.color}`} />
            Create Post
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Post Type Selector */}
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Post Type</label>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((type) => {
                const TIcon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setPostType(type.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      postType === type.value
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/25'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <TIcon className="w-3.5 h-3.5" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                postType === 'achievement' ? "Share your achievement with the world! 🏆"
                : postType === 'coaching_update' ? "Share a coaching tip or training update..."
                : postType === 'announcement' ? "What would you like to announce?"
                : "What's on your mind?"
              }
              rows={4}
              className="input-sports resize-none"
              maxLength={2000}
            />
            <div className="text-right text-xs text-gray-400 mt-1">{content.length}/2000</div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full rounded-xl max-h-48 object-cover" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-lg hover:bg-black/80 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Actions Row */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl text-xs font-bold transition-all"
              >
                <Image className="w-4 h-4" />
                Photo
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="btn-ghost text-sm px-4 py-2">
                Cancel
              </button>
              <button
                type="submit"
                disabled={!content.trim() || uploading}
                className="btn-primary text-sm flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Publish
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;