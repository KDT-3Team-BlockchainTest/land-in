import "./RewardCouponCard.css";
import { useLanguage } from "../../../contexts/useLanguage";

function getStatusClassName(status) {
  if (status === "used") return "reward-coupon-card--used";
  if (status === "expired") return "reward-coupon-card--expired";
  return "reward-coupon-card--available";
}

export default function RewardCouponCard({ reward, index = 0, onShowCode }) {
  const { t } = useLanguage();
  const statusClassName = getStatusClassName(reward.status);
  const isAvailable = reward.status === "available";

  const statusLabel =
    reward.status === "used"
      ? t("reward.statusUsed")
      : reward.status === "expired"
        ? t("reward.statusExpired")
        : t("reward.statusAvailable");

  const dateLabel =
    reward.status === "available"
      ? t("reward.validUntil")
      : reward.status === "used"
        ? t("reward.usedOn")
        : t("reward.expiredOn");

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
            <p className="reward-coupon-card__meta-label">{t("reward.couponLabel")}</p>
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
            <p className="reward-coupon-card__partner-label">{t("reward.partnerLabel")}</p>
            <p className="reward-coupon-card__partner-value">{reward.partner}</p>
          </div>

          {isAvailable ? (
            <button
              type="button"
              className="reward-coupon-card__action"
              onClick={() => onShowCode(reward)}
            >
              {t("reward.qrView")}
            </button>
          ) : (
            <span className="reward-coupon-card__passive-action">
              {reward.status === "used" ? t("reward.usedShort") : t("reward.endedShort")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
