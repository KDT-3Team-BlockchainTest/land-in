import "./RewardsPage.css";
import { useEffect, useMemo, useState } from "react";
import { adaptReward } from "../../api/adapters";
import { rewardsApi } from "../../api/rewards";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import RewardCodeModal from "../../components/common/RewardCodeModal/RewardCodeModal";
import RewardCouponCard from "../../components/common/RewardCouponCard/RewardCouponCard";
import StatSummaryGrid from "../../components/common/StatSummaryGrid/StatSummaryGrid";
import { useLanguage } from "../../contexts/useLanguage";

const FILTER_IDS = ["available", "used", "expired"];

export default function RewardsPage() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState("available");
  const [selectedReward, setSelectedReward] = useState(null);
  const [rawRewards, setRawRewards] = useState([]);

  useEffect(() => {
    rewardsApi.list().then((list) => setRawRewards(list ?? [])).catch(() => {});
  }, []);

  const rewardFilters = useMemo(
    () => FILTER_IDS.map((id) => ({ id, label: t(`rewards.filters.${id}`) })),
    [t],
  );

  const rewards = rawRewards.map(adaptReward);
  const filteredRewards = useMemo(
    () => rewards.filter((r) => r.status === activeFilter),
    [rewards, activeFilter],
  );

  const stats = [
    { label: t("reward.summaryAvailable"), value: rewards.filter((r) => r.status === "available").length, color: "#fe6b70", backgroundColor: "rgba(254, 107, 112, 0.08)", icon: "🎁" },
    { label: t("reward.summaryUsed"), value: rewards.filter((r) => r.status === "used").length, color: "#22c55e", backgroundColor: "rgba(34, 197, 94, 0.08)", icon: "✅" },
    { label: t("reward.summaryExpired"), value: rewards.filter((r) => r.status === "expired").length, color: "#9ca3af", backgroundColor: "#f3f4f6", icon: "⏰" },
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
            <h1 className="page-title rewards-page__title">{t("rewards.title")}</h1>
            <p className="page-subtitle">{t("rewards.subtitle")}</p>
          </section>

          <StatSummaryGrid items={stats} />

          <section className="rewards-page__filters" aria-label={t("rewards.filterTabsLabel")}>
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
            <EmptyState
              icon="🎫"
              title={t("rewards.emptyTitle")}
              description={t("rewards.emptyDescription")}
            />
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
