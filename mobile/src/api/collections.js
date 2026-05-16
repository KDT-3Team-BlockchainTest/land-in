import { api } from './client';
import { adaptCollection } from './adapters';

export const collectionsApi = {
  list: async (status) => {
    const data = await api.get(`/collections${status && status !== 'all' ? `?status=${status}` : ''}`);
    return (data || []).map(adaptCollection);
  },
};
