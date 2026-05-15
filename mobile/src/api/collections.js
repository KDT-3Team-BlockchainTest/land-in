import { api } from './client';
export const collectionsApi = {
  list: (status) => api.get(`/collections${status && status !== 'all' ? `?status=${status}` : ''}`),
};
