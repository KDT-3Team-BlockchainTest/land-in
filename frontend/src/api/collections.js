import { api } from './client';

export const collectionsApi = {
  /** GET /api/collections?status=ongoing|completed|ended */
  list: (status) => api.get(`/collections${status && status !== 'all' ? `?status=${status}` : ''}`),
};
