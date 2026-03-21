import axios from 'axios';
import type {
  Activity,
  Journal,
  Connection,
  Stats,
  AgentMemory,
  Persona,
  LearningLog,
  AgentStats,
  AISuggestion,
} from './types';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

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

export interface UrlMetadata {
  url: string;
  domain: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
}

function createApiClient(baseUrl: string) {
  const client = axios.create({ baseURL: `${baseUrl}/api` });

  // Attach access token to every request if available
  client.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('polymath-access-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // Auto-refresh on 401
  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;
      if (
        error.response?.status === 401 &&
        !original._retry &&
        typeof window !== 'undefined'
      ) {
        original._retry = true;
        const refreshToken = localStorage.getItem('polymath-refresh-token');
        if (refreshToken) {
          try {
            const res = await axios.post<TokenPair>(`${baseUrl}/api/auth/refresh`, {
              refresh_token: refreshToken,
            });
            localStorage.setItem('polymath-access-token', res.data.access_token);
            localStorage.setItem('polymath-refresh-token', res.data.refresh_token);
            original.headers.Authorization = `Bearer ${res.data.access_token}`;
            return client(original);
          } catch {
            // Refresh failed — clear tokens
            localStorage.removeItem('polymath-access-token');
            localStorage.removeItem('polymath-refresh-token');
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return {
    // Auth
    login: (email: string, password: string) =>
      client.post<TokenPair>('/auth/login', { email, password }),
    register: (email: string, password: string, display_name?: string) =>
      client.post<AuthUser>('/auth/register', { email, password, display_name }),
    refreshToken: (refresh_token: string) =>
      client.post<TokenPair>('/auth/refresh', { refresh_token }),
    logout: (refresh_token: string) =>
      client.post('/auth/logout', { refresh_token }),
    getMe: () => client.get<AuthUser>('/auth/me'),
    // Activities
    getActivities: (limit = 100) =>
      client.get<Activity[]>('/activities', { params: { limit } }),
    createActivity: (data: { title: string; url?: string; notes?: string }) =>
      client.post<Activity>('/activities/manual', data),
    uploadActivities: (formData: FormData) =>
      client.post('/activities/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    deleteActivity: (id: string) => client.delete(`/activities/${id}`),

    // Journals
    getJournals: (limit = 100) =>
      client.get<Journal[]>('/journals', { params: { limit } }),
    createJournal: (data: { title: string; content: string; tags?: string[] }) =>
      client.post<Journal>('/journals', data),
    updateJournal: (id: string, data: Partial<Journal>) =>
      client.put(`/journals/${id}`, data),
    deleteJournal: (id: string) => client.delete(`/journals/${id}`),

    // Connections
    getConnections: () => client.get<Connection[]>('/connections'),
    generateConnections: (activityId: string) =>
      client.post(`/ai/generate-connections/${activityId}`),

    // AI
    getSuggestions: () => client.get<AISuggestion[]>('/ai/suggestions'),

    // Stats
    getStats: () => client.get<Stats>('/stats'),

    // Agent
    getMemories: (limit = 100) =>
      client.get<AgentMemory[]>('/agent/memory', { params: { limit } }),
    deleteMemory: (id: string) => client.delete(`/agent/memory/${id}`),
    learnFromData: () => client.post('/agent/learn'),
    consolidateMemories: () => client.post('/agent/consolidate'),
    getPersona: () => client.get<Persona>('/agent/persona'),
    updatePersona: (data: Partial<Persona>) =>
      client.put('/agent/persona', data),
    getLearningLogs: (limit = 50) =>
      client.get<LearningLog[]>('/agent/learning-logs', { params: { limit } }),
    chatWithAgent: (message: string) =>
      client.get('/agent/chat', { params: { message } }),
    getAgentStats: () => client.get<AgentStats>('/agent/stats'),

    // Export/Import
    exportJson: () => client.post('/export/json'),
    exportMarkdown: () => client.post('/export/markdown'),
    exportCsv: () => client.post('/export/csv'),
    importRestore: (formData: FormData) =>
      client.post('/import/restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),

    // Search
    search: (q: string, limit = 30) =>
      client.get('/search', { params: { q, limit } }),

    // Notifications
    getNotifications: (limit = 20) =>
      client.get('/notifications', { params: { limit } }),

    // Health
    getHealth: () => client.get('/health'),

    // Single Activity
    getActivity: (id: string) => client.get<Activity>(`/activities/${id}`),

    // AI Config
    getAiConfig: () => client.get('/ai-config'),
    setAiConfig: (data: { provider: string; model: string; api_key: string }) =>
      client.post('/ai-config', data),

    // URL Metadata
    extractMetadata: (url: string) =>
      client.post<UrlMetadata>('/metadata/extract', { url }),
  };
}

export const api = createApiClient(BACKEND_URL);
