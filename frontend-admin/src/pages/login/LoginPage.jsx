import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, token } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) {
    navigate('/events', { replace: true });
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email.trim().toLowerCase(), form.password);
      navigate('/events', { replace: true });
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__brand">
          Land-In
          <small>Partner admin</small>
        </div>
        <h1 className="admin-login__title">관리자 로그인</h1>
        <p className="admin-login__subtitle">
          제휴사 계정으로 로그인하여 컬렉션과 보상을 관리하세요.
        </p>

        <form className="admin-login__form" onSubmit={handleSubmit}>
          <div className="admin-field">
            <span className="admin-field__label">이메일</span>
            <input
              className="admin-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="admin-field">
            <span className="admin-field__label">비밀번호</span>
            <input
              className="admin-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className="admin-alert admin-alert--error">{error}</div>}

          <button
            type="submit"
            className="admin-button admin-button--primary admin-button--block"
            disabled={loading}
          >
            {loading ? '로그인 중…' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
