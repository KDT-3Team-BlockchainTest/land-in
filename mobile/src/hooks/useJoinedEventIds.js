import { useCallback, useEffect, useState } from 'react';
import { eventsApi } from '../api/events';
import { useAuth } from '../contexts/useAuth';

export default function useJoinedEventIds() {
  const { user } = useAuth();
  const [joinedEventIds, setJoinedEventIds] = useState([]);

  useEffect(() => {
    if (!user) { setJoinedEventIds([]); return; }
    eventsApi.joinedIds().then((ids) => setJoinedEventIds(ids ?? [])).catch(() => {});
  }, [user]);

  const joinEvent = useCallback(async (eventId) => {
    await eventsApi.join(eventId);
    setJoinedEventIds((prev) => prev.includes(eventId) ? prev : [...prev, eventId]);
  }, []);

  return { joinedEventIds, joinEvent };
}
