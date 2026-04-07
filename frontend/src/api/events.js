import { api } from './client';

export const eventsApi = {
  /** GET /api/events?status=active|featured|upcoming|ended */
  list: (status) => api.get(`/events${status ? `?status=${status}` : ''}`),

  /** GET /api/events/{id} — 로그인 시 스텝 상태 포함 */
  detail: (eventId) => api.get(`/events/${eventId}`),

  /** GET /api/events/joined */
  joinedIds: () => api.get('/events/joined'),

  /** POST /api/events/{id}/join */
  join: (eventId) => api.post(`/events/${eventId}/join`),
};
