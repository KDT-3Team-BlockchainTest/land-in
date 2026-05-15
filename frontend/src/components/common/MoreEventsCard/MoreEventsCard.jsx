import "./MoreEventsCard.css";
import { useLanguage } from "../../../contexts/useLanguage";

export default function MoreEventsCard() {
  const { t } = useLanguage();
  const label = t("event.moreEvents");
  return (
    <aside className="more-events-card" aria-label={label}>
      <div className="more-events-card__icon" aria-hidden="true">
        🌐
      </div>
      <p className="more-events-card__text">{label}</p>
    </aside>
  );
}
