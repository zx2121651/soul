const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const token = localStorage.getItem('soul_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add AbortController for timeout (default 10s)
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(id);

    if (response.status === 401 || response.status === 403) {
      console.error('Unauthorized! Need to re-login.');
      localStorage.removeItem('soul_token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
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
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      console.error(`API Error [${endpoint}]: Request timeout`);
      throw new Error('网络请求超时，请稍后重试');
    }
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string) => apiClient<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) => apiClient<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: any) => apiClient<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => apiClient<T>(endpoint, { method: 'DELETE' }),
};
