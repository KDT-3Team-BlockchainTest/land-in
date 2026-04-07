import { useCallback, useEffect, useState } from "react";
import { eventsApi } from "../api/events";
import { useAuth } from "../contexts/AuthContext";

export default function useJoinedEventIds() {
  const { user } = useAuth();
  const [joinedEventIds, setJoinedEventIds] = useState([]);

  useEffect(() => {
    if (!user) return;
    eventsApi.joinedIds()
      .then((ids) => setJoinedEventIds(ids ?? []))
      .catch(() => setJoinedEventIds([]));
  }, [user]);

  const joinEvent = useCallback(async (eventId) => {
    try {
      await eventsApi.join(eventId);
      setJoinedEventIds((prev) =>
        prev.includes(eventId) ? prev : [...prev, eventId]
      );
    } catch (err) {
      // ALREADY_JOINED은 무시
      if (err.status === 409) {
        setJoinedEventIds((prev) =>
          prev.includes(eventId) ? prev : [...prev, eventId]
        );
      } else {
        throw err;
      }
    }
  }, []);

  return { joinedEventIds, joinEvent };
}
