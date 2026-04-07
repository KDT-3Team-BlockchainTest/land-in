import "./MyProgressPage.css";
import { Link } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import NftTipCard from "../../components/common/NftTipCard/NftTipCard";
import RouteMapTeaser from "../../components/common/RouteMapTeaser/RouteMapTeaser";
import StatSummaryGrid from "../../components/common/StatSummaryGrid/StatSummaryGrid";
import TagCampaignCard from "../../components/common/TagCampaignCard/TagCampaignCard";
import { getTagDashboard } from "../../data/dashboard";
import useJoinedEventIds from "../../hooks/useJoinedEventIds";

export default function MyProgressPage() {
  const { joinedEventIds } = useJoinedEventIds();
  const dashboard = getTagDashboard(joinedEventIds);
  const hasEvents = dashboard.activeCollections.length > 0;
  const primaryEventLink = dashboard.activeCollections[0]
    ? `/event/${dashboard.activeCollections[0].id}`
    : "/collection";

  const stats = [
    {
      label: "수집한 NFT",
      value: dashboard.totalNfts,
      color: "#fe6b70",
      backgroundColor: "rgba(254, 107, 112, 0.08)",
      icon: "✨",
    },
    {
      label: "참여 도시",
      value: dashboard.joinedCities,
      color: "#8b5cf6",
      backgroundColor: "rgba(139, 92, 246, 0.08)",
      icon: "📍",
    },
    {
      label: "진행 중 이벤트",
      value: dashboard.activeEventsCount,
      color: "#22c55e",
      backgroundColor: "rgba(34, 197, 94, 0.08)",
      icon: "🗺",
    },
  ];

  return (
    <div className="page-layout">
      <main className="page-layout__content">
        <section className="my-progress-page__intro">
          <h1 className="page-title my-progress-page__title">내 진행 현황</h1>
          <p className="page-subtitle">
            참여 중인 컬렉션의 루트와 NFT 진행 상태를 한 번에 확인해보세요.
          </p>
        </section>

        <StatSummaryGrid items={stats} />

        <RouteMapTeaser
          to={primaryEventLink}
          title="주요 루트 확인"
          description="지금 진행 중인 컬렉션의 다음 목적지와 수집 현황을 빠르게 살펴볼 수 있어요."
          actionLabel="자세히 보기"
        />

        {hasEvents ? (
          <>
            <section className="my-progress-page__section">
              <p className="my-progress-page__section-title">이벤트 상세 루트</p>
              <p className="my-progress-page__section-description">
                순서대로 방문하고 NFC 태그를 인증해 컬렉션을 완성해보세요.
              </p>
            </section>

            <div className="my-progress-page__campaign-list">
              {dashboard.activeCollections.map((collection) => (
                <TagCampaignCard key={collection.id} collection={collection} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon="🧭"
            title="아직 진행 중인 이벤트가 없어요"
            description="홈에서 마음에 드는 이벤트를 선택하고 첫 번째 NFT 수집을 시작해보세요."
          >
            <Link to="/" className="my-progress-page__empty-link">이벤트 둘러보기</Link>
          </EmptyState>
        )}

        <NftTipCard />
      </main>
    </div>
  );
}
