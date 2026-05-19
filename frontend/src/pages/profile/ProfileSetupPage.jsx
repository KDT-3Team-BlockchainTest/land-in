import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../api/auth";
import { useAuth } from "../../contexts/useAuth";
import { NEXT_PATH_QUERY, readNextPath } from "../../utils/navigation";
import "./ProfileSetupPage.css";

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateUserProfile } = useAuth();
  const nextPath = useMemo(() => readNextPath(searchParams), [searchParams]);
  const nextQuery = useMemo(() => `?${NEXT_PATH_QUERY}=${encodeURIComponent(nextPath)}`, [nextPath]);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const routeAfterProfile = (profile) => {
    navigate(profile.walletAddress ? nextPath : `/wallet/connect${nextQuery}`, {
      replace: true,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedDisplayName = displayName.trim();

    if (!trimmedDisplayName) {
      setError("닉네임을 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const profile = await authApi.updateMe({ displayName: trimmedDisplayName });
      const nextProfile = updateUserProfile(profile);
      routeAfterProfile(nextProfile);
    } catch (err) {
      setError(err.message || "닉네임을 저장하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (user) {
      routeAfterProfile(user);
    }
  };

  return (
    <div className="profile-setup-page">
      <main className="profile-setup-page__card">
        <div className="profile-setup-page__avatar" aria-hidden="true">
          {(displayName.trim() || user?.displayName || "L").slice(0, 1).toUpperCase()}
        </div>
        <p className="profile-setup-page__eyebrow">Profile Setup</p>
        <h1 className="profile-setup-page__title">닉네임을 정해 주세요</h1>
        <p className="profile-setup-page__description">
          소셜 계정 이름 대신 Land-in에서 사용할 별명으로 표시됩니다.
        </p>

        <form className="profile-setup-page__form" onSubmit={handleSubmit}>
          <label htmlFor="displayName">Nickname</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={30}
            autoFocus
            autoComplete="nickname"
            placeholder="예: 여행자 민"
          />
          <div className="profile-setup-page__meta">
            <span>{displayName.trim().length}/30</span>
          </div>

          {error ? <p className="profile-setup-page__error">{error}</p> : null}

          <button type="submit" className="profile-setup-page__primary" disabled={loading}>
            {loading ? "Saving..." : "Save and Continue"}
          </button>
          <button type="button" className="profile-setup-page__secondary" onClick={handleContinue} disabled={loading}>
            Continue with Current Name
          </button>
        </form>
      </main>
    </div>
  );
}
