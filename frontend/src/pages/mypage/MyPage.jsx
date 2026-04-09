import "./MyPage.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../../api/dashboard";
import ProfileAchievementCard from "../../components/common/ProfileAchievementCard/ProfileAchievementCard";
import ProfileMenuCard from "../../components/common/ProfileMenuCard/ProfileMenuCard";
import { getAchievementItems, settingsItems } from "../../data/profile";
import { useAuth } from "../../contexts/useAuth";

function travelStats(profileSummary) {
  console.log("travelStats input =", profileSummary); // 디버깅
  return [
    { 
      id: "landmarks", 
      emoji: "📍", 
      label: "방문한 랜드마크", 
      description: "총 NFC 태그 인증 횟수", 
      value: profileSummary.landmarkCount || 0, 
      unit: "곳", 
      color: "#fe6b70", 
      backgroundColor: "rgba(254, 107, 112, 0.08)" 
    },
    { 
      id: "countries", 
      emoji: "🌍", 
      label: "여행한 국가", 
      description: "컬렉션 참여 기준", 
      value: profileSummary.countryCount || 0, 
      unit: "개국", 
      color: "#8b5cf6", 
      backgroundColor: "rgba(139, 92, 246, 0.08)" 
    },
    { 
      id: "distance", 
      emoji: "🧭", 
      label: "총 이동 거리", 
      description: "여행 기록 기반 추정", 
      value: profileSummary.totalDistanceLabel || "— km", 
      unit: "", 
      color: "#06b6d4", 
      backgroundColor: "rgba(6, 182, 212, 0.08)" 
    },
  ];
}

const defaultProfile = { 
  nftCount: 0, 
  cityCount: 0, 
  countryCount: 0, 
  completedCollectionCount: 0, 
  landmarkCount: 0, 
  totalDistanceLabel: '— km' 
};

export default function MyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileSummary, setProfileSummary] = useState(defaultProfile);

  useEffect(() => {
  console.log("MyPage useEffect 실행");
  let isCancelled = false;

  dashboardApi
    .stats()
    .then((stats) => {
      if (!isCancelled) {
        console.log("dashboardApi.stats() 결과 =", stats);
        setProfileSummary(stats.data ?? defaultProfile);
      }
    })
    .catch((err) => {
      console.error("dashboard stats error =", err);
    });

  return () => {
    isCancelled = true;
  };
}, []);

  console.log("Rendering... profileSummary =", profileSummary); // 렌더링 직전 값 확인

  const achievements = getAchievementItems(profileSummary);
  const unlockedCount = achievements.filter((a) => a.state === "unlocked").length;
  const unlockedPercent = achievements.length ? Math.round((unlockedCount / achievements.length) * 100) : 0;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="page-layout">
      <main className="page-layout__content">
        <section className="my-page__intro"><h1 className="page-title">마이페이지</h1></section>

        <section className="my-page__profile-card">
          <div className="my-page__profile-accent" />
          <div className="my-page__profile-body">
            <div className="my-page__profile-header">
              <div className="my-page__avatar" aria-hidden="true">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="avatar" /> : <span>🧑</span>}
              </div>
              <div className="my-page__identity">
                <div>
                  <p className="my-page__name">{user?.displayName ?? ''} 님</p>
                  <p className="my-page__handle">{user?.email ?? ''}</p>
                </div>
                <span className="my-page__level">City Explorer</span>
              </div>
            </div>
            <div className="my-page__profile-stats">
              <article className="my-page__mini-stat is-coral">
                <p className="my-page__mini-value">{profileSummary.nftCount || 0}</p>
                <p className="my-page__mini-label">보유 NFT</p>
              </article>
              <article className="my-page__mini-stat is-violet">
                <p className="my-page__mini-value">{profileSummary.cityCount || 0}</p>
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
                <div className="my-page__travel-icon" style={{ backgroundColor: item.backgroundColor, color: item.color }} aria-hidden="true">{item.emoji}</div>
                <div className="my-page__travel-copy">
                  <p className="my-page__travel-label">{item.label}</p>
                  <p className="my-page__travel-description">{item.description}</p>
                </div>
                <div className="my-page__travel-value-wrap">
                  <strong className="my-page__travel-value" style={{ color: item.color }}>{item.value}</strong>
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
              <p className="my-page__section-description">{unlockedCount} / {achievements.length} 달성</p>
            </div>
            <div className="my-page__achievement-progress">
              <div className="my-page__achievement-track">
                <div className="my-page__achievement-fill" style={{ width: `${unlockedPercent}%` }} />
              </div>
              <span className="my-page__achievement-percent">{unlockedPercent}%</span>
            </div>
          </div>
          <div className="my-page__achievement-grid">
            {achievements.map((item, i) => <ProfileAchievementCard key={item.id} item={item} index={i} />)}
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

        <button type="button" className="my-page__logout" onClick={handleLogout}>로그아웃</button>
        <p className="my-page__footer">land-in v1.0.0</p>
      </main>
    </div>
  );
}