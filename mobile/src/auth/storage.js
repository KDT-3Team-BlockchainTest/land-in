import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'land-in-token';
const USER_KEY = 'land-in-user';

const webStorage = {
  getItem: async (key) => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  },
  deleteItem: async (key) => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  },
};

const secureStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  deleteItem: (key) => SecureStore.deleteItemAsync(key),
};

const storage = Platform.OS === 'web' ? webStorage : secureStorage;

export const getToken = () => storage.getItem(TOKEN_KEY);
export const setToken = (v) => storage.setItem(TOKEN_KEY, v);
export const removeToken = () => storage.deleteItem(TOKEN_KEY);

export async function getStoredUser() {
  try {
    const raw = await storage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export const setStoredUser = (u) => storage.setItem(USER_KEY, JSON.stringify(u));
export const removeStoredUser = () => storage.deleteItem(USER_KEY);
