import { api } from './client';
export const nftsApi = {
  list:    (eventId) => api.get(`/nfts${eventId ? `?eventId=${eventId}` : ''}`),
  getById: (id)      => api.get(`/nfts/${id}`),
};
