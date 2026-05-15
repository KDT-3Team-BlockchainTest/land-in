import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

const NAV = [
  { to: '/events', label: '이벤트 관리' },
  { to: '/events/new', label: '새 이벤트 만들기' },
];

export default function Shell() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          Land-In
          <small>Partner admin</small>
        </div>
        <nav className="admin-sidebar__nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/events'}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? 'is-active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <span>
            <strong>{admin?.partnerName}</strong>
          </span>
          <span>{admin?.email}</span>
          <button type="button" onClick={handleLogout} className="admin-sidebar__logout">
            로그아웃
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
