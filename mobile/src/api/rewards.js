import { api } from './client';
import { adaptReward } from './adapters';

export const rewardsApi = {
  list: async (status) => {
    const data = await api.get(`/rewards${status ? `?status=${status}` : ''}`);
    return (data || []).map(adaptReward);
  },
  use: (rewardId) => api.post(`/rewards/${rewardId}/use`),
};
