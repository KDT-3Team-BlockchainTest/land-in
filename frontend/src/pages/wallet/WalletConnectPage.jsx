import "./WalletConnectPage.css";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { walletApi } from "../../api/wallet";
import { useAuth } from "../../contexts/useAuth";
import { connectInjectedWallet, formatWalletAddress, HOODI_CHAIN_ID } from "../../utils/wallet";

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
  return error.message || "A problem occurred while connecting the wallet.";
}

export default function WalletConnectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nextPath = location.state?.nextPath ?? "/";

  const handleSkip = () => {
    navigate(nextPath, { replace: true });
  };

  const handleConnectWallet = async () => {
    setLoading(true);
    setError("");

    try {
      const wallet = await connectInjectedWallet();
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

  return (
    <div className="wallet-connect-page">
      <main className="wallet-connect-page__content">
        <section className="wallet-connect-page__hero">
          <div className="wallet-connect-page__badge">Wallet Onboarding</div>
          <div className="wallet-connect-page__icon-shell">
            <WalletIcon />
          </div>
          <h1 className="wallet-connect-page__title">
            Connect a wallet to unlock the full Land-in experience
          </h1>
          <p className="wallet-connect-page__description">
            Land-in will use Hoodi testnet wallet connections for future on-chain NFT minting flows. You can skip this
            for now, but some upcoming Web3 features will require a linked wallet.
          </p>
        </section>

        <section className="wallet-connect-page__notice-card">
          <h2>Before you connect</h2>
          <ul>
            <li>Wallet linking stores the wallet address that this account will use for future blockchain actions.</li>
            <li>You can skip this step now and reconnect the same wallet or a different wallet later.</li>
            <li>You can also disconnect the current wallet from My Page whenever needed.</li>
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

        <div className="wallet-connect-page__actions">
          <button
            type="button"
            className="wallet-connect-page__primary"
            onClick={handleConnectWallet}
            disabled={loading}
          >
            {loading ? "Connecting wallet..." : "Connect Wallet"}
          </button>
          <button
            type="button"
            className="wallet-connect-page__secondary"
            onClick={handleSkip}
            disabled={loading}
          >
            Skip for Now
          </button>
        </div>
      </main>
    </div>
  );
}
