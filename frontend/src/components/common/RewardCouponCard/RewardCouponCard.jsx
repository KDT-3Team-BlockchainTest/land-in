import "./RewardCouponCard.css";

function getStatusClassName(status) {
  if (status === "used") {
    return "reward-coupon-card--used";
  }

  if (status === "expired") {
    return "reward-coupon-card--expired";
  }

  return "reward-coupon-card--available";
}

function getStatusLabel(status) {
  if (status === "used") {
    return "사용 완료";
  }

  if (status === "expired") {
    return "만료";
  }

  return "사용 가능";
}

export default function RewardCouponCard({ reward, index = 0, onShowCode }) {
  const statusClassName = getStatusClassName(reward.status);
  const isAvailable = reward.status === "available";

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
              <span className="reward-coupon-card__status">{getStatusLabel(reward.status)}</span>
            </div>
            <p className="reward-coupon-card__collection">{reward.collectionName}</p>
          </div>
        </div>

        <p className="reward-coupon-card__description">{reward.description}</p>

        <div className="reward-coupon-card__meta">
          <div>
            <p className="reward-coupon-card__meta-label">쿠폰 코드</p>
            <p className="reward-coupon-card__meta-value">{reward.couponCode}</p>
          </div>
          <div>
            <p className="reward-coupon-card__meta-label">
              {reward.status === "available"
                ? "유효 기간"
                : reward.status === "used"
                  ? "사용일"
                  : "만료일"}
            </p>
            <p className="reward-coupon-card__meta-value">
              {reward.status === "available" ? reward.validUntil : reward.usedDate}
            </p>
          </div>
        </div>

        <div className="reward-coupon-card__footer">
          <div>
            <p className="reward-coupon-card__partner-label">제휴처</p>
            <p className="reward-coupon-card__partner-value">{reward.partner}</p>
          </div>

          {isAvailable ? (
            <button
              type="button"
              className="reward-coupon-card__action"
              onClick={() => onShowCode(reward)}
            >
              QR 보기
            </button>
          ) : (
            <span className="reward-coupon-card__passive-action">
              {reward.status === "used" ? "사용됨" : "종료됨"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
