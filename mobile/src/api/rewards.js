import { api } from './client';
export const rewardsApi = {
  list: ()   => api.get('/rewards'),
  use:  (id) => api.post(`/rewards/${id}/use`),
};
