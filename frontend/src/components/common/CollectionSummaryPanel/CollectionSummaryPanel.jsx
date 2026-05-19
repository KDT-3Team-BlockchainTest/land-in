import "./CollectionSummaryPanel.css";
import { useLanguage } from "../../../i18n/LanguageContext";

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
    <section className="collection-summary-panel" aria-label={t("collection.title")}>
      <SummaryStat label={t("collection.summary.ongoing")} value={ongoingCount} tone="ongoing" />
      <SummaryStat label={t("collection.summary.completed")} value={completedCount} tone="completed" />
      <SummaryStat label={t("collection.summary.nft")} value={nftCount} tone="nft" />
    </section>
  );
}
