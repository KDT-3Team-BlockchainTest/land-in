import { createContext, useContext, useState } from "react";

const authContext = createContext(null);

const TEST_ADMIN = { id: "admin", name: "관리자", nickname: "Admin", phone: "010-****-***8", role: "tenant" };

function loadUser() {
  try { return JSON.parse(sessionStorage.getItem("landin_user")); }
  catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const login = (id, password) => {
    if (id === "admin" && password === "admin1234") {
      sessionStorage.setItem("landin_user", JSON.stringify(TEST_ADMIN));
      setUser(TEST_ADMIN);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem("landin_user");
    setUser(null);
  };

  return (
    <authContext.Provider value={{ user, login, logout }}>
      {children}
    </authContext.Provider>
  );
}

export const useAuth = () => useContext(authContext);