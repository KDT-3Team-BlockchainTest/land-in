import { api } from './client';

export const authApi = {
  signup: (body) => api.post('/auth/signup', body, { auth: false }),
  login: (body) => api.post('/auth/login', body, { auth: false }),
  oauthAuthorize: (provider, redirectUri, next = '/') => {
    const params = new URLSearchParams({ redirectUri, next });
    return api.get(`/auth/oauth/${provider}/authorize?${params.toString()}`, { auth: false });
  },
  me: () => api.get('/auth/me'),
  updateMe: (body) => api.patch('/auth/me', body),
};
