import { Navigate, useLocation } from "react-router-dom";
import App from "../../App";
import { useAuth } from "../../contexts/useAuth";
import { buildNextPath, NEXT_PATH_QUERY } from "../../utils/navigation";

function hasPersistedSession() {
  try {
    return Boolean(localStorage.getItem("land-in-token") && localStorage.getItem("land-in-user"));
  } catch {
    return false;
  }
}

export default function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user && !hasPersistedSession()) {
    const nextPath = buildNextPath(location.pathname, location.search, location.hash);
    return <Navigate to={`/login?${NEXT_PATH_QUERY}=${encodeURIComponent(nextPath)}`} replace />;
  }

  return <App />;
}
