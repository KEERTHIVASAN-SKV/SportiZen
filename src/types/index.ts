export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  sport: string;
  location?: string;
  experience?: string;
  achievements: Achievement[];
  followers: string[];
  following: string[];
  contactInfo?: ContactInfo;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'medal' | 'trophy' | 'certificate' | 'record';
  image?: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  name: string;
  profilePicture?: string;
  content: string;
  image?: string;
  type: 'general' | 'achievement' | 'milestone';
  timestamp: string;
  likes: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
}

export interface ContactInfo {
  phone?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
}

export const SPORTS_CATEGORIES = [
  'Football', 'Basketball', 'Soccer', 'Tennis', 'Cricket', 
  'Baseball', 'Swimming', 'Athletics', 'Boxing', 'Wrestling',
  'Volleyball', 'Golf', 'Hockey', 'Rugby', 'Badminton',
  'Table Tennis', 'Cycling', 'Running', 'Gymnastics', 'Other'
];