const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const BASE_URL = RAW_BASE_URL.replace(/\/$/, "");

function getToken() {
  return localStorage.getItem('land-in-token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) {
    const err = new Error(json.message || '서버 오류가 발생했습니다.');
    err.status = res.status;
    throw err;
  }

  return json.data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};
