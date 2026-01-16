'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User } from '@/lib/api/auth.api';
import { getAuthToken, removeAuthToken } from '@/lib/api/config';

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  status?: number;
}

interface AuthResponse {
  user: User;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string; user?: User }>;
  signup: (data: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    password: string;
    type: 'USER' | 'CATERER' | 'ADMIN';
    company_name?: string;
  }) => Promise<{ error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get user from localStorage
const getUserFromStorage = (): User | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user_data');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
};

// Helper to save user to localStorage
const saveUserToStorage = (user: User | null): void => {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('user_data', JSON.stringify(user));
    } else {
      localStorage.removeItem('user_data');
    }
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize user from localStorage if available (for faster initial load)
  const [user, setUser] = useState<User | null>(getUserFromStorage());
  const [loading, setLoading] = useState(true);

  // Helper to update user state and persist to localStorage
  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    saveUserToStorage(newUser);
  };

  const refreshUser = async () => {
    const token = getAuthToken();
    
    if (!token) {
      updateUser(null);
      setLoading(false);
      return;
    }

    // Set loading to true
    setLoading(true);

    try {
      const response = await authApi.getCurrentUser();
      
      if (response.data?.user) {
        updateUser(response.data.user);
      } else if (response.error) {
        const isAuthError = response.status === 401 || 
                           response.status === 403 ||
                           response.error.includes('Unauthorized') || 
                           response.error.includes('Invalid token') ||
                           response.error.includes('Token expired');
        
        if (isAuthError) {
          removeAuthToken();
          updateUser(null);
        }
      }
    } catch (error) {
      // Network errors shouldn't log the user out
      // Keep existing user from localStorage
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      if (response.data?.data?.user) {
        const userData = response.data.data.user;
        const userObj: User = {
          id: userData.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          type: userData.type,
          company_name: userData.company_name,
          profile_completed: userData.profile_completed,
        };
        updateUser(userObj);
        setLoading(false);
        return { user: userObj };
      }
      
      if (response.data) {
        await refreshUser();
        return {};
      }
      
      return { 
        error: typeof response.error === 'string' 
          ? response.error 
          : response.error 
            ? JSON.stringify(response.error)
            : 'Login failed' 
      };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const signup = async (data: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    password: string;
    type: 'USER' | 'CATERER' | 'ADMIN';
    company_name?: string;
  }) => {
    try {
      const response = await authApi.signup(data);
      
      if (response.data?.data?.user) {
        const userData = response.data.data.user;
        const userObj: User = {
          id: userData.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          type: userData.type,
          company_name: userData.company_name,
          profile_completed: userData.profile_completed,
        };
        updateUser(userObj);
        setLoading(false);
        return {};
      }
      
      if (response.data) {
        await refreshUser();
        return {};
      }
      
      return { 
        error: typeof response.error === 'string' 
          ? response.error 
          : response.error 
            ? JSON.stringify(response.error)
            : 'Signup failed' 
      };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Signup failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, we still want to logout client-side
    } finally {
      removeAuthToken();
      updateUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

