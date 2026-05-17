import axios from 'axios';
import { getToken } from '../auth/storage';

const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');

const http = axios.create({ baseURL: BASE_URL, timeout: 10000 });

http.interceptors.request.use(async (config) => {
  config.headers['Bypass-Tunnel-Reminder'] = '1';

  if (config.auth !== false) {
    // SecureStore가 무한 대기하지 않도록 3초 타임아웃
    const token = await Promise.race([
      getToken(),
      new Promise((resolve) => setTimeout(() => resolve(null), 3000)),
    ]);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res.data?.data ?? null,
  (err) => {
    const message = err.response?.data?.message || err.message || '서버 오류가 발생했습니다.';
    const status = err.response?.status;
    const error = new Error(message);
    error.status = status;
    return Promise.reject(error);
  }
);

export const api = {
  get: (path, config) => http.get(path, config),
  post: (path, data, config) => http.post(path, data, config),
  patch: (path, data, config) => http.patch(path, data, config),
  delete: (path, config) => http.delete(path, config),
};
