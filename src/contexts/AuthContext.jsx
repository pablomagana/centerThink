import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '@/services/auth.service';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let isInitialLoad = true;

    // Check active session
    const initAuth = async () => {
      try {
        console.log('AuthContext: Checking session...');
        const session = await authService.getSession();
        console.log('AuthContext: Session checked', session);

        setSession(session);
        if (session?.user) {
          setUser(session.user);
          await loadProfile();
        } else {
          console.log('AuthContext: No active session');
        }
      } catch (error) {
        console.error('AuthContext: Error getting session', error);
      } finally {
        setLoading(false);
        console.log('AuthContext: Initial loading complete');
      }
    };

    initAuth();

    // Listen for auth changes (skip if it's the initial SIGNED_IN event)
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, 'isInitialLoad:', isInitialLoad);

        // Skip the initial SIGNED_IN event that happens right after page load
        // because we already handled it in initAuth()
        if (isInitialLoad && event === 'SIGNED_IN') {
          console.log('AuthContext: Skipping initial SIGNED_IN event');
          isInitialLoad = false;
          return;
        }

        isInitialLoad = false;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadProfile();
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadProfile = async () => {
    try {
      console.log('AuthContext: Loading profile...');
      const profileData = await authService.getCurrentProfile();
      console.log('AuthContext: Profile loaded', profileData);
      // Only update profile if we got valid data
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Don't set profile to null on error - keep the previous valid profile
      // Only clear it if it's a real sign-out
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.signIn(email, password);
      setUser(data.user);
      setSession(data.session);
      await loadProfile();
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
    refreshProfile: loadProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
