import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, LoginCredentials } from '../utils/types';
import { loginUser, logoutUser } from '../services/authService';
import { STORAGE_KEYS } from '../utils/constants';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setRole(userData.userType);
      }
    } catch (err) {
      console.warn('Session restore failed:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(credentials: LoginCredentials) {
    const response = await loginUser(credentials);

    // Save complete user object as requested
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response));

    setUser(response);
    setRole(response.userType);
  }

  async function logout() {
    try {
      await logoutUser();
    } catch (_) {}
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ user, role, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
