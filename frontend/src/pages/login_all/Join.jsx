import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import "./Join.css";

const initialTerms = {
  service: false,
  privacy: false,
  marketing: false,
};

export default function Join() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [terms, setTerms] = useState(initialTerms);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const allChecked = Object.values(terms).every(Boolean);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTermChange = (event) => {
    const { name, checked } = event.target;

    if (name === "all") {
      setTerms({
        service: checked,
        privacy: checked,
        marketing: checked,
      });
      return;
    }

    setTerms((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!terms.service || !terms.privacy) {
      setError("Please agree to the required terms.");
      return;
    }

    setLoading(true);

    try {
      await signup(form.email, form.password, form.displayName);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo" aria-hidden="true" />
        <h1 className="auth-title">Join Land-In</h1>
        <p className="auth-subtitle">Create your account and start exploring.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="displayName">Name</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={form.displayName}
              onChange={handleChange}
              placeholder="Your name"
              className="join-input"
              autoComplete="name"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="join-input"
              autoComplete="email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              className="join-input"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className="join-input"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="terms-box">
            <div className="terms-item all-agree">
              <input
                type="checkbox"
                id="all"
                name="all"
                checked={allChecked}
                onChange={handleTermChange}
              />
              <label htmlFor="all">Agree to all</label>
            </div>
            <hr />
            <div className="terms-item">
              <input
                type="checkbox"
                id="service"
                name="service"
                checked={terms.service}
                onChange={handleTermChange}
              />
              <label htmlFor="service">
                <span>[Required]</span> Terms of Service
              </label>
              <span className="view-link">View</span>
            </div>
            <div className="terms-item">
              <input
                type="checkbox"
                id="privacy"
                name="privacy"
                checked={terms.privacy}
                onChange={handleTermChange}
              />
              <label htmlFor="privacy">
                <span>[Required]</span> Privacy Policy
              </label>
              <span className="view-link">View</span>
            </div>
            <div className="terms-item">
              <input
                type="checkbox"
                id="marketing"
                name="marketing"
                checked={terms.marketing}
                onChange={handleTermChange}
              />
              <label htmlFor="marketing">
                <span>[Optional]</span> Marketing Updates
              </label>
              <span className="view-link">View</span>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?
          <Link to="/login" className="link-text">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
