'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, UserRole } from '@/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, fullName: string, password: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

// ── Demo Accounts ──────────────────────────────────────────────────────
// These are the built-in demo accounts with their passwords.
// They work immediately without any Supabase configuration.

export const DEMO_ACCOUNTS = [
  {
    name: 'Alex Vance',
    email: 'alex.manager@stocksense.io',
    password: 'Manager@123',
    role: 'manager' as UserRole,
    description: 'Inventory Manager — Full access to all operations, adjustments, and reports',
  },
  {
    name: 'Marcus Chen',
    email: 'marcus.staff@stocksense.io',
    password: 'Staff@123',
    role: 'staff' as UserRole,
    description: 'Warehouse Staff — Floor intake, dispatches, and basic operations',
  },
  {
    name: 'Sarah Kim',
    email: 'sarah.admin@stocksense.io',
    password: 'Admin@123',
    role: 'admin' as UserRole,
    description: 'System Admin — Full system configuration and user management',
  },
] as const;

const DEFAULT_MANAGER: Profile = {
  id: 'a0000001-0000-0000-0000-000000000001',
  user_id: '00000000-0000-0000-0000-000000000001',
  full_name: 'Alex Vance',
  email: 'alex.manager@stocksense.io',
  role: 'manager',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  created_at: new Date().toISOString()
};

const DEFAULT_STAFF: Profile = {
  id: 'a0000001-0000-0000-0000-000000000002',
  user_id: '00000000-0000-0000-0000-000000000002',
  full_name: 'Marcus Chen',
  email: 'marcus.staff@stocksense.io',
  role: 'staff',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  created_at: new Date().toISOString()
};

const DEFAULT_ADMIN: Profile = {
  id: 'a0000001-0000-0000-0000-000000000003',
  user_id: '00000000-0000-0000-0000-000000000003',
  full_name: 'Sarah Kim',
  email: 'sarah.admin@stocksense.io',
  role: 'admin',
  avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  created_at: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'manager',
  isLoading: false,
  login: async () => ({ success: true }),
  signup: async () => ({ success: true }),
  logout: async () => {},
  switchRole: () => {},
  resetPassword: async () => ({ success: true })
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local stored session
    try {
      const stored = localStorage.getItem('stocksense_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setIsLoading(false);

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            user_id: session.user.id,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || 'user@stocksense.io',
            role: (session.user.user_metadata?.role as UserRole) || 'manager',
            created_at: session.user.created_at
          });
        }
        setIsLoading(false);
      });
    }
  }, []);

  const login = async (email: string, password: string, selectedRole?: UserRole) => {
    setIsLoading(true);
    try {
      // 1. Check demo accounts first (password must match)
      const demoAccount = DEMO_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === email.toLowerCase()
      );

      if (demoAccount) {
        if (password !== demoAccount.password) {
          setIsLoading(false);
          return { success: false, error: 'Invalid password. Check the demo credentials shown on the login page.' };
        }

        const profileMap: Record<string, Profile> = {
          'alex.manager@stocksense.io': DEFAULT_MANAGER,
          'marcus.staff@stocksense.io': DEFAULT_STAFF,
          'sarah.admin@stocksense.io': DEFAULT_ADMIN,
        };

        const activeUser = profileMap[demoAccount.email] || DEFAULT_MANAGER;
        setUser(activeUser);
        localStorage.setItem('stocksense_user', JSON.stringify(activeUser));
        setIsLoading(false);
        return { success: true };
      }

      // 2. Try Supabase auth if configured
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const supabaseUser: Profile = {
            id: session.user.id,
            user_id: session.user.id,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || email,
            role: (session.user.user_metadata?.role as UserRole) || selectedRole || 'staff',
            created_at: session.user.created_at,
          };
          setUser(supabaseUser);
          localStorage.setItem('stocksense_user', JSON.stringify(supabaseUser));
          setIsLoading(false);
          return { success: true };
        }
      }

      // 3. Fallback: allow custom login for non-demo emails (hackathon flexibility)
      if (password.length >= 6) {
        const customUser: Profile = {
          id: `u-${Date.now()}`,
          user_id: `auth-${Date.now()}`,
          full_name: email.split('@')[0].replace(/[._]/g, ' '),
          email,
          role: selectedRole || 'staff',
          created_at: new Date().toISOString(),
        };
        setUser(customUser);
        localStorage.setItem('stocksense_user', JSON.stringify(customUser));
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Invalid email or password.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const signup = async (email: string, fullName: string, password: string, role: UserRole = 'staff') => {
    setIsLoading(true);
    try {
      if (!fullName.trim() || !email.trim() || !password) {
        setIsLoading(false);
        return { success: false, error: 'All fields are required.' };
      }

      if (password.length < 6) {
        setIsLoading(false);
        return { success: false, error: 'Password must be at least 6 characters.' };
      }

      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role }
          }
        });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
      }

      const newUser: Profile = {
        id: `u-${Date.now()}`,
        user_id: `auth-${Date.now()}`,
        full_name: fullName,
        email,
        role,
        created_at: new Date().toISOString()
      };

      setUser(newUser);
      localStorage.setItem('stocksense_user', JSON.stringify(newUser));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Sign up failed' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('stocksense_user');
  };

  const switchRole = (newRole: UserRole) => {
    const roleMap: Record<UserRole, Profile> = {
      staff: DEFAULT_STAFF,
      manager: DEFAULT_MANAGER,
      admin: DEFAULT_ADMIN,
    };
    const updated = roleMap[newRole] || DEFAULT_MANAGER;
    setUser(updated);
    localStorage.setItem('stocksense_user', JSON.stringify(updated));
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(email);
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'manager',
        isLoading,
        login,
        signup,
        logout,
        switchRole,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
