import { useCallback, useState } from "react";
import { authApi } from "../api/auth";
import AuthContext from "./auth-context";
import { resetNfcPromptDismissal } from "../utils/nfcPermission";

function loadInitialUser() {
  try {
    const raw = localStorage.getItem("land-in-user");
    const token = localStorage.getItem("land-in-token");
    if (raw && token) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

function normalizeProfile(data) {
  return {
    id: data.id,
    email: data.email,
    displayName: data.displayName,
    avatarUrl: data.avatarUrl,
    walletAddress: data.walletAddress ?? null,
    walletChainId: data.walletChainId ?? null,
    walletProvider: data.walletProvider ?? null,
    walletConnectedAt: data.walletConnectedAt ?? null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadInitialUser);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem("land-in-token", data.accessToken);
    const profile = normalizeProfile(data);
    localStorage.setItem("land-in-user", JSON.stringify(profile));
    resetNfcPromptDismissal();
    setUser(profile);
    return profile;
  }, []);

  const signup = useCallback(async (email, password, displayName) => {
    const data = await authApi.signup({ email, password, displayName });
    localStorage.setItem("land-in-token", data.accessToken);
    const profile = normalizeProfile(data);
    localStorage.setItem("land-in-user", JSON.stringify(profile));
    resetNfcPromptDismissal();
    setUser(profile);
    return profile;
  }, []);

  const updateUserProfile = useCallback((profile) => {
    const nextUser = normalizeProfile(profile);
    localStorage.setItem("land-in-user", JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("land-in-token");
    localStorage.removeItem("land-in-user");
    resetNfcPromptDismissal();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, updateUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
