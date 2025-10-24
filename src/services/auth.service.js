import { supabase } from '@/lib/supabase'

export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  /**
   * Sign up new user
   */
  async signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    if (error) throw error
    return data
  },

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  /**
   * Get current user with profile data
   */
  async getCurrentProfile() {
    try {
      console.log('authService: Getting current user...');

      // Add timeout to prevent hanging
      const userPromise = this.getCurrentUser();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout getting user')), 5000)
      );

      const user = await Promise.race([userPromise, timeoutPromise]);
      console.log('authService: Current user:', user);

      if (!user) {
        console.log('authService: No user found');
        return null;
      }

      console.log('authService: Fetching profile for user:', user.id);

      // Add timeout to profile query
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const profileTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout fetching profile')), 5000)
      );

      const { data, error } = await Promise.race([profilePromise, profileTimeoutPromise]);
      console.log('authService: Profile query result:', { data, error });

      if (error) {
        // If profile doesn't exist, return user with default profile
        console.warn('Profile not found or error:', error);
        return {
          id: user.id,
          email: user.email,
          role: 'user',
          cities: [],
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || ''
        };
      }

      return { ...user, ...data };
    } catch (error) {
      console.error('authService: Error in getCurrentProfile:', error);
      throw error;
    }
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }
}
