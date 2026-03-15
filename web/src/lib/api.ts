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

function createApiClient(baseUrl: string) {
  const client = axios.create({ baseURL: `${baseUrl}/api` });

  return {
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
  };
}

export const api = createApiClient(BACKEND_URL);
