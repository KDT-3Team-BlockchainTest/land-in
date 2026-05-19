import "./MyPage.css";
import ProfileMenuCard from "../../components/common/ProfileMenuCard/ProfileMenuCard";
import { useAuth } from "../../contexts/useAuth";
import { getProfileSummary } from "../../data/dashboard";
import { getSettingsItems } from "../../data/profile";
import useJoinedEventIds from "../../hooks/useJoinedEventIds";
import { useLanguage } from "../../i18n/LanguageContext";

export default function MyPage() {
  const { user } = useAuth();
  const { joinedEventIds } = useJoinedEventIds();
  const profileSummary = getProfileSummary(joinedEventIds);
  const { t } = useLanguage();
  const displayName = user?.displayName || user?.email || t("home.default_name");

  return (
    <div className="page-layout">
      <main className="page-layout__content">
        <section className="my-page__intro">
          <h1 className="page-title">{t("mypage.title")}</h1>
        </section>

        {/* 프로필 카드 */}
        <section className="my-page__profile-card">
          <div className="my-page__profile-header">
            <div className="my-page__avatar" aria-hidden="true">
              <span>🧑</span>
            </div>
            <div className="my-page__identity">
              <p className="my-page__name">{displayName} 님</p>
              <p className="my-page__handle">{user?.email ?? ""}</p>
              <span className="my-page__level">City Explorer</span>
            </div>
          </div>

          <div className="my-page__profile-stats">
            <article className="my-page__mini-stat">
              <p className="my-page__mini-value">{profileSummary.nftCount}</p>
              <p className="my-page__mini-label">보유 NFT</p>
            </article>
            <article className="my-page__mini-stat">
              <p className="my-page__mini-value">{profileSummary.cityCount}</p>
              <p className="my-page__mini-label">참여 도시</p>
            </article>
            <article className="my-page__mini-stat">
              <p className="my-page__mini-value">{profileSummary.landmarkCount}</p>
              <p className="my-page__mini-label">랜드마크</p>
            </article>
            <article className="my-page__mini-stat">
              <p className="my-page__mini-value">{profileSummary.countryCount}</p>
              <p className="my-page__mini-label">여행 국가</p>
            </article>
          </div>
        </section>

        {/* 지갑 연결 - UI만 표시, 기능은 API 연결 후 활성화 */}
        <section className="my-page__wallet-card">
          <div className="my-page__section-head">
            <div>
              <p className="my-page__section-title">{t("mypage.wallet.title")}</p>
              <p className="my-page__section-description">{t("mypage.wallet.desc")}</p>
            </div>
            <span className="my-page__wallet-badge is-pending">{t("mypage.wallet.badge.pending")}</span>
          </div>
          <div className="my-page__wallet-body">
            <div>
              <p className="my-page__wallet-label">{t("mypage.wallet.current")}</p>
              <strong className="my-page__wallet-value">{t("mypage.wallet.none")}</strong>
              <p className="my-page__wallet-meta">{t("mypage.wallet.meta_pending")}</p>
            </div>
            <div className="my-page__wallet-actions">
              <button type="button" className="my-page__wallet-button">
                {t("mypage.wallet.connect")}
              </button>
            </div>
          </div>
        </section>

        {/* 여행 통계 - 추후 활성화 */}
        {/* <section className="my-page__travel-card">
          ...
        </section> */}

        {/* 업적 - 추후 활성화 */}
        {/* <section className="my-page__achievement-section">
          ...
        </section> */}

        {/* 설정 */}
        <section className="my-page__menu-section">
          <div className="my-page__section-head">
            <div>
              <p className="my-page__section-title">{t("mypage.settings.title")}</p>
              <p className="my-page__section-description">{t("mypage.settings.desc")}</p>
            </div>
          </div>
          <ProfileMenuCard items={getSettingsItems(t)} />
        </section>

        <button type="button" className="my-page__logout">
          {t("mypage.logout")}
        </button>

        <p className="my-page__footer">{t("mypage.footer")}</p>
      </main>
    </div>
  );
}