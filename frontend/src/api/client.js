const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const BASE_URL = RAW_BASE_URL.replace(/\/$/, "");
const DEFAULT_ERROR_MESSAGE = "A server error occurred.";

function getToken() {
  return localStorage.getItem("land-in-token");
}

function buildUnexpectedResponseMessage(res, responseText) {
  const trimmedText = responseText.trim();

  if (!trimmedText) {
    return `Empty response from server (${res.status} ${res.statusText || "Unknown Status"}).`;
  }

  if (trimmedText.startsWith("<")) {
    return "The API returned HTML instead of JSON. This usually means the mobile browser is using an old cached frontend build or the API base URL is wrong.";
  }

  return `The API returned an unexpected response: ${trimmedText.slice(0, 160)}`;
}

async function request(method, path, body) {
  const headers = { Accept: "application/json" };

  if (body != null) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  const responseText = await res.text();
  const hasBody = responseText.trim().length > 0;
  let payload = null;

  if (hasBody) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      const err = new Error(buildUnexpectedResponseMessage(res, responseText));
      err.status = res.status;
      err.responseText = responseText;
      throw err;
    }
  }

  if (!res.ok) {
    const err = new Error(payload?.message || buildUnexpectedResponseMessage(res, responseText) || DEFAULT_ERROR_MESSAGE);
    err.status = res.status;
    err.responseText = responseText;
    throw err;
  }

  if (!hasBody || res.status === 204) {
    return null;
  }

  return payload?.data ?? null;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};
