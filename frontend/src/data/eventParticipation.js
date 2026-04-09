const JOINED_EVENT_IDS_KEY = "land-in-joined-event-ids";
const DEFAULT_JOINED_EVENT_IDS = [
  "paris-spring-2026",
  "seoul-palace-2026",
  "jeju-coast-2025",
];

function sanitizeJoinedEventIds(value) {
  if (!Array.isArray(value)) {
    return [...DEFAULT_JOINED_EVENT_IDS];
  }

  const validIds = value.filter((item) => typeof item === "string" && item.trim().length > 0);
  const uniqueIds = [...new Set([...DEFAULT_JOINED_EVENT_IDS, ...validIds])];

  return uniqueIds.length > 0 ? uniqueIds : [...DEFAULT_JOINED_EVENT_IDS];
}

export function readJoinedEventIds() {
  if (typeof window === "undefined") {
    return [...DEFAULT_JOINED_EVENT_IDS];
  }

  try {
    const storedValue = window.localStorage.getItem(JOINED_EVENT_IDS_KEY);

    if (!storedValue) {
      return [...DEFAULT_JOINED_EVENT_IDS];
    }

    return sanitizeJoinedEventIds(JSON.parse(storedValue));
  } catch {
    return [...DEFAULT_JOINED_EVENT_IDS];
  }
}

export function writeJoinedEventIds(joinedEventIds) {
  if (typeof window === "undefined") {
    return;
  }

  const nextIds = sanitizeJoinedEventIds(joinedEventIds);
  window.localStorage.setItem(JOINED_EVENT_IDS_KEY, JSON.stringify(nextIds));
}

export function addJoinedEventId(eventId, joinedEventIds = readJoinedEventIds()) {
  return sanitizeJoinedEventIds([...joinedEventIds, eventId]);
}

export function isJoinedEvent(eventId, joinedEventIds = readJoinedEventIds()) {
  return joinedEventIds.includes(eventId);
}
