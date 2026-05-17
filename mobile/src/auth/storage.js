import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'land-in-token';
const USER_KEY = 'land-in-user';

export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const setToken = (v) => SecureStore.setItemAsync(TOKEN_KEY, v);
export const removeToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

export async function getStoredUser() {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export const setStoredUser = (u) => SecureStore.setItemAsync(USER_KEY, JSON.stringify(u));
export const removeStoredUser = () => SecureStore.deleteItemAsync(USER_KEY);
