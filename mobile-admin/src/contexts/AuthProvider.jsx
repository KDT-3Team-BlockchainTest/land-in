import { useCallback, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import { AuthContext } from './AuthContext';
import { getToken, removeToken, setToken } from '../utils/storage';

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { getToken().then((t) => { setTokenState(t); setReady(true); }); }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    await setToken(data.accessToken);
    setTokenState(data.accessToken);
  }, []);

  const logout = useCallback(async () => { await removeToken(); setTokenState(null); }, []);

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
