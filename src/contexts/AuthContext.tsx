import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { profileService, achievementService } from '../services/supabaseService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: {
    email: string;
    password: string;
    name: string;
    username: string;
    role: 'player' | 'coach' | 'organization';
    sport: string;
    location?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (authUserId: string) => {
    const profile = await profileService.getById(authUserId);
    if (profile) {
      // Also load achievements
      const achievements = await achievementService.getForUser(authUserId);
      setUser({ ...profile, achievements });
    }
    return profile;
  };

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Keep user in sync
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        await loadProfile(data.user.id);
      }
      return { success: true };
    } catch {
      return { success: false, error: 'An unexpected error occurred.' };
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    name: string;
    username: string;
    role: 'player' | 'coach' | 'organization';
    sport: string;
    location?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            username: userData.username,
            role: userData.role,
            sport: userData.sport,
            location: userData.location || '',
          },
        },
      });

      if (error) return { success: false, error: error.message };

      if (data.user) {
        // Profile is created by DB trigger; load it after a brief delay
        setTimeout(async () => {
          await loadProfile(data.user!.id);
        }, 1000);
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user) return;
    await loadProfile(user.id);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    // Map UI updates to DB column names
    const profileUpdates: any = {};
    if (updates.name !== undefined) profileUpdates.name = updates.name;
    if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
    if (updates.location !== undefined) profileUpdates.location = updates.location;
    if (updates.sport !== undefined) profileUpdates.sport = updates.sport;
    if (updates.profilePicture !== undefined) profileUpdates.profile_picture = updates.profilePicture;
    if (updates.coverPhoto !== undefined) profileUpdates.cover_photo = updates.coverPhoto;
    if (updates.experience !== undefined) profileUpdates.experience = updates.experience;
    if (updates.contactInfo !== undefined) profileUpdates.contact_info = updates.contactInfo;

    if (Object.keys(profileUpdates).length > 0) {
      await profileService.update(user.id, profileUpdates);
    }

    // Role-specific nested updates
    if (updates.playerProfile) {
      await profileService.updatePlayerProfile(user.id, {
        age: updates.playerProfile.age,
        gender: updates.playerProfile.gender,
        sport: updates.playerProfile.sport,
        position: updates.playerProfile.position,
        bio: updates.playerProfile.bio,
        location: updates.playerProfile.location,
      });
    }

    if (updates.coachProfile) {
      await profileService.updateCoachProfile(user.id, {
        experience: updates.coachProfile.experience,
        certifications: updates.coachProfile.certifications,
        sports_category: updates.coachProfile.sportsCategory,
        bio: updates.coachProfile.bio,
        location: updates.coachProfile.location,
        rating: updates.coachProfile.rating,
      });
    }

    if (updates.orgProfile) {
      await profileService.updateOrgProfile(user.id, {
        organization_name: updates.orgProfile.organizationName,
        address: updates.orgProfile.address,
        description: updates.orgProfile.description,
        website: updates.orgProfile.website,
        phone: updates.orgProfile.phone,
      });
    }

    // Reload fresh profile data
    await loadProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};