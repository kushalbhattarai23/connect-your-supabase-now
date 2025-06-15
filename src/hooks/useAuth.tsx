
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
    let mounted = true;

    const updateAuthState = (session: Session | null) => {
      if (!mounted) return;
      
      console.log('Updating auth state:', session?.user?.email || 'No session');
      setSession(session);
      setUser(session?.user ? adaptSupabaseUser(session.user) : null);
      setIsLoading(false);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email || 'No session');
        updateAuthState(session);
      }
    );

    // Get initial session with proper error handling
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Error getting initial session:', error);
          setError(error);
          setIsLoading(false);
        } else {
          console.log('Initial session retrieved:', session?.user?.email || 'No session');
          updateAuthState(session);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Error in getInitialSession:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
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
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        setError(error);
        return { user: null, error };
      }

      console.log('Sign in successful:', data.user?.email);
      const adaptedUser = data.user ? adaptSupabaseUser(data.user) : null;
      return { user: adaptedUser, error: null };
    } catch (error) {
      const authError = error as Error;
      console.error('Sign in exception:', authError);
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
    try {
      console.log('Logging out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        setError(error);
      } else {
        console.log('Logout successful');
        // State will be updated automatically by the auth state listener
      }
    } catch (error) {
      console.error('Logout exception:', error);
      setError(error as Error);
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
