import "./MyPage.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adaptProfileSummary } from "../../api/adapters";
import { dashboardApi } from "../../api/dashboard";
import { walletApi } from "../../api/wallet";
import ProfileAchievementCard from "../../components/common/ProfileAchievementCard/ProfileAchievementCard";
import ProfileMenuCard from "../../components/common/ProfileMenuCard/ProfileMenuCard";
import { getAchievementItems, settingsItems } from "../../data/profile";
import { useAuth } from "../../contexts/useAuth";
import { disconnectWalletSession, formatWalletAddress, HOODI_CHAIN_ID } from "../../utils/wallet";

function travelStats(profileSummary) {
  return [
    {
      id: "landmarks",
      emoji: "LM",
      label: "Landmarks",
      description: "Verified landmark visits",
      value: profileSummary.landmarkCount ?? 0,
      unit: "",
      color: "#fe6b70",
      backgroundColor: "rgba(254, 107, 112, 0.08)",
    },
    {
      id: "countries",
      emoji: "CT",
      label: "Countries",
      description: "Countries explored through collections",
      value: profileSummary.countryCount ?? 0,
      unit: "",
      color: "#8b5cf6",
      backgroundColor: "rgba(139, 92, 246, 0.08)",
    },
    {
      id: "distance",
      emoji: "KM",
      label: "Distance",
      description: "Estimated from your route activity",
      value: profileSummary.totalDistanceLabel ?? "0 km",
      unit: "",
      color: "#06b6d4",
      backgroundColor: "rgba(6, 182, 212, 0.08)",
    },
  ];
}

const defaultProfile = {
  nftCount: 0,
  cityCount: 0,
  countryCount: 0,
  completedCollectionCount: 0,
  landmarkCount: 0,
  totalDistanceLabel: "0 km",
};

export default function MyPage() {
  const navigate = useNavigate();
  const { user, logout, updateUserProfile } = useAuth();
  const [profileSummary, setProfileSummary] = useState(defaultProfile);
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    let active = true;

    dashboardApi
      .stats()
      .then((stats) => {
        if (active) {
          setProfileSummary(adaptProfileSummary(stats));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const achievements = getAchievementItems(profileSummary);
  const unlockedCount = achievements.filter((achievement) => achievement.state === "unlocked").length;
  const unlockedPercent = achievements.length ? Math.round((unlockedCount / achievements.length) * 100) : 0;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleWalletConnect = () => {
    navigate("/wallet/connect", { state: { nextPath: "/mypage" } });
  };

  const handleWalletDisconnect = async () => {
    const shouldDisconnect = window.confirm(
      "Disconnect the currently linked wallet? You can reconnect the same wallet or a different wallet later.",
    );

    if (!shouldDisconnect) {
      return;
    }

    setWalletLoading(true);
    try {
      const profile = await walletApi.disconnect();
      updateUserProfile(profile);
      await disconnectWalletSession().catch(() => {});
    } catch (error) {
      window.alert(error.message || "Failed to disconnect the wallet.");
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <main className="page-layout__content">
        <section className="my-page__intro">
          <h1 className="page-title">My Page</h1>
        </section>

        <section className="my-page__profile-card">
          <div className="my-page__profile-accent" />
          <div className="my-page__profile-body">
            <div className="my-page__profile-header">
              <div className="my-page__avatar" aria-hidden="true">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="avatar" /> : <span>U</span>}
              </div>
              <div className="my-page__identity">
                <div>
                  <p className="my-page__name">{user?.displayName ?? "Land-in User"}</p>
                  <p className="my-page__handle">{user?.email ?? ""}</p>
                </div>
                <span className="my-page__level">City Explorer</span>
              </div>
            </div>
            <div className="my-page__profile-stats">
              <article className="my-page__mini-stat is-coral">
                <p className="my-page__mini-value">{profileSummary.nftCount}</p>
                <p className="my-page__mini-label">Owned NFTs</p>
              </article>
              <article className="my-page__mini-stat is-violet">
                <p className="my-page__mini-value">{profileSummary.cityCount}</p>
                <p className="my-page__mini-label">Visited Cities</p>
              </article>
            </div>
          </div>
        </section>

        <section className="my-page__wallet-card">
          <div className="my-page__section-head">
            <div>
              <p className="my-page__section-title">Wallet Connection</p>
              <p className="my-page__section-description">
                Link your Hoodi testnet wallet to prepare for future on-chain minting and manage which wallet this
                account uses.
              </p>
            </div>
            <span className={`my-page__wallet-badge ${user?.walletAddress ? "is-connected" : "is-pending"}`}>
              {user?.walletAddress ? "Connected" : "Not linked"}
            </span>
          </div>
          <div className="my-page__wallet-body">
            <div>
              <p className="my-page__wallet-label">Current wallet</p>
              <strong className="my-page__wallet-value">
                {user?.walletAddress ? formatWalletAddress(user.walletAddress) : "No wallet connected yet"}
              </strong>
              <p className="my-page__wallet-meta">
                {user?.walletAddress
                  ? `Hoodi Testnet - Chain ID ${user.walletChainId ?? HOODI_CHAIN_ID}`
                  : "You can skip wallet onboarding for now, but future Web3 features will require a linked wallet."}
              </p>
            </div>
            <div className="my-page__wallet-actions">
              <button
                type="button"
                className="my-page__wallet-button"
                onClick={handleWalletConnect}
                disabled={walletLoading}
              >
                {user?.walletAddress ? "Reconnect Wallet" : "Connect Wallet"}
              </button>
              {user?.walletAddress ? (
                <button
                  type="button"
                  className="my-page__wallet-disconnect"
                  onClick={handleWalletDisconnect}
                  disabled={walletLoading}
                >
                  {walletLoading ? "Disconnecting..." : "Disconnect"}
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="my-page__travel-card">
          <div className="my-page__section-head">
            <div>
              <p className="my-page__section-title">Travel Stats</p>
              <p className="my-page__section-description">A quick summary of your travel activity across Land-in.</p>
            </div>
            <span className="my-page__year-badge">2026</span>
          </div>
          <div className="my-page__travel-list">
            {travelStats(profileSummary).map((item) => (
              <article key={item.id} className="my-page__travel-item">
                <div
                  className="my-page__travel-icon"
                  style={{ backgroundColor: item.backgroundColor, color: item.color }}
                  aria-hidden="true"
                >
                  {item.emoji}
                </div>
                <div className="my-page__travel-copy">
                  <p className="my-page__travel-label">{item.label}</p>
                  <p className="my-page__travel-description">{item.description}</p>
                </div>
                <div className="my-page__travel-value-wrap">
                  <strong className="my-page__travel-value" style={{ color: item.color }}>
                    {item.value}
                  </strong>
                  {item.unit ? <span className="my-page__travel-unit">{item.unit}</span> : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="my-page__achievement-section">
          <div className="my-page__section-head">
            <div>
              <p className="my-page__section-title">Achievements</p>
              <p className="my-page__section-description">
                {unlockedCount} / {achievements.length} unlocked
              </p>
            </div>
            <div className="my-page__achievement-progress">
              <div className="my-page__achievement-track">
                <div className="my-page__achievement-fill" style={{ width: `${unlockedPercent}%` }} />
              </div>
              <span className="my-page__achievement-percent">{unlockedPercent}%</span>
            </div>
          </div>
          <div className="my-page__achievement-grid">
            {achievements.map((item, index) => (
              <ProfileAchievementCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>

        <section className="my-page__menu-section">
          <div className="my-page__section-head">
            <div>
              <p className="my-page__section-title">Settings</p>
              <p className="my-page__section-description">Review app options, preferences, and account-related items.</p>
            </div>
          </div>
          <ProfileMenuCard items={settingsItems} />
        </section>

        <button type="button" className="my-page__logout" onClick={handleLogout}>
          Log Out
        </button>
        <p className="my-page__footer">land-in v1.0.0</p>
      </main>
    </div>
  );
}
