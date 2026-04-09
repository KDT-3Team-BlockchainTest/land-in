import "./RewardsPage.css";
import { useEffect, useMemo, useState } from "react";
import { adaptReward } from "../../api/adapters";
import { rewardsApi } from "../../api/rewards";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import RewardCodeModal from "../../components/common/RewardCodeModal/RewardCodeModal";
import RewardCouponCard from "../../components/common/RewardCouponCard/RewardCouponCard";
import StatSummaryGrid from "../../components/common/StatSummaryGrid/StatSummaryGrid";

const rewardFilters = [
  { id: "available", label: "사용 가능" },
  { id: "used", label: "사용 완료" },
  { id: "expired", label: "만료" },
];

export default function RewardsPage() {
  const [activeFilter, setActiveFilter] = useState("available");
  const [selectedReward, setSelectedReward] = useState(null);
  const [rawRewards, setRawRewards] = useState([]);

  useEffect(() => {
    rewardsApi.list().then((list) => setRawRewards(list ?? [])).catch(() => {});
  }, []);

  const rewards = rawRewards.map(adaptReward);
  const filteredRewards = useMemo(
    () => rewards.filter((r) => r.status === activeFilter),
    [rewards, activeFilter],
  );

  const stats = [
    { label: "사용 가능", value: rewards.filter((r) => r.status === "available").length, color: "#fe6b70", backgroundColor: "rgba(254, 107, 112, 0.08)", icon: "🎁" },
    { label: "사용 완료", value: rewards.filter((r) => r.status === "used").length, color: "#22c55e", backgroundColor: "rgba(34, 197, 94, 0.08)", icon: "✅" },
    { label: "만료", value: rewards.filter((r) => r.status === "expired").length, color: "#9ca3af", backgroundColor: "#f3f4f6", icon: "⏰" },
  ];

  const handleUseReward = async (reward) => {
    try {
      await rewardsApi.use(reward.id);
      setRawRewards((prev) => prev.map((r) => r.id === reward.id ? { ...r, status: 'USED' } : r));
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div className="page-layout">
        <main className="page-layout__content">
          <section className="rewards-page__intro">
            <h1 className="page-title rewards-page__title">내 리워드</h1>
            <p className="page-subtitle">컬렉션 완성으로 받은 혜택과 배지를 한곳에서 확인하고 사용할 수 있어요.</p>
          </section>

          <StatSummaryGrid items={stats} />

          <section className="rewards-page__filters" aria-label="리워드 필터">
            {rewardFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={["rewards-page__filter", filter.id === activeFilter ? "is-active" : ""].join(" ")}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </section>

          {filteredRewards.length === 0 ? (
            <EmptyState icon="🎫" title="표시할 리워드가 없어요" description="다른 탭을 확인하거나 컬렉션을 완성해 새로운 보상을 받아보세요." />
          ) : (
            <div className="rewards-page__list">
              {filteredRewards.map((reward, i) => (
                <RewardCouponCard key={reward.id} reward={reward} index={i} onShowCode={setSelectedReward} />
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedReward && (
        <RewardCodeModal
          reward={selectedReward}
          onClose={() => setSelectedReward(null)}
          onUse={() => handleUseReward(selectedReward)}
        />
      )}
    </>
  );
}
