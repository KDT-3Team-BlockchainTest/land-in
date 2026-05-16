import { api } from './client';

export const authApi = {
  signup: (body) => api.post('/auth/signup', body, { auth: false }),
  login: (body) => api.post('/auth/login', body, { auth: false }),
  me: () => api.get('/auth/me'),
};
