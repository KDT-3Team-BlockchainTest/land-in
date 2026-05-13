import { api } from './client';

export const eventsApi = {
  list: () => api.get('/admin/events'),
  get: (eventId) => api.get(`/admin/events/${eventId}`),
  create: (payload) => api.post('/admin/events', payload),
  update: (eventId, payload) => api.put(`/admin/events/${eventId}`, payload),
  remove: (eventId) => api.delete(`/admin/events/${eventId}`),
};
