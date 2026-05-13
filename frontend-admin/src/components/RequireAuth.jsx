import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export default function RequireAuth() {
  const { admin, token, bootstrapping } = useAuth();
  const location = useLocation();

  if (bootstrapping) {
    return <div className="admin-loading">로딩 중…</div>;
  }
  if (!token || !admin) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
