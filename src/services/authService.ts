import { LoginCredentials, AuthResponse } from '../utils/types';
import { authenticateUser } from './mockDatabase';

// Simulates network delay
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  await delay(800); // Simulate API call

  const result = authenticateUser(credentials.username, credentials.password);

  if (!result) {
    throw new Error('Invalid username or password. Please try again.');
  }

  return {
    user: result.user,
    token: result.token,
    role: result.role,
  };
}

export async function logoutUser(): Promise<void> {
  await delay(200);
  // In real app: call API to invalidate token
}
