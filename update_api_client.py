with open('soul-app-web/src/api/client.ts', 'r') as f:
    content = f.read()

new_client = """const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  // Auto inject Token
  const token = localStorage.getItem('soul_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  // Handle 401 Unauthorized globally
  if (response.status === 401 || response.status === 403) {
    console.error('Unauthorized! Need to re-login.');
    localStorage.removeItem('soul_token');
    // window.location.href = '/login'; // Optional: Redirect in real app
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();

  if (result.code !== 0) {
    console.error(`API Error [${endpoint}]:`, result.message);
    throw new Error(result.message);
  }

  return result.data;
}

export const api = {
  get: <T>(endpoint: string) => apiClient<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) => apiClient<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: any) => apiClient<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => apiClient<T>(endpoint, { method: 'DELETE' }),
};
"""

with open('soul-app-web/src/api/client.ts', 'w') as f:
    f.write(new_client)
