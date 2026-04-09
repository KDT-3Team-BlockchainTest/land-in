import { api } from './client';

export const authApi = {
  signup: (body) => api.post('/auth/signup', body),
  login: (body) => api.post('/auth/login', body),
  me: () => api.get('/auth/me'),
};
