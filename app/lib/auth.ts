import { jwtDecode } from 'jwt-decode';

/**
 * Verify JWT token (basic decode check)
 */
export function verifyToken(token: string): boolean {
  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token is expired
    if (decoded.exp && decoded.exp < currentTime) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Extract userId from JWT token
 */
export function getUserIdFromToken(token: string): string | null {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.sub || null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is authenticated (client-side)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const idToken = localStorage.getItem('idToken');
  if (!idToken) {
    return false;
  }

  return verifyToken(idToken);
}

/**
 * Get authorization header with Bearer token
 */
export function getAuthHeader(): { Authorization: string } | {} {
  if (typeof window === 'undefined') {
    return {};
  }

  const idToken = localStorage.getItem('idToken');
  if (!idToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${idToken}`,
  };
}

/**
 * Get ID token from localStorage
 */
export function getIdToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('idToken');
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('accessToken');
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('refreshToken');
}
