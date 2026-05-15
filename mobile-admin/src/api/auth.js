import { api } from './client';

export const authApi = {
  login: (body) => api.post('/admin/auth/login', body),
  me: () => api.get('/admin/auth/me'),
};
