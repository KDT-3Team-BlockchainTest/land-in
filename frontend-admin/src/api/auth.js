import { api } from './client';

export const authApi = {
  login: (email, password) => api.post('/admin/auth/login', { email, password }, { auth: false }),
  me: () => api.get('/admin/auth/me'),
};
