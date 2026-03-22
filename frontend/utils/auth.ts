/**
 * Secure Token Storage for Polymath OS Mobile
 *
 * Uses expo-secure-store for encrypted token persistence (Keychain on iOS,
 * encrypted SharedPreferences on Android). Never stores auth tokens in
 * AsyncStorage — that is NOT secure for sensitive credentials.
 */

import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'polymath-access-token';
const REFRESH_TOKEN_KEY = 'polymath-refresh-token';

// ─── Store / Retrieve / Clear ─────────────────────────────────────────────

export async function storeTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

/**
 * Check if any access token exists (does NOT verify validity).
 * Use for quick "should we try auto-login" check at startup.
 */
export async function hasStoredTokens(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}
