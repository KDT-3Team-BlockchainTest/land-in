import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import { getToken, removeToken, setToken } from '../api/client';
import { getStoredUser, removeStoredUser, setStoredUser } from './storage';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    await setToken(data.accessToken);
    await setStoredUser(data);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    await removeStoredUser();
    setUser(null);
  }, []);

  useEffect(() => {
    (async () => {
      const stored = await getStoredUser();
      const token = await getToken();
      if (stored && token) setUser(stored);
      setLoading(false);
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
