import "./MoreEventsCard.css";

export default function MoreEventsCard() {
  return (
    <aside className="more-events-card" aria-label="더 많은 이벤트">
      <div className="more-events-card__icon" aria-hidden="true">
        🌐
      </div>
      <p className="more-events-card__text">더 많은 이벤트</p>
    </aside>
  );
}
