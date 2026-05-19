import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'land-in-admin-token';
const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');

export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const setToken = (v) => SecureStore.setItemAsync(TOKEN_KEY, v);
export const removeToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

const http = axios.create({ baseURL: BASE_URL });

http.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res.data?.data ?? res.data ?? null,
  (err) => {
    const message = err.response?.data?.message || err.message || '서버 오류';
    const error = new Error(message);
    error.status = err.response?.status;
    return Promise.reject(error);
  }
);

export const api = {
  get: (path) => http.get(path),
  post: (path, data) => http.post(path, data),
  put: (path, data) => http.put(path, data),
  patch: (path, data) => http.patch(path, data),
  delete: (path) => http.delete(path),
  postForm: (path, data) => http.post(path, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
