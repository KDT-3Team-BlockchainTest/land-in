const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const BASE_URL = RAW_BASE_URL.replace(/\/$/, '');

export const TOKEN_KEY = 'land-in-admin-token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function request(method, path, body, options = {}) {
  const { auth = true } = options;
  const headers = { Accept: 'application/json' };
  const isFormData = body instanceof FormData;
  if (body != null && !isFormData) headers['Content-Type'] = 'application/json';
  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const text = await res.text();
  let payload = null;
  if (text.trim().length > 0) {
    try {
      payload = JSON.parse(text);
    } catch {
      const err = new Error(`서버가 잘못된 응답을 반환했습니다 (${res.status}).`);
      err.status = res.status;
      throw err;
    }
  }

  if (!res.ok) {
    const message = payload?.message || `요청에 실패했습니다 (${res.status}).`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return payload?.data ?? null;
}

export const api = {
  get: (path, options) => request('GET', path, undefined, options),
  post: (path, body, options) => request('POST', path, body, options),
  postForm: (path, formData, options) => request('POST', path, formData, options),
  put: (path, body, options) => request('PUT', path, body, options),
  delete: (path, options) => request('DELETE', path, undefined, options),
};
