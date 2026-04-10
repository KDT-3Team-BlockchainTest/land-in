import "./WalletConnectPage.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";
import { walletApi } from "../../api/wallet";
import { useAuth } from "../../contexts/useAuth";
import {
  connectMetaMaskWallet,
  formatWalletAddress,
  HOODI_CHAIN_ID,
  META_MASK_MOBILE_CONNECT_QUERY,
  openMetaMaskMobileBrowser,
  shouldUseMetaMaskMobileRedirect,
} from "../../utils/wallet";

function WalletIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M16 20a6 6 0 0 1 6-6h25a5 5 0 0 1 0 10H23a3 3 0 1 0 0 6h25v18a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M54 31H40a5 5 0 0 0 0 10h14V31Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <circle cx="43.5" cy="36" r="1.8" fill="currentColor" />
    </svg>
  );
}

function formatWalletError(error) {
  if (!error) return "A problem occurred while connecting the wallet.";
  if (error.code === "NO_PROVIDER") return error.message;
  if (error.code === 4001) return "The wallet connection request was cancelled.";
  if (error.code === -32002) return "A MetaMask connection request is already waiting for approval.";
  return error.message || "A problem occurred while connecting the wallet.";
}

export default function WalletConnectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mobilePending, setMobilePending] = useState(false);
  const [error, setError] = useState("");
  const autoConnectAttemptedRef = useRef(false);

  const nextPath = location.state?.nextPath ?? "/";

  const handleSkip = () => {
    navigate(nextPath, { replace: true });
  };

  const syncProfileFromServer = useCallback(async () => {
    try {
      const profile = await authApi.me();
      updateUserProfile(profile);

      if (profile?.walletAddress) {
        setMobilePending(false);
        setLoading(false);
        navigate(nextPath, { replace: true });
        return true;
      }
    } catch {
      // Ignore transient network/auth errors here and let the user retry manually.
    }

    return false;
  }, [navigate, nextPath, updateUserProfile]);

  const handleConnectWallet = async () => {
    if (shouldUseMetaMaskMobileRedirect()) {
      setError("");
      setLoading(false);
      setMobilePending(true);
      openMetaMaskMobileBrowser({ preserveCurrentTab: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const wallet = await connectMetaMaskWallet();
      if (wallet.chainId !== HOODI_CHAIN_ID) {
        throw new Error("Please switch to the Hoodi testnet and try again.");
      }

      const profile = await walletApi.connect(wallet);
      updateUserProfile(profile);
      navigate(nextPath, { replace: true });
    } catch (connectError) {
      setError(formatWalletError(connectError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mobilePending || user?.walletAddress) {
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 75;

    const poll = async () => {
      if (cancelled) return;
      attempts += 1;
      const synced = await syncProfileFromServer();
      if (synced || attempts >= maxAttempts) {
        if (!synced) {
          setMobilePending(false);
        }
        return;
      }

      window.setTimeout(poll, 2000);
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [mobilePending, syncProfileFromServer, user?.walletAddress]);

  // 지갑이 연결되는 순간 (모바일 복귀 시 AuthProvider visibilitychange 포함) 자동 이동
  useEffect(() => {
    if (user?.walletAddress) {
      navigate(nextPath, { replace: true });
    }
  }, [user?.walletAddress, navigate, nextPath]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldAutoConnect = params.get(META_MASK_MOBILE_CONNECT_QUERY) === "1";

    if (!shouldAutoConnect || autoConnectAttemptedRef.current || user?.walletAddress) {
      return;
    }

    autoConnectAttemptedRef.current = true;
    handleConnectWallet();
  }, [location.search, user?.walletAddress]);

  return (
    <div className="wallet-connect-page">
      <main className="wallet-connect-page__content">
        <section className="wallet-connect-page__hero">
          <div className="wallet-connect-page__badge">Wallet Onboarding</div>
          <div className="wallet-connect-page__icon-shell">
            <WalletIcon />
          </div>
          <h1 className="wallet-connect-page__title">
            Connect MetaMask to unlock the full Land-in experience
          </h1>
          <p className="wallet-connect-page__description">
            Land-in uses Hoodi testnet wallet connections for future on-chain NFT minting. On mobile browsers, this
            flow opens the MetaMask app and continues inside the MetaMask browser on your phone.
          </p>
        </section>

        <section className="wallet-connect-page__notice-card">
          <h2>Before you connect</h2>
          <ul>
            <li>On desktop, Land-in uses your installed wallet. On mobile, it opens MetaMask for approval.</li>
            <li>If you start in Android Chrome or Safari, Land-in moves you into the MetaMask in-app browser first.</li>
            <li>Wallet linking stores the address this account will use for future blockchain actions.</li>
            <li>You can skip this step now and reconnect the same wallet or a different wallet later.</li>
          </ul>
        </section>

        <section className="wallet-connect-page__network-card">
          <div>
            <p className="wallet-connect-page__network-label">Target network</p>
            <strong>Ethereum Hoodi Testnet</strong>
          </div>
          <span>Chain ID {HOODI_CHAIN_ID}</span>
        </section>

        {user?.walletAddress ? (
          <section className="wallet-connect-page__connected-card">
            <p className="wallet-connect-page__network-label">Currently linked wallet</p>
            <strong>{formatWalletAddress(user.walletAddress)}</strong>
          </section>
        ) : null}

        {error ? <p className="wallet-connect-page__error">{error}</p> : null}
        {mobilePending ? (
          <p className="wallet-connect-page__error">
            MetaMask approval is in progress. After approving in MetaMask, return to this tab and we will
            sync automatically.
          </p>
        ) : null}

        <div className="wallet-connect-page__actions">
          <button
            type="button"
            className="wallet-connect-page__primary"
            onClick={handleConnectWallet}
            disabled={loading || mobilePending}
          >
            {loading ? "Opening MetaMask..." : mobilePending ? "Waiting for approval..." : "Connect MetaMask"}
          </button>
          {mobilePending ? (
            <button
              type="button"
              className="wallet-connect-page__secondary"
              onClick={syncProfileFromServer}
              disabled={loading}
            >
              I approved, check again
            </button>
          ) : null}
          <button
            type="button"
            className="wallet-connect-page__secondary"
            onClick={handleSkip}
            disabled={loading || mobilePending}
          >
            Skip for Now
          </button>
        </div>
      </main>
    </div>
  );
}
