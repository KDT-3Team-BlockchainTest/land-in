import React, { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { authApi } from '../api/auth';
import { getToken, getStoredUser, removeToken, removeStoredUser, setToken, setStoredUser } from './storage';
import { AuthContext } from './AuthContext';

function normalize(data) {
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

  const persist = useCallback(async (profile) => {
    await setStoredUser(profile);
    setUser(profile);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    await setToken(data.accessToken);
    const profile = normalize(data);
    await persist(profile);
    return profile;
  }, [persist]);

  const signup = useCallback(async (email, password, displayName) => {
    const data = await authApi.signup({ email, password, displayName });
    await setToken(data.accessToken);
    const profile = normalize(data);
    await persist(profile);
    return profile;
  }, [persist]);

  const updateUser = useCallback(async (data) => {
    const profile = normalize(data);
    await persist(profile);
    return profile;
  }, [persist]);

  const logout = useCallback(async () => {
    await removeToken();
    await removeStoredUser();
    setUser(null);
  }, []);

  const syncFromServer = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const data = await authApi.me();
      await updateUser(data);
    } catch (err) {
      if (err?.status === 401) await logout();
    }
  }, [logout, updateUser]);

  useEffect(() => {
    (async () => {
      const stored = await getStoredUser();
      const token = await getToken();
      if (stored && token) setUser(stored);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    syncFromServer();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') syncFromServer();
    });
    return () => sub.remove();
  }, [!!user, syncFromServer]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
