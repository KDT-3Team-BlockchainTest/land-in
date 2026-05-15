import "./CollectionSummaryPanel.css";
import { useLanguage } from "../../../contexts/useLanguage";

const summaryThemes = {
  ongoing: "collection-summary-panel__stat--ongoing",
  completed: "collection-summary-panel__stat--completed",
  nft: "collection-summary-panel__stat--nft",
};

function SummaryStat({ label, value, tone }) {
  return (
    <article className={["collection-summary-panel__stat", summaryThemes[tone]].join(" ")}>
      <strong className="collection-summary-panel__value">{value}</strong>
      <span className="collection-summary-panel__label">{label}</span>
    </article>
  );
}

export default function CollectionSummaryPanel({ ongoingCount, completedCount, nftCount }) {
  const { t } = useLanguage();
  return (
    <section className="collection-summary-panel" aria-label={t("event.summaryLabel")}>
      <SummaryStat label={t("event.summaryOngoing")} value={ongoingCount} tone="ongoing" />
      <SummaryStat label={t("event.summaryCompleted")} value={completedCount} tone="completed" />
      <SummaryStat label={t("event.summaryNfts")} value={nftCount} tone="nft" />
    </section>
  );
}
