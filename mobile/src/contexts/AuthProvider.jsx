import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { authApi } from '../api/auth';
import { AuthContext } from './auth-context';
import { clearAuth, getToken, getUser, setToken, setUser } from '../utils/storage';

function normalize(data) {
  return {
    id: data.id, email: data.email, displayName: data.displayName,
    avatarUrl: data.avatarUrl,
    walletAddress: data.walletAddress ?? null,
    walletChainId: data.walletChainId ?? null,
    walletProvider: data.walletProvider ?? null,
    walletConnectedAt: data.walletConnectedAt ?? null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getUser().then((u) => { if (u) setUserState(u); setReady(true); });
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    await setToken(data.accessToken);
    const profile = normalize(data);
    await setUser(profile);
    setUserState(profile);
    return profile;
  }, []);

  const signup = useCallback(async (email, password, displayName) => {
    const data = await authApi.signup({ email, password, displayName });
    await setToken(data.accessToken);
    const profile = normalize(data);
    await setUser(profile);
    setUserState(profile);
    return profile;
  }, []);

  const updateUserProfile = useCallback(async (data) => {
    const profile = normalize(data);
    await setUser(profile);
    setUserState(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
    setUserState(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function sync() {
      const token = await getToken();
      if (!token) return;
      try {
        const p = await authApi.me();
        if (!cancelled) await updateUserProfile(p);
      } catch (e) {
        if (!cancelled && e?.status === 401) logout();
      }
    }
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') sync(); });
    sync();
    return () => { cancelled = true; sub.remove(); };
  }, [logout, updateUserProfile]);

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ user, login, signup, updateUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
