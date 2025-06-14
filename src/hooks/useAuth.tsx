import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import { User } from '@/types';
import { adaptSupabaseUser } from '@/utils/type-adapters';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: AuthError | Error | null;
  signUp: (email: string, password: string) => Promise<{
    user: User | null;
    error: AuthError | Error | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    user: User | null;
    error: AuthError | Error | null;
  }>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  // Aliases for more intuitive naming
  login: (email: string, password: string) => Promise<{
    user: User | null;
    error: AuthError | Error | null;
  }>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | Error | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ? adaptSupabaseUser(session.user) : null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ? adaptSupabaseUser(session.user) : null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        setError(error);
        return { user: null, error };
      }

      const adaptedUser = data.user ? adaptSupabaseUser(data.user) : null;
      return { user: adaptedUser, error: null };
    } catch (error) {
      const authError = error as Error;
      setError(authError);
      return { user: null, error: authError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error);
        return { user: null, error };
      }

      const adaptedUser = data.user ? adaptSupabaseUser(data.user) : null;
      return { user: adaptedUser, error: null };
    } catch (error) {
      const authError = error as Error;
      setError(authError);
      return { user: null, error: authError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const redirectUrl = `${window.location.origin}/`;
      
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
    } catch (error) {
      const authError = error as Error;
      setError(authError);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error);
    } else {
      // Redirect to home page after successful logout
      window.location.href = '/';
    }
  };

  const value = {
    user,
    session,
    isLoading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    // Aliases for more intuitive naming
    login: signIn,
    loginWithGoogle: signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
