import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/useAuth";
import {
  dismissNfcPromptForSession,
  getNfcPermissionState,
  isNfcPromptDismissedForSession,
  isWebNfcSupported,
  requestNfcPermission,
} from "../../utils/nfcPermission";
import "./NfcPermissionPrompt.css";

function PhoneWaveIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="23" y="12" width="18" height="40" rx="5" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="32" cy="45.5" r="1.8" fill="currentColor" />
      <path d="M16 24c-3 2.5-5 5.4-5 8s2 5.5 5 8" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M48 24c3 2.5 5 5.4 5 8s-2 5.5-5 8" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

function formatPermissionError(error) {
  if (!error) return "NFC 권한을 확인하지 못했습니다.";
  if (error.name === "NotAllowedError") return "브라우저 NFC 권한을 허용해 주세요.";
  if (error.name === "NotSupportedError") return "현재 기기 또는 브라우저는 NFC 권한 요청을 지원하지 않습니다.";
  if (error.name === "NotReadableError") return "NFC를 읽을 수 없습니다. 휴대폰 NFC 설정이 켜져 있는지 확인해 주세요.";
  return error.message || "NFC 권한 요청 중 문제가 발생했습니다.";
}

export default function NfcPermissionPrompt() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function syncPermissionPrompt() {
      if (!user || !isWebNfcSupported() || isNfcPromptDismissedForSession()) {
        if (!cancelled) setVisible(false);
        return;
      }

      const permissionState = await getNfcPermissionState();
      if (!cancelled) {
        setVisible(permissionState !== "granted");
      }
    }

    syncPermissionPrompt();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || !visible || !isWebNfcSupported()) {
    return null;
  }

  const handleDismiss = () => {
    dismissNfcPromptForSession();
    setVisible(false);
    setError("");
  };

  const handleRequestPermission = async () => {
    setLoading(true);
    setError("");

    try {
      await requestNfcPermission();
      setVisible(false);
    } catch (permissionError) {
      setError(formatPermissionError(permissionError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nfc-permission-modal" role="dialog" aria-modal="true" aria-labelledby="nfc-permission-title">
      <div className="nfc-permission-modal__backdrop" onClick={handleDismiss} />
      <div className="nfc-permission-modal__panel">
        <div className="nfc-permission-modal__icon">
          <PhoneWaveIcon />
        </div>
        <p className="nfc-permission-modal__eyebrow">NFC 사용 준비</p>
        <h2 id="nfc-permission-title" className="nfc-permission-modal__title">
          태그 인증을 위해 NFC 권한이 필요해요
        </h2>
        <p className="nfc-permission-modal__description">
          지금 허용해 두면 이후 태그 페이지에서 바로 NFC 태그를 읽고 서버로 전송해 NFT 발행까지 이어갈 수 있습니다.
        </p>
        <div className="nfc-permission-modal__tips">
          <p>1. 아래 버튼을 누르면 브라우저 권한 팝업이 열립니다.</p>
          <p>2. 팝업에서 NFC 사용을 허용해 주세요.</p>
          <p>3. 휴대폰 NFC 기능이 꺼져 있으면 먼저 켜 주세요.</p>
        </div>
        {error && <p className="nfc-permission-modal__error">{error}</p>}
        <div className="nfc-permission-modal__actions">
          <button
            type="button"
            className="nfc-permission-modal__primary"
            onClick={handleRequestPermission}
            disabled={loading}
          >
            {loading ? "권한 요청 중..." : "NFC 권한 허용하기"}
          </button>
          <button type="button" className="nfc-permission-modal__secondary" onClick={handleDismiss} disabled={loading}>
            나중에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}
