import { LoginCredentials, AuthResponse } from '../utils/types';

const API_BASE_URL = 'http://10.140.60.46:5284/api';

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const requestBody = {
    username: credentials.username,
    password: credentials.password,
  };

  console.log('--- Login Request ---');
  console.log('URL:', `${API_BASE_URL}/auth/login`);
  console.log('Body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }

    console.log('--- API Response ---');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      const errorMsg = data?.message || 'Invalid Username or Password';
      console.log('Login failed with message:', errorMsg);
      throw new Error(errorMsg);
    }

    // Returning flattened API response directly as per types.ts
    return data;
  } catch (error: any) {
    console.log('--- Login Error ---');
    console.error(error);
    
    if (error.message.includes('fetch') || error.message.includes('Network')) {
      throw new Error('API Connection Failed');
    }
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  // In real app: call API to invalidate token if necessary
  await new Promise((res) => setTimeout(res, 200));
}
