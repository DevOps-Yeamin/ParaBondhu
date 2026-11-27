import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  isAuthenticated: false,
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('parabondhu_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('parabondhu_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    localStorage.setItem('parabondhu_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem('parabondhu_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('parabondhu_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'moderator',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
