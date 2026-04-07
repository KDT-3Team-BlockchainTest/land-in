import "./EventProgressCard.css";
import ProgressBar from "../ProgressBar/ProgressBar";

export default function EventProgressCard({ collected, total }) {
  const progressPercent = total > 0 ? Math.round((collected / total) * 100) : 0;
  const remainingCount = Math.max(total - collected, 0);

  return (
    <section className="event-progress-card">
      <div className="event-progress-card__header">
        <h2 className="event-progress-card__title">수집 진행률</h2>
        <span className="event-progress-card__percent">{progressPercent}%</span>
      </div>

      <ProgressBar value={collected} max={total} className="event-progress-card__track" />

      <div className="event-progress-card__footer">
        <span>
          {collected}/{total} 랜드마크 수집
        </span>
        <span>{remainingCount}개 남음</span>
      </div>
    </section>
  );
}
