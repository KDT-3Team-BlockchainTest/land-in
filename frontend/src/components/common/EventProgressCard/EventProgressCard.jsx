import "./EventProgressCard.css";
import ProgressBar from "../ProgressBar/ProgressBar";
import { useLanguage } from "../../../i18n/LanguageContext";

export default function EventProgressCard({ collected, total }) {
  const { t } = useLanguage();
  const progressPercent = total > 0 ? Math.round((collected / total) * 100) : 0;
  const remainingCount = Math.max(total - collected, 0);

  return (
    <section className="event-progress-card">
      <div className="event-progress-card__header">
        <h2 className="event-progress-card__title">{t("event.progress.title")}</h2>
        <span className="event-progress-card__percent">{progressPercent}%</span>
      </div>

      <ProgressBar value={collected} max={total} className="event-progress-card__track" />

      <div className="event-progress-card__footer">
        <span>{t("event.progress.landmarks", { collected, total })}</span>
        <span>{t("event.progress.remaining", { count: remainingCount })}</span>
      </div>
    </section>
  );
}
