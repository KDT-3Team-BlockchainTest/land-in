import { Navigate } from "react-router-dom";
import App from "../../App";
import { useAuth } from "../../contexts/useAuth";

export default function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <App />;
}