import { api } from './client';
import { adaptEventDetail, adaptEventSummary } from './adapters';

export const eventsApi = {
  list: async (status) => {
    const data = await api.get(`/events${status ? `?status=${status}` : ''}`);
    return (data || []).map((ev) => adaptEventSummary(ev));
  },
  detail: async (eventId) => {
    const data = await api.get(`/events/${eventId}`);
    return adaptEventDetail(data);
  },
  joinedIds: () => api.get('/events/joined'),
  join: (eventId) => api.post(`/events/${eventId}/join`),
};
