import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth';
import { TOKEN_KEY } from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [bootstrapping, setBootstrapping] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    if (!token) {
      setBootstrapping(false);
      return;
    }
    let cancelled = false;
    authApi
      .me()
      .then((profile) => {
        if (!cancelled) setAdmin(profile);
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setAdmin(null);
        }
      })
      .finally(() => {
        if (!cancelled) setBootstrapping(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    const result = await authApi.login(email, password);
    localStorage.setItem(TOKEN_KEY, result.accessToken);
    setToken(result.accessToken);
    setAdmin({
      id: result.id,
      email: result.email,
      partnerName: result.partnerName,
      displayName: result.displayName,
    });
    return result;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({ admin, token, bootstrapping, login, logout }),
    [admin, token, bootstrapping, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
