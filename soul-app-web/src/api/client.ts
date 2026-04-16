import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 白名单路径
const whitelist = ['/auth/login', '/auth/register', '/auth/send-code'];

apiClient.interceptors.request.use((config) => {
  const isWhitelisted = whitelist.some(path => config.url?.includes(path));

  if (!isWhitelisted) {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => {
  const result: ApiResponse = response.data;

  if (result.code !== 0) {
    console.error(`API Error [${response.config.url}]:`, result.message);
    throw new Error(result.message);
  }

  return response;
}, (error) => {
  if (error.response) {
    if (error.response.status === 401 || error.response.status === 403) {
      console.error('Unauthorized! Need to re-login.');
      useAuthStore.getState().clearToken();
      window.location.href = '/login';
    }
  } else if (error.code === 'ECONNABORTED') {
    console.error(`API Error: Request timeout`);
    throw new Error('网络请求超时，请稍后重试');
  }

  return Promise.reject(error);
});

export { apiClient };

export const api = {
  get: <T>(url: string, config = {}) => apiClient.get<ApiResponse<T>>(url, config).then(res => res.data.data),
  post: <T>(url: string, data?: unknown, config = {}) => apiClient.post<ApiResponse<T>>(url, data, config).then(res => res.data.data),
  put: <T>(url: string, data?: unknown, config = {}) => apiClient.put<ApiResponse<T>>(url, data, config).then(res => res.data.data),
  delete: <T>(url: string, config = {}) => apiClient.delete<ApiResponse<T>>(url, config).then(res => res.data.data),
};
