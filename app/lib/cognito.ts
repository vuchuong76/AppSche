import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import { jwtDecode } from 'jwt-decode';
import { User, CognitoResponse } from '../types';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
});

const CLIENT_ID = process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID!;

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string): Promise<void> {
  const command = new SignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: 'email',
        Value: email,
      },
    ],
  });

  try {
    await cognitoClient.send(command);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign up');
  }
}

/**
 * Sign in a user
 */
export async function signIn(email: string, password: string): Promise<User> {
  const command = new InitiateAuthCommand({
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });

  try {
    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      throw new Error('Authentication failed');
    }

    const { IdToken, AccessToken, RefreshToken } = response.AuthenticationResult;

    if (!IdToken || !AccessToken || !RefreshToken) {
      throw new Error('Missing authentication tokens');
    }

    // Decode ID token to get user info
    const decoded: any = jwtDecode(IdToken);
    const userId = decoded.sub;

    const user: User = {
      email,
      userId,
      idToken: IdToken,
      accessToken: AccessToken,
      refreshToken: RefreshToken,
    };

    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('idToken', IdToken);
      localStorage.setItem('accessToken', AccessToken);
      localStorage.setItem('refreshToken', RefreshToken);
    }

    return user;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in');
  }
}

/**
 * Sign out current user
 */
export function signOut(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('idToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return null;
  }

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const idToken = localStorage.getItem('idToken');
  return !!idToken;
}

/**
 * Get user ID from token
 */
export function getUserIdFromToken(token: string): string {
  const decoded: any = jwtDecode(token);
  return decoded.sub;
}
