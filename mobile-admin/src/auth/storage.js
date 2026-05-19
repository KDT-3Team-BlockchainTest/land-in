import * as SecureStore from 'expo-secure-store';

const USER_KEY = 'land-in-admin-user';

export async function getStoredUser() {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export const setStoredUser = (u) => SecureStore.setItemAsync(USER_KEY, JSON.stringify(u));
export const removeStoredUser = () => SecureStore.deleteItemAsync(USER_KEY);
