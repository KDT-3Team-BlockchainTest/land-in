import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/useAuth";
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await signup(form.email, form.password, form.displayName);
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__card">
        <div className="login-page__logo">✦ land-in</div>
        <h1 className="login-page__title">
          {mode === 'login' ? '로그인' : '회원가입'}
        </h1>
        <p className="login-page__subtitle">
          {mode === 'login'
            ? '실제 랜드마크를 방문하고 NFT를 수집하세요.'
            : '새 계정을 만들어 여행을 시작하세요.'}
        </p>

        <form onSubmit={handleSubmit} className="login-page__form">
          {mode === 'signup' && (
            <div className="login-page__field">
              <label htmlFor="displayName">닉네임</label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={form.displayName}
                onChange={handleChange}
                placeholder="여행자 닉네임"
                required
              />
            </div>
          )}

          <div className="login-page__field">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="login-page__field">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder={mode === 'signup' ? '8자 이상' : '비밀번호 입력'}
              required
              minLength={mode === 'signup' ? 8 : undefined}
            />
          </div>

          {error && <p className="login-page__error">{error}</p>}

          <button
            type="submit"
            className="login-page__submit"
            disabled={loading}
          >
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
          </button>
        </form>

        <button
          type="button"
          className="login-page__toggle"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
        >
          {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
        </button>
      </div>
    </div>
  );
}
