/**
 * Polymath OS Mobile API Client
 *
 * Authenticated HTTP client with:
 * - Automatic Bearer token injection from SecureStore
 * - 401 auto-refresh with token rotation
 * - Mirrors web/src/lib/api.ts for API parity
 */

import axios, { AxiosInstance } from 'axios';
import { getBackendUrlSync } from './backend';
import {
  getAccessToken,
  getRefreshToken,
  storeTokens,
  clearTokens,
} from './auth';

// ─── Types (shared with web) ──────────────────────────────────────────────

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthUser {
  id: string;
  email: string;
  display_name?: string;
  role?: string;
  is_active?: boolean;
  created_at?: string;
  last_login?: string;
}

// ─── Client Factory ───────────────────────────────────────────────────────

let _authClient: AxiosInstance | null = null;

export function getAuthApiClient(): AxiosInstance {
  if (_authClient) return _authClient;

  const backendUrl = getBackendUrlSync();
  const baseURL = `${backendUrl}/api`;
  
  // Debug logging
  console.log('[API] Creating auth API client with backend URL:', backendUrl);
  console.log('[API] Full base URL:', baseURL);
  console.log('[API] EXPO_PUBLIC_BACKEND_URL from env:', process.env.EXPO_PUBLIC_BACKEND_URL);
  
  const client = axios.create({ baseURL, timeout: 15000 });

  // ── Request interceptor: attach access token ──
  client.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ── Response interceptor: auto-refresh on 401 ──
  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;
      if (
        error.response?.status === 401 &&
        !original._retry
      ) {
        original._retry = true;
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          try {
            const res = await axios.post<TokenPair>(
              `${baseURL}/auth/refresh`,
              { refresh_token: refreshToken },
            );
            await storeTokens(
              res.data.access_token,
              res.data.refresh_token,
            );
            original.headers.Authorization = `Bearer ${res.data.access_token}`;
            return client(original);
          } catch {
            // Refresh failed — clear tokens
            await clearTokens();
          }
        }
      }
      return Promise.reject(error);
    },
  );

  _authClient = client;
  return client;
}

/** Reset the cached client (call when backend URL changes) */
export function resetAuthApiClient(): void {
  _authClient = null;
}

// ─── API Methods ──────────────────────────────────────────────────────────

export const authApi = {
  // Auth
  login: (email: string, password: string) =>
    getAuthApiClient().post<TokenPair>('/auth/login', { email, password }),
  register: (email: string, password: string, display_name?: string) =>
    getAuthApiClient().post<AuthUser>('/auth/register', { email, password, display_name }),
  refreshToken: (refresh_token: string) =>
    getAuthApiClient().post<TokenPair>('/auth/refresh', { refresh_token }),
  logout: (refresh_token: string) =>
    getAuthApiClient().post('/auth/logout', { refresh_token }),
  getMe: () =>
    getAuthApiClient().get<AuthUser>('/auth/me'),

  // Activities
  getActivities: (limit = 100) =>
    getAuthApiClient().get('/activities', { params: { limit } }),
  createActivity: (data: { title: string; url?: string; notes?: string }) =>
    getAuthApiClient().post('/activities/manual', data),
  uploadActivities: (formData: FormData) =>
    getAuthApiClient().post('/activities/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteActivity: (id: string) =>
    getAuthApiClient().delete(`/activities/${id}`),
  updateActivity: (id: string, data: { title?: string; notes?: string }) =>
    getAuthApiClient().patch(`/activities/${id}`, data),
  getActivity: (id: string) =>
    getAuthApiClient().get(`/activities/${id}`),

  // Journals
  getJournals: (limit = 100) =>
    getAuthApiClient().get('/journals', { params: { limit } }),
  createJournal: (data: { title: string; content: string; tags?: string[] }) =>
    getAuthApiClient().post('/journals', data),
  updateJournal: (id: string, data: any) =>
    getAuthApiClient().put(`/journals/${id}`, data),
  deleteJournal: (id: string) =>
    getAuthApiClient().delete(`/journals/${id}`),

  // Connections
  getConnections: () =>
    getAuthApiClient().get('/connections'),
  generateConnections: (activityId: string) =>
    getAuthApiClient().post(`/ai/generate-connections/${activityId}`),

  // AI
  getSuggestions: () =>
    getAuthApiClient().get('/ai/suggestions'),

  // Stats
  getStats: () =>
    getAuthApiClient().get('/stats'),

  // Agent
  getMemories: (limit = 100) =>
    getAuthApiClient().get('/agent/memory', { params: { limit } }),
  deleteMemory: (id: string) =>
    getAuthApiClient().delete(`/agent/memory/${id}`),
  learnFromData: () =>
    getAuthApiClient().post('/agent/learn'),
  consolidateMemories: () =>
    getAuthApiClient().post('/agent/consolidate'),
  getPersona: () =>
    getAuthApiClient().get('/agent/persona'),
  updatePersona: (data: any) =>
    getAuthApiClient().put('/agent/persona', data),
  getLearningLogs: (limit = 50) =>
    getAuthApiClient().get('/agent/learning-logs', { params: { limit } }),
  chatWithAgent: (message: string) =>
    getAuthApiClient().get('/agent/chat', { params: { message } }),
  getAgentStats: () =>
    getAuthApiClient().get('/agent/stats'),

  // Export/Import
  exportJson: () =>
    getAuthApiClient().post('/export/json'),
  exportMarkdown: () =>
    getAuthApiClient().post('/export/markdown'),
  exportCsv: () =>
    getAuthApiClient().post('/export/csv'),
  importRestore: (formData: FormData) =>
    getAuthApiClient().post('/import/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Search
  search: (q: string, limit = 30) =>
    getAuthApiClient().get('/search', { params: { q, limit } }),

  // Notifications
  getNotifications: (limit = 20) =>
    getAuthApiClient().get('/notifications', { params: { limit } }),

  // Health
  getHealth: () =>
    getAuthApiClient().get('/health'),

  // AI Config
  getAiConfig: () =>
    getAuthApiClient().get('/ai-config'),
  setAiConfig: (data: { provider: string; model: string; api_key: string }) =>
    getAuthApiClient().post('/ai-config', data),

  // URL Metadata
  extractMetadata: (url: string) =>
    getAuthApiClient().post('/metadata/extract', { url }),
};
