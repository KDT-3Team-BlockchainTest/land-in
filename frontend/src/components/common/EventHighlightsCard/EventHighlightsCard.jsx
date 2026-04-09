import "./EventHighlightsCard.css";
import sparklesIcon from "../../../assets/icon/icon_sparkles_y.png";
import IconImage from "../IconImage/IconImage";

export default function EventHighlightsCard({ highlights }) {
  return (
    <section className="event-highlights-card">
      <div className="event-highlights-card__header">
        <IconImage src={sparklesIcon} size={16} />
        <h2 className="event-highlights-card__title">이벤트 하이라이트</h2>
      </div>

      <div className="event-highlights-card__chips">
        {highlights.map((highlight) => (
          <span key={highlight} className="event-highlights-card__chip">
            ✨ {highlight}
          </span>
        ))}
      </div>
    </section>
  );
}
