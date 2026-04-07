import { api } from './client';

export const dashboardApi = {
  /** GET /api/dashboard/stats */
  stats: () => api.get('/dashboard/stats'),
};
