import * as SecureStore from 'expo-secure-store';
const KEY = 'land-in-admin-token';
export const getToken    = ()  => SecureStore.getItemAsync(KEY);
export const setToken    = (v) => SecureStore.setItemAsync(KEY, v);
export const removeToken = ()  => SecureStore.deleteItemAsync(KEY);
