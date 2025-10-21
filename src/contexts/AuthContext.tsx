import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'freelancer' | 'client';
  avatar_url?: string;
  bio?: string;
  location?: string;
  phone?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: {
    email: string;
    password: string;
    full_name: string;
    role: 'freelancer' | 'client';
    phone?: string;
    location?: string;
    bio?: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (userData: {
    full_name?: string;
    phone?: string;
    location?: string;
    bio?: string;
    avatar_url?: string;
  }) => Promise<{ success: boolean; message: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          const response = await apiService.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            apiService.logout();
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          apiService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    full_name: string;
    role: 'freelancer' | 'client';
    phone?: string;
    location?: string;
    bio?: string;
  }) => {
    try {
      const response = await apiService.register(userData);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true, message: 'Registration successful' };
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const updateProfile = async (userData: {
    full_name?: string;
    phone?: string;
    location?: string;
    bio?: string;
    avatar_url?: string;
  }) => {
    try {
      const response = await apiService.updateProfile(userData);
      if (response.success && response.data) {
        setUser(response.data);
        return { success: true, message: 'Profile updated successfully' };
      } else {
        return { success: false, message: response.message || 'Update failed' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Update failed' };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
