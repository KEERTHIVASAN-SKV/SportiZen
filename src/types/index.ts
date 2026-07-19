// ============================================================
// SPORTIZEN — TYPE DEFINITIONS (Supabase-aligned)
// ============================================================

export type UserRole = 'player' | 'coach' | 'organization';

export interface ContactInfo {
  phone?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
}

// -------------------------------------------------------
// CORE PROFILE (maps to public.profiles)
// -------------------------------------------------------
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
  coverPhoto?: string;
  sport: string;
  location?: string;
  bio?: string;
  experience?: string;
  createdAt: string;

  // Nested role-specific data (joined from sub-tables)
  playerProfile?: PlayerProfile;
  coachProfile?: CoachProfile;
  orgProfile?: OrgProfile;

  // Social counts (computed from joins)
  achievements: Achievement[];
  followers: string[];
  following: string[];
  contactInfo?: ContactInfo;
}

// -------------------------------------------------------
// ROLE-SPECIFIC PROFILES
// -------------------------------------------------------
export interface PlayerProfile {
  age?: number;
  gender?: string;
  sport: string;
  position?: string;
  bio?: string;
  location?: string;
  contactInfo?: ContactInfo;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'none';
}

export interface CoachProfile {
  experience: string;
  certifications: string[];
  sportsCategory: string;
  bio?: string;
  location?: string;
  rating?: number;
  contactInfo?: ContactInfo;
}

export interface OrgProfile {
  organizationName: string;
  address: string;
  description: string;
  website?: string;
  phone?: string;
}

// -------------------------------------------------------
// ACHIEVEMENTS (public.achievements)
// -------------------------------------------------------
export interface Achievement {
  id: string;
  playerId?: string;
  title: string;
  description: string;
  date: string;
  type: 'medal' | 'trophy' | 'certificate' | 'record';
  image?: string;
  certificateUrl?: string;
}

// -------------------------------------------------------
// POSTS (public.posts)
// -------------------------------------------------------
export interface Post {
  id: string;
  userId: string;
  username: string;
  name: string;
  profilePicture?: string;
  role: UserRole;
  content: string;
  image?: string;
  type: 'general' | 'achievement' | 'milestone' | 'coaching_update' | 'announcement';
  timestamp: string;
  likes: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  postId?: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
}

// -------------------------------------------------------
// EVENTS (public.events)
// -------------------------------------------------------
export interface Event {
  id: string;
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
  registrationCount?: number;
  createdAt?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  playerId: string;
  playerName: string;
  playerSport: string;
  registrationDate: string;
  status: 'registered' | 'cancelled';
  notes?: string;
}

// -------------------------------------------------------
// CONNECTIONS (public.connections)
// -------------------------------------------------------
export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

// -------------------------------------------------------
// FOLLOWS (public.follows)
// -------------------------------------------------------
export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

// -------------------------------------------------------
// VERIFICATION (public.verification_documents)
// -------------------------------------------------------
export interface VerificationDocument {
  id: string;
  playerId: string;
  playerName: string;
  documentType: 'college_id' | 'sports_certificate';
  fileUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  aiAnalysisResult?: string;
}

// -------------------------------------------------------
// NOTIFICATIONS (public.notifications)
// -------------------------------------------------------
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'connection_request'
    | 'connection_accepted'
    | 'event_registration'
    | 'verification_status'
    | 'like'
    | 'comment'
    | 'follow';
  isRead: boolean;
  createdAt: string;
}

// -------------------------------------------------------
// CONSTANTS
// -------------------------------------------------------
export const SPORTS_CATEGORIES = [
  'Football',
  'Basketball',
  'Soccer',
  'Tennis',
  'Cricket',
  'Baseball',
  'Swimming',
  'Athletics',
  'Boxing',
  'Wrestling',
  'Volleyball',
  'Golf',
  'Hockey',
  'Rugby',
  'Badminton',
  'Table Tennis',
  'Cycling',
  'Running',
  'Gymnastics',
  'Other',
];