'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { api, type AuthUser, type TokenPair } from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('polymath-access-token');
    if (token) {
      api
        .getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          // Token invalid/expired, clear
          localStorage.removeItem('polymath-access-token');
          localStorage.removeItem('polymath-refresh-token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('polymath-access-token', res.data.access_token);
    localStorage.setItem('polymath-refresh-token', res.data.refresh_token);
    const meRes = await api.getMe();
    setUser(meRes.data);
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      await api.register(email, password, displayName);
      // Auto-login after registration
      await login(email, password);
    },
    [login]
  );

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('polymath-refresh-token');
    if (refreshToken) {
      try {
        await api.logout(refreshToken);
      } catch {
        // ignore logout API errors
      }
    }
    localStorage.removeItem('polymath-access-token');
    localStorage.removeItem('polymath-refresh-token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
