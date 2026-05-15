import { api } from './client';
export const eventsApi = {
  list:   ()        => api.get('/admin/events'),
  detail: (id)      => api.get(`/admin/events/${id}`),
  create: (body)    => api.post('/admin/events', body),
  update: (id, body)=> api.patch(`/admin/events/${id}`, body),
  remove: (id)      => api.delete(`/admin/events/${id}`),
};
