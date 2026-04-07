import { api } from './client';

export const nftsApi = {
  /** GET /api/nfts?eventId=xxx */
  list: (eventId) => api.get(`/nfts${eventId ? `?eventId=${eventId}` : ''}`),
};
