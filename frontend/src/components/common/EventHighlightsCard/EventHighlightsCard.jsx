import "./EventHighlightsCard.css";
import sparklesIcon from "../../../assets/icon/icon_sparkles_y.png";
import IconImage from "../IconImage/IconImage";
import { useLanguage } from "../../../i18n/LanguageContext";

export default function EventHighlightsCard({ highlights }) {
  const { t } = useLanguage();
  return (
    <section className="event-highlights-card">
      <div className="event-highlights-card__header">
        <IconImage src={sparklesIcon} size={16} />
        <h2 className="event-highlights-card__title">{t("event.highlights.title")}</h2>
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
