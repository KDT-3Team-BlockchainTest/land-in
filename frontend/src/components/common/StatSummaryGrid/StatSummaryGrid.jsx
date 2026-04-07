import "./StatSummaryGrid.css";

function StatCard({ item }) {
  return (
    <article className="stat-summary-grid__card" style={{ "--card-bg": item.backgroundColor }}>
      <div className="stat-summary-grid__value-row">
        {item.icon && <span className="stat-summary-grid__icon">{item.icon}</span>}
        <strong className="stat-summary-grid__value" style={{ color: item.color }}>
          {item.value}
        </strong>
      </div>
      <p className="stat-summary-grid__label">{item.label}</p>
    </article>
  );
}

export default function StatSummaryGrid({ items }) {
  return (
    <section className="stat-summary-grid" aria-label="요약 통계">
      {items.map((item) => (
        <StatCard key={item.label} item={item} />
      ))}
    </section>
  );
}
