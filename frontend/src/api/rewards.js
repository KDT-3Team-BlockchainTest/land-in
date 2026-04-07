import { api } from './client';

export const rewardsApi = {
  /** GET /api/rewards?status=available|used|expired */
  list: (status) => api.get(`/rewards${status ? `?status=${status}` : ''}`),

  /** POST /api/rewards/{id}/use */
  use: (rewardId) => api.post(`/rewards/${rewardId}/use`),
};
