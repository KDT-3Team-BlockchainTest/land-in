import { Navigate } from "react-router-dom";
import App from "../../App";
import { useAuth } from "../../contexts/useAuth";

function hasPersistedSession() {
  try {
    return Boolean(localStorage.getItem("land-in-token") && localStorage.getItem("land-in-user"));
  } catch {
    return false;
  }
}

export default function RequireAuth() {
  const { user } = useAuth();

  if (!user && !hasPersistedSession()) {
    return <Navigate to="/login" replace />;
  }

  return <App />;
}
