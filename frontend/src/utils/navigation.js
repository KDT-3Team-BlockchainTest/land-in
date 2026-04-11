export const NEXT_PATH_QUERY = "next";

export function sanitizeNextPath(candidate) {
  if (!candidate || typeof candidate !== "string") {
    return "/";
  }

  if (!candidate.startsWith("/")) {
    return "/";
  }

  if (candidate.startsWith("//")) {
    return "/";
  }

  return candidate;
}

export function buildNextPath(pathname = "/", search = "", hash = "") {
  return sanitizeNextPath(`${pathname}${search}${hash}`);
}

export function readNextPath(searchParams, fallback = "/") {
  return sanitizeNextPath(searchParams?.get?.(NEXT_PATH_QUERY) || fallback);
}
