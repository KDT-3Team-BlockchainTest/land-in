import { useEffect, useState } from "react";
import {
  addJoinedEventId,
  readJoinedEventIds,
  writeJoinedEventIds,
} from "../data/eventParticipation";

export default function useJoinedEventIds() {
  const [joinedEventIds, setJoinedEventIds] = useState(() => readJoinedEventIds());

  useEffect(() => {
    writeJoinedEventIds(joinedEventIds);
  }, [joinedEventIds]);

  const joinEvent = (eventId) => {
    setJoinedEventIds((currentIds) => addJoinedEventId(eventId, currentIds));
  };

  return {
    joinedEventIds,
    joinEvent,
  };
}
