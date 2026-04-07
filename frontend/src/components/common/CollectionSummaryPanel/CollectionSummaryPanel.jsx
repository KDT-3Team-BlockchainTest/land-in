import "./CollectionSummaryPanel.css";

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
  return (
    <section className="collection-summary-panel" aria-label="컬렉션 요약">
      <SummaryStat label="진행 중" value={ongoingCount} tone="ongoing" />
      <SummaryStat label="완성" value={completedCount} tone="completed" />
      <SummaryStat label="보유 NFT" value={nftCount} tone="nft" />
    </section>
  );
}
