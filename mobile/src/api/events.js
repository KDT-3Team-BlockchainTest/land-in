import { api } from './client';
export const eventsApi = {
  list:      (status)  => api.get(`/events${status ? `?status=${status}` : ''}`),
  detail:    (id)      => api.get(`/events/${id}`),
  joinedIds: ()        => api.get('/events/joined'),
  join:      (id)      => api.post(`/events/${id}/join`),
};
