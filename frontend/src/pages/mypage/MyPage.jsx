import "./MyPage.css";
import ProfileAchievementCard from "../../components/common/ProfileAchievementCard/ProfileAchievementCard";
import ProfileMenuCard from "../../components/common/ProfileMenuCard/ProfileMenuCard";
import { getProfileSummary } from "../../data/dashboard";
import { getAchievementItems, settingsItems } from "../../data/profile";
import useJoinedEventIds from "../../hooks/useJoinedEventIds";

function travelStats(profileSummary) {
  return [
    {
      id: "landmarks",
      emoji: "📍",
      label: "방문한 랜드마크",
      description: "총 NFC 태그 인증 횟수",
      value: profileSummary.landmarkCount,
      unit: "곳",
      color: "#fe6b70",
      backgroundColor: "rgba(254, 107, 112, 0.08)",
    },
    {
      id: "countries",
      emoji: "🌍",
      label: "여행한 국가",
      description: "컬렉션 참여 기준",
      value: profileSummary.countryCount,
      unit: "개국",
      color: "#8b5cf6",
      backgroundColor: "rgba(139, 92, 246, 0.08)",
    },
    {
      id: "distance",
      emoji: "🧭",
      label: "총 이동 거리",
      description: "여행 기록 기반 추정",
      value: profileSummary.totalDistanceLabel,
      unit: "",
      color: "#06b6d4",
      backgroundColor: "rgba(6, 182, 212, 0.08)",
    },
  ];
}

export default function MyPage() {
  const { joinedEventIds } = useJoinedEventIds();
  const profileSummary = getProfileSummary(joinedEventIds);
  const achievements = getAchievementItems(profileSummary);
  const unlockedCount = achievements.filter((item) => item.state === "unlocked").length;
  const unlockedPercent = achievements.length
    ? Math.round((unlockedCount / achievements.length) * 100)
    : 0;

  return (
    <div className="page-layout">
      <main className="page-layout__content">
        <section className="my-page__intro">
          <h1 className="page-title">마이페이지</h1>
        </section>

        <section className="my-page__profile-card">
          <div className="my-page__profile-accent" />

          <div className="my-page__profile-body">
            <div className="my-page__profile-header">
              <div className="my-page__avatar" aria-hidden="true">
                <span>🧑</span>
              </div>

              <div className="my-page__identity">
                <div>
                  <p className="my-page__name">지현 님</p>
                  <p className="my-page__handle">@jihyeon_travels</p>
                </div>
                <span className="my-page__level">City Explorer</span>
              </div>
            </div>

            <div className="my-page__profile-stats">
              <article className="my-page__mini-stat is-coral">
                <p className="my-page__mini-value">{profileSummary.nftCount}</p>
                <p className="my-page__mini-label">보유 NFT</p>
              </article>
              <article className="my-page__mini-stat is-violet">
                <p className="my-page__mini-value">{profileSummary.cityCount}</p>
                <p className="my-page__mini-label">참여 도시</p>
              </article>
            </div>
          </div>
        </section>

        <section className="my-page__travel-card">
          <div className="my-page__section-head">
            <div>
              <p className="my-page__section-title">여행 통계</p>
              <p className="my-page__section-description">컬렉션 참여 기준으로 정리한 내 여행 기록</p>
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
              <p className="my-page__section-title">업적</p>
              <p className="my-page__section-description">
                {unlockedCount} / {achievements.length} 달성
              </p>
            </div>
            <div className="my-page__achievement-progress">
              <div className="my-page__achievement-track">
                <div
                  className="my-page__achievement-fill"
                  style={{ width: `${unlockedPercent}%` }}
                />
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
              <p className="my-page__section-title">설정</p>
              <p className="my-page__section-description">알림, 언어, 보안 설정을 확인해보세요.</p>
            </div>
          </div>
          <ProfileMenuCard items={settingsItems} />
        </section>

        <button type="button" className="my-page__logout">
          로그아웃
        </button>

        <p className="my-page__footer">land-in v1.0.0</p>
      </main>
    </div>
  );
}
