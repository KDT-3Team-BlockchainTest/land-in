import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { authApi } from '../api/auth';
import { getToken, removeToken, setToken } from '../api/client';
import * as SecureStore from 'expo-secure-store';

const USER_KEY = 'land-in-user';
const AuthContext = createContext(null);

function normalizeProfile(data) {
  return {
    id: data.id,
    email: data.email,
    displayName: data.displayName,
    avatarUrl: data.avatarUrl ?? null,
    walletAddress: data.walletAddress ?? null,
    walletChainId: data.walletChainId ?? null,
    walletProvider: data.walletProvider ?? null,
    walletConnectedAt: data.walletConnectedAt ?? null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistUser = useCallback(async (profile) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(profile));
    setUser(profile);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    await setToken(data.accessToken);
    const profile = normalizeProfile(data);
    await persistUser(profile);
    return profile;
  }, [persistUser]);

  const signup = useCallback(async (email, password, displayName) => {
    const data = await authApi.signup({ email, password, displayName });
    await setToken(data.accessToken);
    const profile = normalizeProfile(data);
    await persistUser(profile);
    return profile;
  }, [persistUser]);

  const updateUserProfile = useCallback(async (profile) => {
    const next = normalizeProfile(profile);
    await persistUser(next);
    return next;
  }, [persistUser]);

  const logout = useCallback(async () => {
    await removeToken();
    await SecureStore.deleteItemAsync(USER_KEY);
    setUser(null);
  }, []);

  const syncFromServer = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const serverProfile = await authApi.me();
      await updateUserProfile(serverProfile);
    } catch (error) {
      if (error?.status === 401) await logout();
    }
  }, [logout, updateUserProfile]);

  useEffect(() => {
    async function init() {
      try {
        const raw = await SecureStore.getItemAsync(USER_KEY);
        const token = await getToken();
        if (raw && token) setUser(JSON.parse(raw));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!user) return;
    syncFromServer();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncFromServer();
    });
    return () => subscription.remove();
  }, [user, syncFromServer]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, updateUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
