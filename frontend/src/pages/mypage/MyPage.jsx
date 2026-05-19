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
import { useLanguage } from "../../contexts/useLanguage";
import { disconnectWalletSession, formatWalletAddress, HOODI_CHAIN_ID } from "../../utils/wallet";

function buildTravelStats(profileSummary, t) {
  return [
    {
      id: "landmarks",
      emoji: "LM",
      label: t("mypage.travel.landmarks"),
      description: t("mypage.travel.landmarksDesc"),
      value: profileSummary.landmarkCount ?? 0,
      unit: "",
      color: "#fe6b70",
      backgroundColor: "rgba(254, 107, 112, 0.08)",
    },
    {
      id: "countries",
      emoji: "CT",
      label: t("mypage.travel.countries"),
      description: t("mypage.travel.countriesDesc"),
      value: profileSummary.countryCount ?? 0,
      unit: "",
      color: "#8b5cf6",
      backgroundColor: "rgba(139, 92, 246, 0.08)",
    },
    {
      id: "distance",
      emoji: "KM",
      label: t("mypage.travel.distance"),
      description: t("mypage.travel.distanceDesc"),
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
  const { t } = useLanguage();
  const [profileSummary, setProfileSummary] = useState(defaultProfile);
  const [walletLoading, setWalletLoading] = useState(false);
  const profileInitial = (user?.displayName?.trim() || "L").slice(0, 1).toUpperCase();

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
    const shouldDisconnect = window.confirm(t("mypage.wallet.disconnectConfirm"));

    if (!shouldDisconnect) {
      return;
    }

    setWalletLoading(true);
    try {
      const profile = await walletApi.disconnect();
      updateUserProfile(profile);
      await disconnectWalletSession().catch(() => {});
    } catch (error) {
      window.alert(error.message || t("mypage.wallet.disconnectError"));
    } finally {
      setWalletLoading(false);
    }
  };

  const travelStats = buildTravelStats(profileSummary, t);

  return (
    <div className="page-layout">
      <main className="page-layout__content">
        <section className="my-page__intro">
          <h1 className="page-title">{t("mypage.title")}</h1>
        </section>

        <section className="my-page__profile-card">
          <div className="my-page__profile-accent" />
          <div className="my-page__profile-body">
            <div className="my-page__profile-header">
              <div className="my-page__avatar" aria-hidden="true">
                <span>{profileInitial}</span>
              </div>
              <div className="my-page__identity">
                <div>
                  <p className="my-page__name">{user?.displayName ?? t("mypage.defaultName")}</p>
                  <p className="my-page__handle">{user?.email ?? ""}</p>
                </div>
                <span className="my-page__level">{t("mypage.level")}</span>
              </div>
            </div>
            <div className="my-page__profile-stats">
              <article className="my-page__mini-stat is-coral">
                <p className="my-page__mini-value">{profileSummary.nftCount}</p>
                <p className="my-page__mini-label">{t("mypage.ownedNfts")}</p>
              </article>
              <article className="my-page__mini-stat is-violet">
                <p className="my-page__mini-value">{profileSummary.cityCount}</p>
                <p className="my-page__mini-label">{t("mypage.visitedCities")}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="my-page__wallet-card">
          <div className="my-page__section-head">
            <div>
              <p className="my-page__section-title">{t("mypage.wallet.title")}</p>
              <p className="my-page__section-description">{t("mypage.wallet.description")}</p>
            </div>
            <span className={`my-page__wallet-badge ${user?.walletAddress ? "is-connected" : "is-pending"}`}>
              {user?.walletAddress ? t("mypage.wallet.connected") : t("mypage.wallet.notLinked")}
            </span>
          </div>
          <div className="my-page__wallet-body">
            <div>
              <p className="my-page__wallet-label">{t("mypage.wallet.currentLabel")}</p>
              <strong className="my-page__wallet-value">
                {user?.walletAddress ? formatWalletAddress(user.walletAddress) : t("mypage.wallet.noWallet")}
              </strong>
              <p className="my-page__wallet-meta">
                {user?.walletAddress
                  ? t("mypage.wallet.chainInfo", { chainId: user.walletChainId ?? HOODI_CHAIN_ID })
                  : t("mypage.wallet.skipNotice")}
              </p>
            </div>
            <div className="my-page__wallet-actions">
              <button
                type="button"
                className="my-page__wallet-button"
                onClick={handleWalletConnect}
                disabled={walletLoading}
              >
                {user?.walletAddress ? t("mypage.wallet.reconnect") : t("mypage.wallet.connect")}
              </button>
              {user?.walletAddress ? (
                <button
                  type="button"
                  className="my-page__wallet-disconnect"
                  onClick={handleWalletDisconnect}
                  disabled={walletLoading}
                >
                  {walletLoading ? t("mypage.wallet.disconnecting") : t("mypage.wallet.disconnect")}
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="my-page__travel-card">
          <div className="my-page__section-head">
            <div>
              <p className="my-page__section-title">{t("mypage.travel.title")}</p>
              <p className="my-page__section-description">{t("mypage.travel.description")}</p>
            </div>
            <span className="my-page__year-badge">2026</span>
          </div>
          <div className="my-page__travel-list">
            {travelStats.map((item) => (
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
              <p className="my-page__section-title">{t("mypage.achievements.title")}</p>
              <p className="my-page__section-description">
                {t("mypage.achievements.unlockedRatio", {
                  unlocked: unlockedCount,
                  total: achievements.length,
                })}
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
              <p className="my-page__section-title">{t("mypage.settings.title")}</p>
              <p className="my-page__section-description">{t("mypage.settings.description")}</p>
            </div>
          </div>
          <ProfileMenuCard items={settingsItems} />
        </section>

        <button type="button" className="my-page__logout" onClick={handleLogout}>
          {t("mypage.logout")}
        </button>
        <p className="my-page__footer">{t("mypage.version")}</p>
      </main>
    </div>
  );
}
