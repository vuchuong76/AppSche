export interface Schedule {
  userId: string;
  dateTime: string; // Format: YYYY-MM-DD#HH:mm
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: string; // work, family, learning, cook, exercise, rest
  color: string; // hex color
  createdAt: number; // timestamp
  updatedAt?: number;
  ttl?: number; // DynamoDB TTL (Unix timestamp in seconds, auto-generated)
}

export interface Task {
  userId: string;
  taskId: string; // UUID
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  category: string;
  deadline?: string; // YYYY-MM-DD
  createdAt: number;
  updatedAt?: number;
  ttl?: number; // DynamoDB TTL (Unix timestamp in seconds, auto-generated)
}

export interface User {
  email: string;
  userId: string;
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

export interface CognitoResponse {
  AuthenticationResult?: {
    IdToken: string;
    AccessToken: string;
    RefreshToken: string;
    ExpiresIn: number;
  };
}

export const CATEGORIES = [
  'work',
  'family',
  'learning',
  'cook',
  'exercise',
  'rest'
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  work: '#378ADD',
  family: '#D4537E',
  learning: '#534AB7',
  cook: '#BA7517',
  exercise: '#1D9E75',
  rest: '#888780'
};

export const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
