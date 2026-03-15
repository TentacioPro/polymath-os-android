import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';

const STORAGE_KEY = 'polymath_backend_url';

// Default: env var → platform-appropriate localhost
const ENV_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const DEFAULT_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8001'   // Android emulator → host machine
  : 'http://localhost:8001';  // iOS simulator

let _backendUrl: string | null = null;
let _client: AxiosInstance | null = null;
let _storage: any = null;
let _storageChecked = false;

/**
 * Lazily load and verify AsyncStorage.
 * Uses require() instead of top-level import to prevent the
 * LegacyAsyncStorageImpl from crashing Expo Go at module load time.
 * Returns the storage instance if available, null otherwise.
 */
async function getStorage(): Promise<any> {
  if (_storageChecked) return _storage;
  _storageChecked = true;

  try {
    // Dynamic require - avoids top-level import crash
    const mod = require('@react-native-async-storage/async-storage');
    const storage = mod.default || mod;

    // Verify the storage actually works with a safe read
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('AsyncStorage probe timed out'));
      }, 2000);

      storage
        .getItem('__probe__')
        .then(() => { clearTimeout(timeout); resolve(); })
        .catch((err: any) => { clearTimeout(timeout); reject(err); });
    });

    _storage = storage;
    return _storage;
  } catch (error: any) {
    console.warn('[API] AsyncStorage not available, using in-memory only:', error?.message || error);
    _storage = null;
    return null;
  }
}

/**
 * Safely read a value from AsyncStorage.
 * Returns null on any failure (module missing, native crash, etc.)
 */
async function safeStorageGet(key: string): Promise<string | null> {
  try {
    const storage = await getStorage();
    if (!storage) return null;
    return await storage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely write a value to AsyncStorage.
 * Silently fails if storage is unavailable.
 */
async function safeStorageSet(key: string, value: string): Promise<void> {
  try {
    const storage = await getStorage();
    if (storage) await storage.setItem(key, value);
  } catch {
    /* silent */
  }
}

/**
 * Safely remove a value from AsyncStorage.
 * Silently fails if storage is unavailable.
 */
async function safeStorageRemove(key: string): Promise<void> {
  try {
    const storage = await getStorage();
    if (storage) await storage.removeItem(key);
  } catch {
    /* silent */
  }
}

/**
 * Get the current backend URL. Resolves in this order:
 * 1. In-memory cached URL (fastest)
 * 2. AsyncStorage persisted URL (survives app restarts)
 * 3. EXPO_PUBLIC_BACKEND_URL env var
 * 4. Platform default (localhost)
 */
export async function getBackendUrl(): Promise<string> {
  if (_backendUrl) return _backendUrl;

  // Try to get from storage (safe - never throws)
  const stored = await safeStorageGet(STORAGE_KEY);
  if (stored) {
    _backendUrl = stored;
    return stored;
  }

  _backendUrl = ENV_URL || DEFAULT_URL;
  return _backendUrl;
}

/** Get backend URL synchronously (returns cached or env, never null) */
export function getBackendUrlSync(): string {
  return _backendUrl || ENV_URL || DEFAULT_URL;
}

/** Update the backend URL at runtime (persisted across app restarts) */
export async function setBackendUrl(url: string): Promise<void> {
  const cleaned = url.replace(/\/+$/, ''); // strip trailing slash
  _backendUrl = cleaned;
  _client = null; // reset cached client
  await safeStorageSet(STORAGE_KEY, cleaned);
}

/** Clear persisted URL (reverts to env var / default) */
export async function resetBackendUrl(): Promise<void> {
  _backendUrl = ENV_URL || DEFAULT_URL;
  _client = null;
  await safeStorageRemove(STORAGE_KEY);
}

/** Get a pre-configured axios instance pointing at the backend */
export function getApiClient(): AxiosInstance {
  if (_client) return _client;
  const url = getBackendUrlSync();
  _client = axios.create({
    baseURL: url,
    timeout: 15000,
  });
  return _client;
}

/**
 * Initialize the backend URL on app startup.
 * Call this once in _layout.tsx.
 */
export async function initBackendUrl(): Promise<string> {
  const url = await getBackendUrl();
  console.log('[API] Backend URL:', url);
  return url;
}
