import Constants from 'expo-constants';
import { getToken } from '../utils/storage';

const BASE_URL = (Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://localhost:8080/api').replace(/\/$/, '');

async function request(method, path, body, options = {}) {
  const { auth = true } = options;
  const headers = { Accept: 'application/json' };
  if (body != null) headers['Content-Type'] = 'application/json';
  if (auth) { const t = await getToken(); if (t) headers.Authorization = `Bearer ${t}`; }
  const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: body != null ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let payload = null;
  if (text.trim()) { try { payload = JSON.parse(text); } catch { throw Object.assign(new Error('Unexpected response'), { status: res.status }); } }
  if (!res.ok) throw Object.assign(new Error(payload?.message || 'Error'), { status: res.status });
  return payload?.data ?? null;
}

export const api = {
  get:    (p, o)    => request('GET',    p, undefined, o),
  post:   (p, b, o) => request('POST',   p, b, o),
  patch:  (p, b, o) => request('PATCH',  p, b, o),
  delete: (p, o)    => request('DELETE', p, undefined, o),
};
