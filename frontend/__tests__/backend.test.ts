/**
 * Mobile App Smoke Tests
 * 
 * Tests core functionality of the Polymath OS mobile app.
 * Run with: bun run test
 */

import { getBackendUrlSync, getApiClient } from '../utils/backend';

// Mock AsyncStorage via dynamic require (matches lazy-load pattern in backend.ts)
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

describe('Backend Utility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBackendUrlSync', () => {
    it('should return default URL when no URL is cached', () => {
      const url = getBackendUrlSync();
      expect(url).toBeTruthy();
      expect(typeof url).toBe('string');
    });

    it('should return URL containing http protocol', () => {
      const url = getBackendUrlSync();
      expect(url).toMatch(/^https?:\/\//);
    });

    it('should return URL with port number', () => {
      const url = getBackendUrlSync();
      expect(url).toMatch(/:\d+$/);
    });
  });

  describe('getApiClient', () => {
    it('should return an axios instance', () => {
      const client = getApiClient();
      expect(client).toBeDefined();
      expect(typeof client.get).toBe('function');
      expect(typeof client.post).toBe('function');
    });

    it('should have baseURL configured', () => {
      const client = getApiClient();
      expect(client.defaults.baseURL).toBeTruthy();
    });

    it('should have timeout configured', () => {
      const client = getApiClient();
      expect(client.defaults.timeout).toBeGreaterThan(0);
    });

    it('should return same instance on multiple calls', () => {
      const client1 = getApiClient();
      const client2 = getApiClient();
      expect(client1).toBe(client2);
    });
  });
});
