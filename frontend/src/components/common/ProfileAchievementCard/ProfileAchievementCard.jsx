import "./ProfileAchievementCard.css";
import { useLanguage } from "../../../contexts/useLanguage";

export default function ProfileAchievementCard({ item, index = 0 }) {
  const { t } = useLanguage();
  const isUnlocked = item.state === "unlocked";
  const isProgress = item.state === "progress";
  const isLocked = item.state === "locked";
  const progressPercent = item.progress
    ? Math.round((item.progress.current / item.progress.total) * 100)
    : 0;

  const stateLabel = isUnlocked
    ? t("achievement.unlocked")
    : isProgress
      ? t("achievement.progress")
      : t("achievement.locked");

  return (
    <article
      className={[
        "profile-achievement-card",
        isUnlocked ? "is-unlocked" : "",
        isProgress ? "is-progress" : "",
        isLocked ? "is-locked" : "",
      ]
        .join(" ")
        .trim()}
      style={{
        animationDelay: `${index * 50}ms`,
        "--achievement-color": item.color,
        "--achievement-bg": item.backgroundColor,
      }}
    >
      <div className="profile-achievement-card__header">
        <span className="profile-achievement-card__emoji">{item.emoji}</span>
        <span className="profile-achievement-card__state">{stateLabel}</span>
      </div>

      <p className="profile-achievement-card__title">{item.title}</p>
      <p className="profile-achievement-card__description">{item.description}</p>

      {item.progress && !isUnlocked && (
        <div className="profile-achievement-card__progress">
          <p className="profile-achievement-card__progress-label">
            {item.progress.current} / {item.progress.total} {item.progress.label}
          </p>
          <div className="profile-achievement-card__progress-track">
            <div
              className="profile-achievement-card__progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </article>
  );
}
