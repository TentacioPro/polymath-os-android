/**
 * Polymath OS Mobile Auth Store
 *
 * Zustand store for authentication state. Mirrors the web AuthProvider
 * (web/src/hooks/useAuth.tsx) but uses expo-secure-store for token
 * persistence instead of localStorage.
 */

import { create } from 'zustand';
import {
  storeTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
} from '../utils/auth';
import { authApi, type AuthUser } from '../utils/api';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;

  /** Check for existing session on app startup */
  initialize: () => Promise<void>;

  /** Log in with email + password */
  login: (email: string, password: string) => Promise<void>;

  /** Register a new account (auto-logs in on success) */
  register: (email: string, password: string, displayName?: string) => Promise<void>;

  /** Log out and clear tokens */
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        const res = await authApi.getMe();
        set({ user: res.data, isAuthenticated: true, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      // Token invalid or expired — clear and show login
      await clearTokens();
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    await storeTokens(res.data.access_token, res.data.refresh_token);
    const meRes = await authApi.getMe();
    set({ user: meRes.data, isAuthenticated: true });
  },

  register: async (email: string, password: string, displayName?: string) => {
    await authApi.register(email, password, displayName);
    // Auto-login after registration
    await get().login(email, password);
  },

  logout: async () => {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Ignore logout API errors
      }
    }
    await clearTokens();
    set({ user: null, isAuthenticated: false });
  },
}));
