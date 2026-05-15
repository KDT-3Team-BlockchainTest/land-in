import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'land-in-token';
const USER_KEY  = 'land-in-user';

export const getToken  = ()      => SecureStore.getItemAsync(TOKEN_KEY);
export const setToken  = (v)     => SecureStore.setItemAsync(TOKEN_KEY, v);
export const removeToken = ()    => SecureStore.deleteItemAsync(TOKEN_KEY);

export async function getUser() {
  try { const r = await SecureStore.getItemAsync(USER_KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
export const setUser    = (u)    => SecureStore.setItemAsync(USER_KEY, JSON.stringify(u));
export const removeUser = ()     => SecureStore.deleteItemAsync(USER_KEY);
export const clearAuth  = ()     => Promise.all([removeToken(), removeUser()]);
