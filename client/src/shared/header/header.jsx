import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../admin/authContxt";
import "./header.css";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="nav-bar">
      <div className="nav-inner">
        <div className="nav-logo">
          <div className="nav-logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#4A7CFF" strokeWidth="2"/>
              <circle cx="12" cy="10" r="3" fill="#4A7CFF"/>
              <path d="M12 13c0 3 5 5 5 5H7s5-2 5-5z" fill="#4A7CFF" opacity="0.5"/>
            </svg>
          </div>
          <div className="nav-logo-text">
            <span className="nav-logo-name">공실</span>
            <span className="nav-logo-sub">당신의 완벽한 공간을 찾아보세요</span>
          </div>
        </div>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-pill ${isActive ? "active" : ""}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            홈
          </NavLink>
          <NavLink to="/contract" className={({ isActive }) => `nav-pill ${isActive ? "active" : ""}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            내 계약
          </NavLink>
          <NavLink to="/save" className={({ isActive }) => `nav-pill ${isActive ? "active" : ""}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            찜
          </NavLink>
          <NavLink to="/mypage" className={({ isActive }) => `nav-pill ${isActive ? "active" : ""}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            마이 페이지
          </NavLink>
        </nav>

        <div className="nav-user">
          {user ? (
            <>
              <span className="nav-username">{user.nickname}</span>
              <button className="nav-logout" onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <button className="nav-login" onClick={() => navigate("/login")}>로그인</button>
          )}
        </div>
      </div>
    </header>
  );
}
