// AuthContext: Complete Supabase Authentication Lifecycle Provider

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { ProfileRow } from '../types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, pass: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPass: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  devQuickLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load profile for authenticated user
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as ProfileRow);
      } else if (!data) {
        // Fallback profile if trigger hasn't fired yet
        setProfile({
          id: userId,
          name: user?.user_metadata?.name || 'SmartSpend User',
          email: user?.email || '',
          currency: 'INR',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      setLoading(false);
    });

    // 2. Listen to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, pass: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (email: string, pass: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err) {
      console.warn('Error signing out:', err);
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updatePassword = async (newPass: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  // Quick helper for development demo
  const devQuickLogin = async () => {
    const demoEmail = 'demo@smartspend.app';
    const demoPass = 'Password123!';
    const { error } = await signIn(demoEmail, demoPass);
    if (error) {
      // If demo account doesn't exist yet, sign up
      await signUp(demoEmail, demoPass, 'Demo User');
      await signIn(demoEmail, demoPass);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPasswordForEmail,
        updatePassword,
        refreshProfile,
        devQuickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
