// ============================================================
// SPORTIZEN — Supabase Service Layer
// Replaces the entire mockDb.ts with real Supabase queries
// ============================================================
import { supabase } from '../lib/supabase';
import {
  User,
  Post,
  Comment,
  Event,
  EventRegistration,
  Connection,
  Follow,
  Achievement,
  VerificationDocument,
  Notification,
} from '../types';

// ------------------------------------------------------------------
// HELPERS: Map DB snake_case rows → UI camelCase types
// ------------------------------------------------------------------

const mapProfile = (row: any): User => ({
  id: row.id,
  username: row.username || '',
  name: row.name || '',
  email: row.email || '',
  role: row.role,
  profilePicture: row.profile_picture || undefined,
  coverPhoto: row.cover_photo || undefined,
  sport: row.sport || 'Other',
  location: row.location || undefined,
  bio: row.bio || undefined,
  experience: row.experience || undefined,
  createdAt: row.created_at,
  achievements: [],
  followers: [],
  following: [],
  contactInfo: row.contact_info || undefined,
  playerProfile: row.player_profiles
    ? {
        age: row.player_profiles.age,
        gender: row.player_profiles.gender,
        sport: row.player_profiles.sport || row.sport,
        position: row.player_profiles.position,
        bio: row.player_profiles.bio,
        location: row.player_profiles.location,
        verificationStatus: row.player_profiles.verification_status || 'none',
        contactInfo: row.player_profiles.contact_info,
      }
    : undefined,
  coachProfile: row.coach_profiles
    ? {
        experience: row.coach_profiles.experience || '0 years',
        certifications: row.coach_profiles.certifications || [],
        sportsCategory: row.coach_profiles.sports_category || row.sport,
        bio: row.coach_profiles.bio,
        location: row.coach_profiles.location,
        rating: row.coach_profiles.rating,
        contactInfo: row.coach_profiles.contact_info,
      }
    : undefined,
  orgProfile: row.org_profiles
    ? {
        organizationName: row.org_profiles.organization_name || row.name,
        address: row.org_profiles.address || '',
        description: row.org_profiles.description || '',
        website: row.org_profiles.website,
        phone: row.org_profiles.phone,
      }
    : undefined,
});

const mapPost = (row: any): Post => ({
  id: row.id,
  userId: row.user_id,
  username: row.profiles?.username || row.username || '',
  name: row.profiles?.name || row.name || '',
  profilePicture: row.profiles?.profile_picture || row.profile_picture,
  role: row.profiles?.role || row.role || 'player',
  content: row.content,
  image: row.image || undefined,
  type: row.type || 'general',
  timestamp: row.timestamp || row.created_at,
  likes: row.likes || [],
  comments: [],
});

const mapEvent = (row: any): Event => ({
  id: row.id,
  organizationId: row.organization_id,
  organizationName: row.organization_name || row.profiles?.name || '',
  eventName: row.event_name,
  sport: row.sport,
  venue: row.venue,
  eligibility: row.eligibility,
  date: row.date,
  registrationDeadline: row.registration_deadline,
  description: row.description,
  posterUrl: row.poster_url || undefined,
  maxParticipants: row.max_participants,
  registrationCount: row.registration_count,
  createdAt: row.created_at,
});

const mapConnection = (row: any): Connection => ({
  id: row.id,
  requesterId: row.requester_id,
  receiverId: row.receiver_id,
  status: row.status,
  createdAt: row.created_at,
});

const mapAchievement = (row: any): Achievement => ({
  id: row.id,
  playerId: row.player_id,
  title: row.title,
  description: row.description,
  date: row.date,
  type: row.type,
  image: row.image_url,
  certificateUrl: row.certificate_url,
});

const mapVerificationDoc = (row: any): VerificationDocument => ({
  id: row.id,
  playerId: row.player_id,
  playerName: row.player_name,
  documentType: row.document_type,
  fileUrl: row.file_url,
  status: row.status,
  uploadedAt: row.uploaded_at,
  aiAnalysisResult: row.ai_analysis_result,
});

const mapNotification = (row: any): Notification => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  message: row.message,
  type: row.type,
  isRead: row.is_read,
  createdAt: row.created_at,
});

const mapComment = (row: any): Comment => ({
  id: row.id,
  postId: row.post_id,
  userId: row.user_id,
  username: row.profiles?.username || row.username || '',
  content: row.content,
  timestamp: row.timestamp || row.created_at,
});

// ------------------------------------------------------------------
// PROFILES
// ------------------------------------------------------------------
export const profileService = {
  /** Get a single profile by ID with all nested role data */
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        player_profiles (*),
        coach_profiles (*),
        org_profiles (*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapProfile(data);
  },

  /** Get current authenticated user's profile */
  async getCurrent(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return profileService.getById(user.id);
  },

  /** Update a profile (basic fields) */
  async update(id: string, updates: {
    name?: string;
    bio?: string;
    location?: string;
    sport?: string;
    profile_picture?: string;
    cover_photo?: string;
    experience?: string;
    contact_info?: object;
  }): Promise<User | null> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return profileService.getById(id);
  },

  /** Update player-specific profile */
  async updatePlayerProfile(userId: string, updates: {
    age?: number;
    gender?: string;
    sport?: string;
    position?: string;
    bio?: string;
    location?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('player_profiles')
      .update(updates)
      .eq('user_id', userId);
    if (error) throw error;
  },

  /** Update coach-specific profile */
  async updateCoachProfile(userId: string, updates: {
    experience?: string;
    certifications?: string[];
    sports_category?: string;
    bio?: string;
    location?: string;
    rating?: number;
  }): Promise<void> {
    const { error } = await supabase
      .from('coach_profiles')
      .update(updates)
      .eq('user_id', userId);
    if (error) throw error;
  },

  /** Update org-specific profile */
  async updateOrgProfile(userId: string, updates: {
    organization_name?: string;
    address?: string;
    description?: string;
    website?: string;
    phone?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('org_profiles')
      .update(updates)
      .eq('user_id', userId);
    if (error) throw error;
  },

  /** Search profiles by role, sport, location, name */
  async search(params: {
    query?: string;
    role?: string;
    sport?: string;
    location?: string;
    limit?: number;
  }): Promise<User[]> {
    let q = supabase
      .from('profiles')
      .select(`
        *,
        player_profiles (*),
        coach_profiles (*),
        org_profiles (*)
      `)
      .limit(params.limit || 50);

    if (params.role) q = q.eq('role', params.role);
    if (params.sport) q = q.eq('sport', params.sport);
    if (params.location) q = q.ilike('location', `%${params.location}%`);
    if (params.query) {
      q = q.or(
        `name.ilike.%${params.query}%,username.ilike.%${params.query}%,bio.ilike.%${params.query}%`
      );
    }

    const { data, error } = await q;
    if (error || !data) return [];
    return data.map(mapProfile);
  },

  /** Get all profiles by role */
  async getByRole(role: 'player' | 'coach' | 'organization'): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        player_profiles (*),
        coach_profiles (*),
        org_profiles (*)
      `)
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapProfile);
  },
};

// ------------------------------------------------------------------
// ACHIEVEMENTS
// ------------------------------------------------------------------
export const achievementService = {
  async getForUser(playerId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('player_id', playerId)
      .order('date', { ascending: false });

    if (error || !data) return [];
    return data.map(mapAchievement);
  },

  async add(playerId: string, achievement: {
    title: string;
    description: string;
    date: string;
    type: 'medal' | 'trophy' | 'certificate' | 'record';
    image_url?: string;
  }): Promise<Achievement | null> {
    const { data, error } = await supabase
      .from('achievements')
      .insert({ player_id: playerId, ...achievement })
      .select()
      .single();

    if (error || !data) return null;
    return mapAchievement(data);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('achievements').delete().eq('id', id);
    return !error;
  },
};

// ------------------------------------------------------------------
// POSTS
// ------------------------------------------------------------------
export const postService = {
  /** Paginated feed */
  async getFeed(page = 0, limit = 10): Promise<Post[]> {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (id, username, name, profile_picture, role)
      `)
      .order('timestamp', { ascending: false })
      .range(from, to);

    if (error || !data) return [];
    return data.map(mapPost);
  },

  /** Get posts by a specific user */
  async getByUser(userId: string, limit = 5): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (id, username, name, profile_picture, role)
      `)
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map(mapPost);
  },

  async create(params: {
    userId: string;
    username: string;
    name: string;
    role: string;
    profilePicture?: string;
    content: string;
    type: string;
    image?: string;
  }): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: params.userId,
        username: params.username,
        name: params.name,
        role: params.role,
        profile_picture: params.profilePicture || null,
        content: params.content,
        type: params.type,
        image: params.image || null,
        timestamp: new Date().toISOString(),
        likes: [],
      })
      .select(`
        *,
        profiles:user_id (id, username, name, profile_picture, role)
      `)
      .single();

    if (error) {
      console.error('[postService.create] Supabase error:', error.message, error.details || '');
      throw new Error(error.message);
    }
    if (!data) return null;
    return mapPost(data);
  },

  async like(postId: string, userId: string): Promise<void> {
    // Read current likes, toggle, write back
    const { data } = await supabase
      .from('posts')
      .select('likes')
      .eq('id', postId)
      .single();

    if (!data) return;
    const currentLikes: string[] = data.likes || [];
    const alreadyLiked = currentLikes.includes(userId);
    const newLikes = alreadyLiked
      ? currentLikes.filter((id) => id !== userId)
      : [...currentLikes, userId];

    await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);

    // Notify post owner on new like (not on unlike)
    if (!alreadyLiked) {
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();
      if (post && post.user_id !== userId) {
        const { data: liker } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', userId)
          .single();
        await notificationService.create({
          userId: post.user_id,
          title: 'Post Liked',
          message: `${liker?.name || 'Someone'} liked your post.`,
          type: 'like',
        });
      }
    }
  },

  async delete(postId: string): Promise<boolean> {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    return !error;
  },
};

// ------------------------------------------------------------------
// COMMENTS
// ------------------------------------------------------------------
export const commentService = {
  async getForPost(postId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (id, username, name)
      `)
      .eq('post_id', postId)
      .order('timestamp', { ascending: true });

    if (error || !data) return [];
    return data.map(mapComment);
  },

  async add(params: {
    postId: string;
    userId: string;
    content: string;
  }): Promise<Comment | null> {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: params.postId,
        user_id: params.userId,
        content: params.content,
        timestamp: new Date().toISOString(),
      })
      .select(`
        *,
        profiles:user_id (id, username, name)
      `)
      .single();

    if (error || !data) return null;

    // Notify post owner
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', params.postId)
      .single();
    if (post && post.user_id !== params.userId) {
      const { data: commenter } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', params.userId)
        .single();
      await notificationService.create({
        userId: post.user_id,
        title: 'New Comment',
        message: `${commenter?.username || 'Someone'} commented on your post.`,
        type: 'comment',
      });
    }

    return mapComment(data);
  },
};

// ------------------------------------------------------------------
// EVENTS
// ------------------------------------------------------------------
export const eventService = {
  async getAll(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*, profiles:organization_id (name)')
      .order('date', { ascending: true });

    if (error || !data) return [];
    return data.map(mapEvent);
  },

  async getByOrganization(orgId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapEvent);
  },

  async getById(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*, profiles:organization_id (name)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapEvent(data);
  },

  async create(params: {
    organizationId: string;
    organizationName: string;
    eventName: string;
    sport: string;
    venue: string;
    eligibility: string;
    date: string;
    registrationDeadline: string;
    description: string;
    posterUrl?: string;
    maxParticipants?: number;
  }): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .insert({
        organization_id: params.organizationId,
        organization_name: params.organizationName,
        event_name: params.eventName,
        sport: params.sport,
        venue: params.venue,
        eligibility: params.eligibility,
        date: params.date,
        registration_deadline: params.registrationDeadline,
        description: params.description,
        poster_url: params.posterUrl || null,
        max_participants: params.maxParticipants || null,
      })
      .select()
      .single();

    if (error || !data) return null;

    // Notify players who match this sport
    const { data: players } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'player')
      .or(`sport.eq.${params.sport},sport.eq.Other`);

    if (players) {
      const notifications = players.map((p: any) => ({
        user_id: p.id,
        title: 'New Event Matching Your Sport!',
        message: `${params.organizationName} created "${params.eventName}". Register by ${params.registrationDeadline}!`,
        type: 'event_registration',
      }));
      await supabase.from('notifications').insert(notifications);
    }

    return mapEvent(data);
  },

  async update(id: string, updates: Partial<{
    event_name: string;
    sport: string;
    venue: string;
    eligibility: string;
    date: string;
    registration_deadline: string;
    description: string;
    poster_url: string;
    max_participants: number;
  }>): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return null;
    return mapEvent(data);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('events').delete().eq('id', id);
    return !error;
  },
};

// ------------------------------------------------------------------
// EVENT REGISTRATIONS
// ------------------------------------------------------------------
export const registrationService = {
  async getForPlayer(playerId: string): Promise<EventRegistration[]> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('player_id', playerId)
      .eq('status', 'registered');

    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      eventId: r.event_id,
      playerId: r.player_id,
      playerName: r.player_name,
      playerSport: r.player_sport,
      registrationDate: r.registration_date,
      status: r.status,
      notes: r.notes,
    }));
  },

  async getForEvent(eventId: string): Promise<EventRegistration[]> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId);

    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      eventId: r.event_id,
      playerId: r.player_id,
      playerName: r.player_name,
      playerSport: r.player_sport,
      registrationDate: r.registration_date,
      status: r.status,
      notes: r.notes,
    }));
  },

  async getCountForEvent(eventId: string): Promise<number> {
    const { count } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'registered');
    return count || 0;
  },

  async register(params: {
    eventId: string;
    playerId: string;
    playerName: string;
    playerSport: string;
    notes?: string;
  }): Promise<EventRegistration | null> {
    // Upsert: if cancelled, re-register
    const { data, error } = await supabase
      .from('event_registrations')
      .upsert(
        {
          event_id: params.eventId,
          player_id: params.playerId,
          player_name: params.playerName,
          player_sport: params.playerSport,
          notes: params.notes,
          status: 'registered',
          registration_date: new Date().toISOString(),
        },
        { onConflict: 'event_id,player_id' }
      )
      .select()
      .single();

    if (error || !data) return null;

    // Notify organization
    const event = await eventService.getById(params.eventId);
    if (event) {
      await notificationService.create({
        userId: event.organizationId,
        title: 'New Event Registration',
        message: `${params.playerName} registered for your event "${event.eventName}".`,
        type: 'event_registration',
      });
    }

    return {
      id: data.id,
      eventId: data.event_id,
      playerId: data.player_id,
      playerName: data.player_name,
      playerSport: data.player_sport,
      registrationDate: data.registration_date,
      status: data.status,
      notes: data.notes,
    };
  },

  async cancel(eventId: string, playerId: string): Promise<boolean> {
    const { error } = await supabase
      .from('event_registrations')
      .update({ status: 'cancelled' })
      .eq('event_id', eventId)
      .eq('player_id', playerId);
    return !error;
  },

  async getPlayerRegistrationStatus(
    eventId: string,
    playerId: string
  ): Promise<'registered' | 'cancelled' | null> {
    const { data } = await supabase
      .from('event_registrations')
      .select('status')
      .eq('event_id', eventId)
      .eq('player_id', playerId)
      .maybeSingle();

    return data?.status || null;
  },
};

// ------------------------------------------------------------------
// CONNECTIONS
// ------------------------------------------------------------------
export const connectionService = {
  async getStatus(
    userId1: string,
    userId2: string
  ): Promise<Connection | null> {
    const { data } = await supabase
      .from('connections')
      .select('*')
      .or(
        `and(requester_id.eq.${userId1},receiver_id.eq.${userId2}),and(requester_id.eq.${userId2},receiver_id.eq.${userId1})`
      )
      .maybeSingle();

    if (!data) return null;
    return mapConnection(data);
  },

  async getPendingForUser(userId: string): Promise<{ connection: Connection; profile: User }[]> {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        profiles:requester_id (*, player_profiles (*), coach_profiles (*), org_profiles (*))
      `)
      .eq('receiver_id', userId)
      .eq('status', 'pending');

    if (error || !data) return [];
    return data.map((row: any) => ({
      connection: mapConnection(row),
      profile: mapProfile(row.profiles),
    }));
  },

  async getAcceptedForUser(userId: string): Promise<User[]> {
    const { data: asRequester } = await supabase
      .from('connections')
      .select(`
        receiver:receiver_id (*, player_profiles (*), coach_profiles (*), org_profiles (*))
      `)
      .eq('requester_id', userId)
      .eq('status', 'accepted');

    const { data: asReceiver } = await supabase
      .from('connections')
      .select(`
        requester:requester_id (*, player_profiles (*), coach_profiles (*), org_profiles (*))
      `)
      .eq('receiver_id', userId)
      .eq('status', 'accepted');

    const users: User[] = [];
    (asRequester || []).forEach((r: any) => r.receiver && users.push(mapProfile(r.receiver)));
    (asReceiver || []).forEach((r: any) => r.requester && users.push(mapProfile(r.requester)));
    return users;
  },

  async getCountForUser(userId: string): Promise<number> {
    const { count } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted');
    return count || 0;
  },

  async send(requesterId: string, receiverId: string): Promise<Connection | null> {
    const existing = await connectionService.getStatus(requesterId, receiverId);
    if (existing) return existing;

    const { data, error } = await supabase
      .from('connections')
      .insert({ requester_id: requesterId, receiver_id: receiverId, status: 'pending' })
      .select()
      .single();

    if (error || !data) return null;

    const { data: requester } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', requesterId)
      .single();

    await notificationService.create({
      userId: receiverId,
      title: 'Connection Request',
      message: `${requester?.name || 'Someone'} wants to connect with you.`,
      type: 'connection_request',
    });

    return mapConnection(data);
  },

  async accept(connectionId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', connectionId)
      .select()
      .single();

    if (error || !data) return false;

    const { data: receiver } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', data.receiver_id)
      .single();

    await notificationService.create({
      userId: data.requester_id,
      title: 'Connection Accepted',
      message: `${receiver?.name || 'Someone'} accepted your connection request.`,
      type: 'connection_accepted',
    });

    return true;
  },

  async reject(connectionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('connections')
      .update({ status: 'rejected' })
      .eq('id', connectionId);
    return !error;
  },
};

// ------------------------------------------------------------------
// FOLLOWS
// ------------------------------------------------------------------
export const followService = {
  async follow(followerId: string, followingId: string): Promise<Follow | null> {
    const { data, error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId })
      .select()
      .single();

    if (error || !data) return null;

    // Notify the person being followed
    const { data: follower } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', followerId)
      .single();

    await notificationService.create({
      userId: followingId,
      title: 'New Follower',
      message: `${follower?.name || 'Someone'} started following you.`,
      type: 'follow',
    });

    return {
      id: data.id,
      followerId: data.follower_id,
      followingId: data.following_id,
      createdAt: data.created_at,
    };
  },

  async unfollow(followerId: string, followingId: string): Promise<boolean> {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    return !error;
  },

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();
    return !!data;
  },

  async getFollowerCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);
    return count || 0;
  },

  async getFollowingCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);
    return count || 0;
  },

  async getFollowers(userId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        profiles:follower_id (*, player_profiles (*), coach_profiles (*), org_profiles (*))
      `)
      .eq('following_id', userId);

    if (error || !data) return [];
    return data.map((r: any) => r.profiles).filter(Boolean).map(mapProfile);
  },

  async getFollowing(userId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        profiles:following_id (*, player_profiles (*), coach_profiles (*), org_profiles (*))
      `)
      .eq('follower_id', userId);

    if (error || !data) return [];
    return data.map((r: any) => r.profiles).filter(Boolean).map(mapProfile);
  },
};

// ------------------------------------------------------------------
// VERIFICATION DOCUMENTS
// ------------------------------------------------------------------
export const verificationService = {
  async getForPlayer(playerId: string): Promise<VerificationDocument[]> {
    const { data, error } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('player_id', playerId)
      .order('uploaded_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapVerificationDoc);
  },

  async getAllPending(): Promise<VerificationDocument[]> {
    const { data, error } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('status', 'pending')
      .order('uploaded_at', { ascending: true });

    if (error || !data) return [];
    return data.map(mapVerificationDoc);
  },

  async upload(params: {
    playerId: string;
    playerName: string;
    documentType: 'college_id' | 'sports_certificate';
    fileUrl: string;
  }): Promise<VerificationDocument | null> {
    const { data, error } = await supabase
      .from('verification_documents')
      .insert({
        player_id: params.playerId,
        player_name: params.playerName,
        document_type: params.documentType,
        file_url: params.fileUrl,
        status: 'pending',
      })
      .select()
      .single();

    if (error || !data) return null;

    // Update player verification status to pending
    await supabase
      .from('player_profiles')
      .update({ verification_status: 'pending' })
      .eq('user_id', params.playerId);

    // Notify orgs
    const { data: orgs } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'organization');

    if (orgs) {
      const notifs = orgs.map((org: any) => ({
        user_id: org.id,
        title: 'New Verification Request',
        message: `${params.playerName} uploaded a ${params.documentType.replace('_', ' ')} for verification.`,
        type: 'verification_status',
      }));
      await supabase.from('notifications').insert(notifs);
    }

    return mapVerificationDoc(data);
  },

  async updateStatus(
    docId: string,
    orgId: string,
    action: 'verify' | 'reject'
  ): Promise<boolean> {
    const status = action === 'verify' ? 'verified' : 'rejected';

    const { data: doc, error } = await supabase
      .from('verification_documents')
      .update({ status })
      .eq('id', docId)
      .select()
      .single();

    if (error || !doc) return false;

    // Update player profile verification status
    await supabase
      .from('player_profiles')
      .update({ verification_status: status })
      .eq('user_id', doc.player_id);

    const { data: org } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', orgId)
      .single();

    await notificationService.create({
      userId: doc.player_id,
      title: status === 'verified' ? '🎉 Profile Verified!' : 'Verification Rejected',
      message:
        status === 'verified'
          ? `Congratulations! Your profile has been verified by ${org?.name}.`
          : `Your verification was rejected by ${org?.name}. Please upload a valid document.`,
      type: 'verification_status',
    });

    return true;
  },
};

// ------------------------------------------------------------------
// NOTIFICATIONS
// ------------------------------------------------------------------
export const notificationService = {
  async getForUser(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return data.map(mapNotification);
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    return count || 0;
  },

  async markAllRead(userId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  },

  async create(params: {
    userId: string;
    title: string;
    message: string;
    type: Notification['type'];
  }): Promise<void> {
    await supabase.from('notifications').insert({
      user_id: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
    });
  },
};

// ------------------------------------------------------------------
// STORAGE
// ------------------------------------------------------------------
export const storageService = {
  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (error) {
      console.error('[storage.uploadAvatar] Failed:', error.message);
      return null;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadEventPoster(orgId: string, eventId: string, file: File): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const path = `${orgId}/${eventId}.${ext}`;

    const { error } = await supabase.storage
      .from('event-posters')
      .upload(path, file, { upsert: true });

    if (error) return null;

    const { data } = supabase.storage.from('event-posters').getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadCertificate(userId: string, file: File): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('certificates')
      .upload(path, file, { upsert: false });

    if (error) {
      console.error('[storage.uploadCertificate] Failed:', error.message, '| Make sure fix_storage_policies.sql was run in Supabase SQL Editor.');
      return null;
    }

    const { data } = supabase.storage.from('certificates').getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadCover(userId: string, file: File): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const path = `${userId}/cover.${ext}`;

    const { error } = await supabase.storage
      .from('covers')
      .upload(path, file, { upsert: true });

    if (error) return null;

    const { data } = supabase.storage.from('covers').getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadPostMedia(userId: string, file: File): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('post-media')
      .upload(path, file, { upsert: false });

    if (error) return null;

    const { data } = supabase.storage.from('post-media').getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadAchievementImage(userId: string, file: File): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('achievement-media')
      .upload(path, file, { upsert: false });

    if (error) return null;

    const { data } = supabase.storage.from('achievement-media').getPublicUrl(path);
    return data.publicUrl;
  },
};
