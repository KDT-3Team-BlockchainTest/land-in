import { api } from './client';
export const authApi = { login: (body) => api.post('/auth/login', body, { auth: false }) };
