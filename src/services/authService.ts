import { supabase, handleSupabaseError } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  preferences: Record<string, any>;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private session: Session | null = null;

  async signUp({ email, password, fullName }: SignUpData): Promise<AuthUser> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0]
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Failed to create user');

      // The user profile will be created automatically via trigger
      return await this.getCurrentUser();
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async signIn({ email, password }: SignInData): Promise<AuthUser> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.user) throw new Error('Failed to sign in');

      this.session = data.session;
      return await this.getCurrentUser();
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
      this.session = null;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<AuthUser> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('No authenticated user');

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('User profile not found');

      this.currentUser = {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name || undefined,
        avatarUrl: profile.avatar_url || undefined,
        subscriptionTier: profile.subscription_tier,
        preferences: profile.preferences as Record<string, any>
      };

      return this.currentUser;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async updateProfile(updates: Partial<AuthUser>): Promise<AuthUser> {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: updates.fullName,
          avatar_url: updates.avatarUrl,
          subscription_tier: updates.subscriptionTier,
          preferences: updates.preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentUser.id);

      if (error) throw error;

      return await this.getCurrentUser();
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      this.session = session;
      return session;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      this.session = session;
      
      if (session?.user) {
        try {
          const user = await this.getCurrentUser();
          callback(user);
        } catch (error) {
          console.error('Error getting current user:', error);
          callback(null);
        }
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getUser(): AuthUser | null {
    return this.currentUser;
  }
}

export const authService = new AuthService();