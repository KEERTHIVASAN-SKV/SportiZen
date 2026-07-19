import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Camera, Edit, MapPin, Trophy, Users, Star, Award, ShieldCheck,
  Phone, Globe, Link as LinkIcon, Calendar, ArrowLeft, UserPlus,
  Loader2, UserCheck, UserMinus,
} from 'lucide-react';
import ProfileEditor from './ProfileEditor';
import AchievementsSection from './AchievementsSection';
import {
  profileService, achievementService, eventService,
  connectionService, postService, followService, storageService,
} from '../../services/supabaseService';
import { User, Event, Connection, Achievement, Post } from '../../types';
import toast from 'react-hot-toast';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import SkeletonCard from '../ui/SkeletonCard';
import PostCard from '../feed/PostCard';

interface ProfilePageProps {
  viewedUserId?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ viewedUserId: propUserId }) => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();

  const targetUserId = propUserId || params.id || currentUser?.id;
  const isOwnProfile = !params.id && !propUserId;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [hostedEvents, setHostedEvents] = useState<Event[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [connectionCount, setConnectionCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const loadProfileData = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const [profileData, achievementsData, postsData] = await Promise.all([
        profileService.getById(targetUserId),
        achievementService.getForUser(targetUserId),
        postService.getByUser(targetUserId, 3),
      ]);

      if (!profileData) { setLoading(false); return; }
      setProfileUser(profileData);
      setAchievements(achievementsData);
      setRecentPosts(postsData);

      // Load org events
      if (profileData.role === 'organization') {
        const events = await eventService.getByOrganization(targetUserId);
        setHostedEvents(events);
      }

      // Connection status (coach↔player)
      if (currentUser && currentUser.id !== targetUserId) {
        const conn = await connectionService.getStatus(currentUser.id, targetUserId);
        setConnection(conn);
      }

      // Connection count
      const count = await connectionService.getCountForUser(targetUserId);
      setConnectionCount(count);

      // Follow counts
      const [fCount, fgCount] = await Promise.all([
        followService.getFollowerCount(targetUserId),
        followService.getFollowingCount(targetUserId),
      ]);
      setFollowerCount(fCount);
      setFollowingCount(fgCount);

      // Is current user following this profile?
      if (currentUser && currentUser.id !== targetUserId) {
        const following = await followService.isFollowing(currentUser.id, targetUserId);
        setIsFollowing(following);
      }
    } finally {
      setLoading(false);
    }
  }, [targetUserId, currentUser]);

  useEffect(() => { loadProfileData(); }, [loadProfileData]);

  const handleSendConnection = async () => {
    if (!currentUser || !profileUser) return;
    const conn = await connectionService.send(currentUser.id, profileUser.id);
    if (conn) {
      setConnection(conn);
      toast.success('Connection request sent!');
    } else {
      toast.error('Failed to send request.');
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const ok = await followService.unfollow(currentUser.id, profileUser.id);
        if (ok) {
          setIsFollowing(false);
          setFollowerCount(prev => Math.max(0, prev - 1));
          toast.success(`Unfollowed ${profileUser.name}`);
        }
      } else {
        const result = await followService.follow(currentUser.id, profileUser.id);
        if (result) {
          setIsFollowing(true);
          setFollowerCount(prev => prev + 1);
          toast.success(`Following ${profileUser.name}! 🎉`);
        } else {
          toast.error('Failed to follow. Please try again.');
        }
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
    setUploadingAvatar(true);
    try {
      const url = await storageService.uploadAvatar(currentUser.id, file);
      if (url) {
        await updateUser({ profilePicture: url });
        toast.success('Profile picture updated!');
        loadProfileData();
      } else {
        toast.error('Upload failed. Check your storage bucket settings.');
      }
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be less than 10MB'); return; }
    setUploadingCover(true);
    try {
      const url = await storageService.uploadCover(currentUser.id, file);
      if (url) {
        await updateUser({ coverPhoto: url });
        toast.success('Cover photo updated!');
        loadProfileData();
      } else {
        toast.error('Upload failed. Check your storage bucket settings.');
      }
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="h-64 skeleton rounded-2xl" />
        <div className="space-y-4 pt-16">
          <SkeletonCard type="post" count={2} />
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Users className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Profile Not Found</h2>
        <p className="text-gray-500 mb-6">This profile doesn't exist or has been removed.</p>
        <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
      </div>
    );
  }

  const roleGradient = {
    player: 'from-blue-600 via-purple-600 to-cyan-500',
    coach: 'from-emerald-600 via-teal-600 to-cyan-500',
    organization: 'from-orange-500 via-amber-500 to-red-400',
  }[profileUser.role];

  const canConnect = currentUser && !isOwnProfile &&
    currentUser.role === 'player' && profileUser.role === 'coach';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button (for non-own profiles) */}
      {!isOwnProfile && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-white font-bold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverUpload}
        className="hidden"
      />

      {/* Cover Photo */}
      <div className="relative mb-8">
        <div className={`h-56 sm:h-64 bg-gradient-to-r ${roleGradient} rounded-2xl relative overflow-hidden shadow-xl`}>
          {profileUser.coverPhoto && (
            <img src={profileUser.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/10 rounded-2xl" />
          {isOwnProfile && (
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/30 transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              {uploadingCover ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              {uploadingCover ? 'Uploading...' : 'Change Cover'}
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-12 left-6">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white dark:border-gray-900 overflow-hidden shadow-xl">
              <Avatar src={profileUser.profilePicture} name={profileUser.name} size="xl" role={profileUser.role} className="w-full h-full" />
            </div>
            {isOwnProfile && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-lg transition-all shadow-lg"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="pt-14">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
          <div>
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white">{profileUser.name}</h1>
              <Badge variant={profileUser.role} />
              {profileUser.role === 'player' && profileUser.playerProfile?.verificationStatus === 'verified' && (
                <Badge variant="verified" showIcon>Verified</Badge>
              )}
              {profileUser.role === 'player' && profileUser.playerProfile?.verificationStatus === 'pending' && (
                <Badge variant="pending">Verification Pending</Badge>
              )}
            </div>
            <p className="text-gray-400 font-semibold text-sm mb-2">@{profileUser.username}</p>
            {profileUser.location && (
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>{profileUser.location}</span>
              </div>
            )}
            {profileUser.bio && (
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-xl">{profileUser.bio}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 md:mt-0 flex gap-2 flex-wrap">
            {isOwnProfile ? (
              <button onClick={() => setIsEditing(true)} className="btn-energy flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            ) : currentUser && (
              <div className="flex gap-2 flex-wrap">
                {/* Follow / Following button — visible for ALL roles */}
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    isFollowing
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 border border-gray-200 dark:border-gray-700'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:opacity-90'
                  }`}
                >
                  {followLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    <><UserCheck className="w-4 h-4" /> Following</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Follow</>
                  )}
                </button>

                {/* Connect button for player→coach */}
                {canConnect && (
                  <>
                    {!connection && (
                      <button onClick={handleSendConnection} className="btn-primary flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Connect
                      </button>
                    )}
                    {connection?.status === 'pending' && (
                      <button disabled className="btn-ghost opacity-60">Request Sent</button>
                    )}
                    {connection?.status === 'accepted' && (
                      <button disabled className="btn-ghost flex items-center gap-2 text-green-600 border-green-200 dark:border-green-800">
                        <ShieldCheck className="w-4 h-4" />
                        Connected
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 mb-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden divide-x divide-gray-100 dark:divide-gray-700">
          {/* Followers / Following — always shown */}
          <div className="text-center p-4">
            <span className="text-xs text-gray-400 font-bold block mb-1">FOLLOWERS</span>
            <span className="font-black text-gray-800 dark:text-white text-lg">{followerCount}</span>
          </div>
          <div className="text-center p-4">
            <span className="text-xs text-gray-400 font-bold block mb-1">FOLLOWING</span>
            <span className="font-black text-gray-800 dark:text-white text-lg">{followingCount}</span>
          </div>

          {profileUser.role === 'player' && (
            <>
              <div className="text-center p-4">
                <span className="text-xs text-gray-400 font-bold block mb-1">ACHIEVEMENTS</span>
                <span className="font-black text-gray-800 dark:text-white text-lg">{achievements.length}</span>
              </div>
              <div className="text-center p-4">
                <span className="text-xs text-gray-400 font-bold block mb-1">SPORT</span>
                <span className="font-black text-gray-800 dark:text-white text-sm">{profileUser.playerProfile?.sport || profileUser.sport}</span>
              </div>
            </>
          )}
          {profileUser.role === 'coach' && (
            <>
              <div className="text-center p-4">
                <span className="text-xs text-gray-400 font-bold block mb-1">RATING</span>
                <span className="font-black text-yellow-500 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {profileUser.coachProfile?.rating || '5.0'}
                </span>
              </div>
              <div className="text-center p-4">
                <span className="text-xs text-gray-400 font-bold block mb-1">CONNECTIONS</span>
                <span className="font-black text-gray-800 dark:text-white text-lg">{connectionCount}</span>
              </div>
            </>
          )}
          {profileUser.role === 'organization' && (
            <>
              <div className="text-center p-4">
                <span className="text-xs text-gray-400 font-bold block mb-1">EVENTS</span>
                <span className="font-black text-gray-800 dark:text-white text-lg">{hostedEvents.length}</span>
              </div>
              <div className="text-center p-4">
                <span className="text-xs text-gray-400 font-bold block mb-1">CONNECTIONS</span>
                <span className="font-black text-gray-800 dark:text-white text-lg">{connectionCount}</span>
              </div>
            </>
          )}
        </div>

        {/* Player: Achievements */}
        {profileUser.role === 'player' && (
          <AchievementsSection achievements={achievements} />
        )}

        {/* Coach: Certifications */}
        {profileUser.role === 'coach' && (profileUser.coachProfile?.certifications?.length ?? 0) > 0 && (
          <div className="card-sports p-6 mb-6">
            <h3 className="section-header">
              <Award className="w-5 h-5 text-blue-500" />
              Professional Certifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {profileUser.coachProfile!.certifications.map((cert, i) => (
                <span key={i} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-xl border border-blue-100 dark:border-blue-800">
                  📜 {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Organization: Events */}
        {profileUser.role === 'organization' && hostedEvents.length > 0 && (
          <div className="card-sports p-6 mb-6">
            <h3 className="section-header">
              <Calendar className="w-5 h-5 text-orange-500" />
              Hosted Events &amp; Tournaments
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hostedEvents.map((event) => (
                <div key={event.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <h4 className="font-extrabold text-sm text-gray-800 dark:text-white">{event.eventName}</h4>
                  <p className="text-xs text-gray-400 mt-1 font-semibold">{event.sport}</p>
                  <p className="text-xs text-blue-500 font-bold mt-1">{event.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Posts */}
        {recentPosts.length > 0 && (
          <div className="mb-6">
            <h3 className="section-header mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              Recent Posts
            </h3>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} onUpdate={() => {}} />
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        {profileUser.contactInfo && Object.values(profileUser.contactInfo).some(Boolean) && (
          <div className="card-sports p-6">
            <h3 className="section-header">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {profileUser.contactInfo.phone && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">{profileUser.contactInfo.phone}</span>
                </div>
              )}
              {profileUser.contactInfo.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <a href={profileUser.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-bold">
                    {profileUser.contactInfo.website}
                  </a>
                </div>
              )}
              {profileUser.contactInfo.instagram && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <LinkIcon className="w-4 h-4 text-pink-500" />
                  <span className="font-semibold">{profileUser.contactInfo.instagram}</span>
                </div>
              )}
              {profileUser.contactInfo.twitter && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <LinkIcon className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold">{profileUser.contactInfo.twitter}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile Editor Modal */}
      {isOwnProfile && isEditing && (
        <ProfileEditor
          user={profileUser}
          onClose={() => {
            setIsEditing(false);
            loadProfileData();
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;