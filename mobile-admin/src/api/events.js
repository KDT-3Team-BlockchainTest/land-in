import { api } from './client';

export const eventsApi = {
  list: () => api.get('/admin/events'),
  get: (id) => api.get(`/admin/events/${id}`),
  create: (payload) => api.post('/admin/events', payload),
  update: (id, payload) => api.put(`/admin/events/${id}`, payload),
  remove: (id) => api.delete(`/admin/events/${id}`),
  uploadImage: (formData) => api.postForm('/admin/images/upload', formData),
};
