import { useCallback, useState } from "react";
import { authApi } from "../api/auth";
import { AuthContext } from "./auth-context";

function loadInitialUser() {
  try {
    const raw = localStorage.getItem("land-in-user");
    const token = localStorage.getItem("land-in-token");
    if (raw && token) return JSON.parse(raw);
  } catch {
    // ignore invalid localStorage data
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadInitialUser);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem("land-in-token", data.accessToken);
    const profile = {
      id: data.id,
      email: data.email,
      displayName: data.displayName,
      avatarUrl: data.avatarUrl,
    };
    localStorage.setItem("land-in-user", JSON.stringify(profile));
    setUser(profile);
    return profile;
  }, []);

  const signup = useCallback(async (email, password, displayName) => {
    const data = await authApi.signup({ email, password, displayName });
    localStorage.setItem("land-in-token", data.accessToken);
    const profile = {
      id: data.id,
      email: data.email,
      displayName: data.displayName,
      avatarUrl: data.avatarUrl,
    };
    localStorage.setItem("land-in-user", JSON.stringify(profile));
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("land-in-token");
    localStorage.removeItem("land-in-user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}