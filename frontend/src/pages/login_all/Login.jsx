import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const normalizedEmail = form.email.trim().toLowerCase();

    try {
      const profile = await login(normalizedEmail, form.password);
      navigate(profile.walletAddress ? "/" : "/wallet/connect", {
        replace: true,
        state: { nextPath: "/" },
      });
    } catch (err) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo" aria-hidden="true" />

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to continue your Land-In journey.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="email"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
              />
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-container" htmlFor="remember">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={form.remember}
                onChange={handleChange}
              />
              <span className="checkmark" />
              Keep me signed in
            </label>
            <span className="find-pw">Forgot password?</span>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>

        <div className="divider">or</div>

        <div className="social-login-group">
          <button type="button" className="social-btn google">
            Continue with Google
          </button>
          <button type="button" className="social-btn apple">
            Continue with Apple
          </button>
          <button type="button" className="social-btn kakao">
            Continue with Kakao
          </button>
        </div>

        <div className="auth-footer">
          New here?
          <Link to="/join" className="link-text">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
