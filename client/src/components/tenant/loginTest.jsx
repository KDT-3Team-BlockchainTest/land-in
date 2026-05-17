import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../admin/authContxt";
import "./loginTest.css";

export default function LoginTest() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(id, password)) {
      navigate("/");
    } else {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#4A7CFF" strokeWidth="2"/>
              <circle cx="12" cy="10" r="3" fill="#4A7CFF"/>
              <path d="M12 13c0 3 5 5 5 5H7s5-2 5-5z" fill="#4A7CFF" opacity="0.5"/>
            </svg>
          </div>
          <span className="login-logo-name">공실</span>
        </div>

        <h2 className="login-title">로그인</h2>
        <p className="login-sub">당신의 완벽한 공간을 찾아보세요</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>아이디</label>
            <input
              type="text"
              value={id}
              onChange={(e) => { setId(e.target.value); setError(""); }}
              placeholder="아이디를 입력하세요"
              autoComplete="username"
            />
          </div>
          <div className="login-field">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit">로그인</button>
        </form>

        <p className="login-hint">테스트 계정: admin / admin1234</p>
      </div>
    </div>
  );
}
