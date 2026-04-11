import { api } from './client';

export const nftsApi = {
  /** GET /api/nfts?eventId=xxx */
  list: (eventId) => api.get(`/nfts${eventId ? `?eventId=${eventId}` : ''}`),
  /** GET /api/nfts/:nftId */
  getById: (nftId) => api.get(`/nfts/${nftId}`),
};
