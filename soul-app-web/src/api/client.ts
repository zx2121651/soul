import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

interface PendingRequest {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: PendingRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 白名单路径
const whitelist = ['/auth/login', '/auth/register', '/auth/send-code', '/auth/refresh'];

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

  // 这里的 result.code !== 0 是业务错误，通常不触发 401 刷新逻辑
  // 除非后端在业务 code 里也定义了 token 过期
  if (result.code !== 0) {
    console.error(`API Error [${response.config.url}]:`, result.message);
    throw new Error(result.message);
  }

  return response;
}, async (error) => {
  const originalRequest = error.config;

  if (error.response && error.response.status === 401 && !originalRequest._retry) {
    // 如果是白名单接口（如登录），不触发自动刷新，直接报错
    const isWhitelisted = whitelist.some(path => originalRequest.url?.includes(path));
    if (isWhitelisted) {
      return Promise.reject(error);
    }

    // 已经在刷新中，将请求挂起
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // 发起静默刷新调用，使用 axios 原生实例避免进入拦截器死循环
      const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });

      // 检查业务 code
      if (response.data.code !== 0) {
        throw new Error(response.data.message || 'Refresh token failed');
      }

      const { accessToken } = response.data.data;

      useAuthStore.getState().setToken(accessToken);

      // 更新当前请求头并重试
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      processQueue(null, accessToken);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  // 处理其他 401/403 情况（如 refresh 接口本身返回 401，或者 refresh 之后依然 401）
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    console.error('Unauthorized! Need to re-login.');
    processQueue(error, null);
    useAuthStore.getState().logout();
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
  } else if (error.code === 'ECONNABORTED') {
    console.error(`API Error: Request timeout`);
    return Promise.reject(new Error('网络请求超时，请稍后重试'));
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
