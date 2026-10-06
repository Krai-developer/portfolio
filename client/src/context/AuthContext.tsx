import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ClientProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: ClientProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isClient: boolean;
  isAdmin: boolean;
  isVisitor: boolean;
  login: (credentials: { email: string; password: string }, portal: 'client' | 'admin') => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.auth.me();
      if (res.success && res.user) {
        setUser(res.user);
        setProfile(res.profile || null);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials: { email: string; password: string }, portal: 'client' | 'admin'): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.auth.login(credentials, portal);
      if (res.user) {
        setUser(res.user);
        if (res.user.role === 'client') {
          // fetch me to get profile
          await fetchCurrentUser();
        }
        return res.user;
      }
      throw new Error(res.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.auth.register(userData);
      if (res.user) {
        setUser(res.user);
        await fetchCurrentUser();
        return res.user;
      }
      throw new Error(res.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const updateProfile = async (profileData: any) => {
    const res = await api.auth.updateProfile(profileData);
    if (res.success) {
      if (res.user) setUser(res.user);
      if (res.profile) setProfile(res.profile);
    }
  };

  const isAuthenticated = !!user;
  const isClient = user?.role === 'client';
  const isAdmin = user?.role === 'admin';
  const isVisitor = !user;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated,
        isClient,
        isAdmin,
        isVisitor,
        login,
        register,
        logout,
        refreshUser,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
