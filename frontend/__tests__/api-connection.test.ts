/**
 * Backend API Connection Tests
 *
 * Tests the API client factory, endpoint methods, and backend URL management.
 * Run with: bun run test __tests__/api-connection.test.ts
 */

import axios from 'axios';
import { createApiClient } from '../../shared/api';

// ─── Mock axios ──────────────────────────────────────────────────────────────

jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    defaults: { baseURL: '', timeout: 0 },
  };
  return {
    create: jest.fn(() => mockAxiosInstance),
    __mockInstance: mockAxiosInstance,
  };
});

// Mock AsyncStorage for backend.ts
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: jest.fn((obj: any) => obj.android || obj.default),
  },
}));

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockInstance = (axios as any).__mockInstance;

// ─── createApiClient factory ─────────────────────────────────────────────────

describe('createApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an axios instance with /api base path', () => {
    createApiClient('http://localhost:8001');
    expect(mockAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:8001/api',
    });
  });

  it('returns an object with all API methods', () => {
    const client = createApiClient('http://localhost:8001');
    const expectedMethods = [
      'getActivities', 'createActivity', 'uploadActivities', 'deleteActivity',
      'getJournals', 'createJournal', 'updateJournal', 'deleteJournal',
      'getConnections', 'generateConnections',
      'getSuggestions',
      'getStats',
      'getMemories', 'deleteMemory', 'learnFromData', 'consolidateMemories',
      'getPersona', 'updatePersona', 'getLearningLogs',
      'chatWithAgent', 'getAgentStats',
      'exportJson', 'exportMarkdown', 'exportCsv', 'importRestore',
    ];

    expectedMethods.forEach((method) => {
      expect(typeof (client as any)[method]).toBe('function');
    });
  });
});

// ─── Activities endpoints ────────────────────────────────────────────────────

describe('Activities API', () => {
  let client: ReturnType<typeof createApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    client = createApiClient('http://localhost:8001');
  });

  it('getActivities calls GET /activities with default limit', async () => {
    await client.getActivities();
    expect(mockInstance.get).toHaveBeenCalledWith('/activities', { params: { limit: 100 } });
  });

  it('getActivities accepts custom limit', async () => {
    await client.getActivities(50);
    expect(mockInstance.get).toHaveBeenCalledWith('/activities', { params: { limit: 50 } });
  });

  it('createActivity calls POST /activities/manual', async () => {
    const data = { title: 'Test', url: 'https://example.com' };
    await client.createActivity(data);
    expect(mockInstance.post).toHaveBeenCalledWith('/activities/manual', data);
  });

  it('uploadActivities calls POST /activities/upload with FormData', async () => {
    const formData = new FormData();
    await client.uploadActivities(formData);
    expect(mockInstance.post).toHaveBeenCalledWith('/activities/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });

  it('deleteActivity calls DELETE /activities/:id', async () => {
    await client.deleteActivity('abc123');
    expect(mockInstance.delete).toHaveBeenCalledWith('/activities/abc123');
  });
});

// ─── Journals endpoints ──────────────────────────────────────────────────────

describe('Journals API', () => {
  let client: ReturnType<typeof createApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    client = createApiClient('http://localhost:8001');
  });

  it('getJournals calls GET /journals with default limit', async () => {
    await client.getJournals();
    expect(mockInstance.get).toHaveBeenCalledWith('/journals', { params: { limit: 100 } });
  });

  it('getJournals accepts custom limit', async () => {
    await client.getJournals(25);
    expect(mockInstance.get).toHaveBeenCalledWith('/journals', { params: { limit: 25 } });
  });

  it('createJournal calls POST /journals', async () => {
    const data = { title: 'Entry', content: 'Today I learned...', tags: ['learning'] };
    await client.createJournal(data);
    expect(mockInstance.post).toHaveBeenCalledWith('/journals', data);
  });

  it('updateJournal calls PUT /journals/:id', async () => {
    const data = { title: 'Updated Entry' };
    await client.updateJournal('j1', data);
    expect(mockInstance.put).toHaveBeenCalledWith('/journals/j1', data);
  });

  it('deleteJournal calls DELETE /journals/:id', async () => {
    await client.deleteJournal('j1');
    expect(mockInstance.delete).toHaveBeenCalledWith('/journals/j1');
  });
});

// ─── Connections endpoints ───────────────────────────────────────────────────

describe('Connections API', () => {
  let client: ReturnType<typeof createApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    client = createApiClient('http://localhost:8001');
  });

  it('getConnections calls GET /connections', async () => {
    await client.getConnections();
    expect(mockInstance.get).toHaveBeenCalledWith('/connections');
  });

  it('generateConnections calls POST /ai/generate-connections/:id', async () => {
    await client.generateConnections('act1');
    expect(mockInstance.post).toHaveBeenCalledWith('/ai/generate-connections/act1');
  });
});

// ─── AI endpoints ────────────────────────────────────────────────────────────

describe('AI API', () => {
  let client: ReturnType<typeof createApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    client = createApiClient('http://localhost:8001');
  });

  it('getSuggestions calls GET /ai/suggestions', async () => {
    await client.getSuggestions();
    expect(mockInstance.get).toHaveBeenCalledWith('/ai/suggestions');
  });

  it('chatWithAgent calls GET /agent/chat with message param', async () => {
    await client.chatWithAgent('What did I learn today?');
    expect(mockInstance.get).toHaveBeenCalledWith('/agent/chat', {
      params: { message: 'What did I learn today?' },
    });
  });
});

// ─── Stats endpoints ─────────────────────────────────────────────────────────

describe('Stats API', () => {
  let client: ReturnType<typeof createApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    client = createApiClient('http://localhost:8001');
  });

  it('getStats calls GET /stats', async () => {
    await client.getStats();
    expect(mockInstance.get).toHaveBeenCalledWith('/stats');
  });
});

// ─── Agent endpoints ─────────────────────────────────────────────────────────

describe('Agent API', () => {
  let client: ReturnType<typeof createApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    client = createApiClient('http://localhost:8001');
  });

  it('getMemories calls GET /agent/memory with default limit', async () => {
    await client.getMemories();
    expect(mockInstance.get).toHaveBeenCalledWith('/agent/memory', { params: { limit: 100 } });
  });

  it('getMemories accepts custom limit', async () => {
    await client.getMemories(10);
    expect(mockInstance.get).toHaveBeenCalledWith('/agent/memory', { params: { limit: 10 } });
  });

  it('deleteMemory calls DELETE /agent/memory/:id', async () => {
    await client.deleteMemory('mem1');
    expect(mockInstance.delete).toHaveBeenCalledWith('/agent/memory/mem1');
  });

  it('learnFromData calls POST /agent/learn', async () => {
    await client.learnFromData();
    expect(mockInstance.post).toHaveBeenCalledWith('/agent/learn');
  });

  it('consolidateMemories calls POST /agent/consolidate', async () => {
    await client.consolidateMemories();
    expect(mockInstance.post).toHaveBeenCalledWith('/agent/consolidate');
  });

  it('getPersona calls GET /agent/persona', async () => {
    await client.getPersona();
    expect(mockInstance.get).toHaveBeenCalledWith('/agent/persona');
  });

  it('updatePersona calls PUT /agent/persona', async () => {
    const data = { name: 'Scholar', role: 'Research Assistant' };
    await client.updatePersona(data);
    expect(mockInstance.put).toHaveBeenCalledWith('/agent/persona', data);
  });

  it('getLearningLogs calls GET /agent/learning-logs', async () => {
    await client.getLearningLogs();
    expect(mockInstance.get).toHaveBeenCalledWith('/agent/learning-logs', { params: { limit: 50 } });
  });

  it('getAgentStats calls GET /agent/stats', async () => {
    await client.getAgentStats();
    expect(mockInstance.get).toHaveBeenCalledWith('/agent/stats');
  });
});

// ─── Export/Import endpoints ─────────────────────────────────────────────────

describe('Export/Import API', () => {
  let client: ReturnType<typeof createApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    client = createApiClient('http://localhost:8001');
  });

  it('exportJson calls POST /export/json', async () => {
    await client.exportJson();
    expect(mockInstance.post).toHaveBeenCalledWith('/export/json');
  });

  it('exportMarkdown calls POST /export/markdown', async () => {
    await client.exportMarkdown();
    expect(mockInstance.post).toHaveBeenCalledWith('/export/markdown');
  });

  it('exportCsv calls POST /export/csv', async () => {
    await client.exportCsv();
    expect(mockInstance.post).toHaveBeenCalledWith('/export/csv');
  });

  it('importRestore calls POST /import/restore with FormData', async () => {
    const formData = new FormData();
    await client.importRestore(formData);
    expect(mockInstance.post).toHaveBeenCalledWith('/import/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });
});

// ─── Backend URL management ──────────────────────────────────────────────────

import {
  getBackendUrlSync,
  getBackendUrl,
  setBackendUrl,
  resetBackendUrl,
  getApiClient,
  initBackendUrl,
} from '../utils/backend';

describe('Backend URL Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBackendUrlSync', () => {
    it('returns a string URL', () => {
      const url = getBackendUrlSync();
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });

    it('returns URL with http(s) protocol', () => {
      const url = getBackendUrlSync();
      expect(url).toMatch(/^https?:\/\//);
    });

    it('returns URL with port number', () => {
      const url = getBackendUrlSync();
      expect(url).toMatch(/:\d+$/);
    });
  });

  describe('getBackendUrl (async)', () => {
    it('resolves to a valid URL', async () => {
      const url = await getBackendUrl();
      expect(url).toMatch(/^https?:\/\//);
    });
  });

  describe('setBackendUrl', () => {
    it('updates the cached URL', async () => {
      await setBackendUrl('http://192.168.1.100:8001');
      expect(getBackendUrlSync()).toBe('http://192.168.1.100:8001');
    });

    it('strips trailing slashes', async () => {
      await setBackendUrl('http://localhost:8001///');
      expect(getBackendUrlSync()).toBe('http://localhost:8001');
    });
  });

  describe('resetBackendUrl', () => {
    it('reverts to default URL after reset', async () => {
      await setBackendUrl('http://custom:9999');
      await resetBackendUrl();
      const url = getBackendUrlSync();
      // Should be back to env var or platform default
      expect(url).toMatch(/^https?:\/\//);
      expect(url).not.toBe('http://custom:9999');
    });
  });

  describe('getApiClient', () => {
    it('returns an axios instance with get/post methods', () => {
      const client = getApiClient();
      expect(client).toBeDefined();
      expect(typeof client.get).toBe('function');
      expect(typeof client.post).toBe('function');
      expect(typeof client.put).toBe('function');
      expect(typeof client.delete).toBe('function');
    });

    it('returns cached instance on repeated calls', () => {
      const a = getApiClient();
      const b = getApiClient();
      expect(a).toBe(b);
    });
  });

  describe('initBackendUrl', () => {
    it('returns a URL string', async () => {
      const url = await initBackendUrl();
      expect(typeof url).toBe('string');
      expect(url).toMatch(/^https?:\/\//);
    });
  });
});
