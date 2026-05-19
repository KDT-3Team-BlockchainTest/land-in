import "./RewardCouponCard.css";
import { useLanguage } from "../../../i18n/LanguageContext";

function getStatusClassName(status) {
  if (status === "used") {
    return "reward-coupon-card--used";
  }

  if (status === "expired") {
    return "reward-coupon-card--expired";
  }

  return "reward-coupon-card--available";
}

export default function RewardCouponCard({ reward, index = 0, onShowCode }) {
  const { t } = useLanguage();
  const statusClassName = getStatusClassName(reward.status);
  const isAvailable = reward.status === "available";

  const statusLabel = reward.status === "used"
    ? t("reward.status.used")
    : reward.status === "expired"
      ? t("reward.status.expired")
      : t("reward.status.available");

  const dateLabel = reward.status === "available"
    ? t("reward.valid_until")
    : reward.status === "used"
      ? t("reward.used_date")
      : t("reward.expired_date");

  return (
    <article
      className={["reward-coupon-card", statusClassName].join(" ")}
      style={{ animationDelay: `${index * 60}ms`, "--reward-accent": reward.accentColor }}
    >
      <div className="reward-coupon-card__stripe" />

      <div className="reward-coupon-card__body">
        <div className="reward-coupon-card__header">
          <div className="reward-coupon-card__emoji">{reward.emoji}</div>

          <div className="reward-coupon-card__title-wrap">
            <div className="reward-coupon-card__title-row">
              <p className="reward-coupon-card__title">{reward.title}</p>
              <span className="reward-coupon-card__status">{statusLabel}</span>
            </div>
            <p className="reward-coupon-card__collection">{reward.collectionName}</p>
          </div>
        </div>

        <p className="reward-coupon-card__description">{reward.description}</p>

        <div className="reward-coupon-card__meta">
          <div>
            <p className="reward-coupon-card__meta-label">{t("reward.coupon_code")}</p>
            <p className="reward-coupon-card__meta-value">{reward.couponCode}</p>
          </div>
          <div>
            <p className="reward-coupon-card__meta-label">{dateLabel}</p>
            <p className="reward-coupon-card__meta-value">
              {reward.status === "available" ? reward.validUntil : reward.usedDate}
            </p>
          </div>
        </div>

        <div className="reward-coupon-card__footer">
          <div>
            <p className="reward-coupon-card__partner-label">{t("reward.partner")}</p>
            <p className="reward-coupon-card__partner-value">{reward.partner}</p>
          </div>

          {isAvailable ? (
            <button
              type="button"
              className="reward-coupon-card__action"
              onClick={() => onShowCode(reward)}
            >
              {t("reward.view_qr")}
            </button>
          ) : (
            <span className="reward-coupon-card__passive-action">
              {reward.status === "used" ? t("reward.used_passive") : t("reward.ended_passive")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
