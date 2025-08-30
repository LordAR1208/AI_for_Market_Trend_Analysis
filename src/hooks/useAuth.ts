import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { authService, AuthUser, SignUpData, SignInData } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<AuthUser>;
  signIn: (data: SignInData) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (data: SignUpData): Promise<AuthUser> => {
    setLoading(true);
    try {
      const user = await authService.signUp(data);
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data: SignInData): Promise<AuthUser> => {
    setLoading(true);
    try {
      const user = await authService.signIn(data);
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>): Promise<AuthUser> => {
    try {
      const updatedUser = await authService.updateProfile(updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};</parameter>