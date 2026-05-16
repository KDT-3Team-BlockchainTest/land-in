import { api } from './client';
import { adaptNft } from './adapters';

export const nftsApi = {
  list: async (eventId) => {
    const data = await api.get(`/nfts${eventId ? `?eventId=${eventId}` : ''}`);
    return (data || []).map(adaptNft);
  },
  getById: async (nftId) => {
    const data = await api.get(`/nfts/${nftId}`);
    return adaptNft(data);
  },
};
