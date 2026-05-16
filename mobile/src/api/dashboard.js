import { api } from './client';
import { adaptDashboard } from './adapters';

export const dashboardApi = {
  stats: async () => {
    const data = await api.get('/dashboard/stats');
    return adaptDashboard(data || {});
  },
};
