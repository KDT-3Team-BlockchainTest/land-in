import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Login.css";

function normalizeOAuthUser(rawUser) {
  const user = JSON.parse(rawUser);
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl || null,
    walletAddress: user.walletAddress || null,
    walletChainId: user.walletChainId || null,
    walletProvider: user.walletProvider || null,
    walletConnectedAt: user.walletConnectedAt || null,
  };
}

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const result = useMemo(() => {
    const token = searchParams.get("oauth_token");
    const rawUser = searchParams.get("oauth_user");
    const next = searchParams.get("next") || "/";
    const oauthError = searchParams.get("oauth_error");

    if (oauthError) {
      return { error: oauthError };
    }

    if (!token || !rawUser) {
      return { error: "간편 로그인 응답이 올바르지 않습니다." };
    }

    try {
      return { token, profile: normalizeOAuthUser(rawUser), next };
    } catch {
      return { error: "간편 로그인 정보를 저장하지 못했습니다." };
    }
  }, [searchParams]);

  useEffect(() => {
    if (result.error) {
      return;
    }

    localStorage.setItem("land-in-token", result.token);
    localStorage.setItem("land-in-user", JSON.stringify(result.profile));
    navigate(result.profile.walletAddress ? result.next : `/wallet/connect?next=${encodeURIComponent(result.next)}`, {
      replace: true,
    });
  }, [navigate, result]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo" aria-hidden="true" />
        <h1 className="auth-title">Signing In</h1>
        <p className="auth-subtitle">{result.error || "간편 로그인 정보를 확인하는 중입니다."}</p>
      </div>
    </div>
  );
}
