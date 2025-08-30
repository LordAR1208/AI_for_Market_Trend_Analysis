import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../../services/authService';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn()
      })),
      insert: vi.fn()
    }))
  },
  handleSupabaseError: vi.fn()
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should create a new user account', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      };

      const mockProfile = {
        id: '123',
        email: 'test@example.com',
        full_name: 'Test User',
        subscription_tier: 'free',
        preferences: {}
      };

      // Mock successful signup
      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      });

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          }))
        }))
      } as any);

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      });

      expect(result.email).toBe('test@example.com');
      expect(result.fullName).toBe('Test User');
      expect(result.subscriptionTier).toBe('free');
    });

    it('should handle signup errors', async () => {
      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already exists' }
      });

      await expect(authService.signUp({
        email: 'test@example.com',
        password: 'password123'
      })).rejects.toThrow();
    });
  });

  describe('signIn', () => {
    it('should authenticate existing user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com'
      };

      const mockSession = {
        user: mockUser,
        access_token: 'token123'
      };

      const mockProfile = {
        id: '123',
        email: 'test@example.com',
        full_name: 'Test User',
        subscription_tier: 'free',
        preferences: {}
      };

      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          }))
        }))
      } as any);

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.email).toBe('test@example.com');
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null
      });

      await expect(authService.signOut()).resolves.not.toThrow();
    });
  });
});</parameter>