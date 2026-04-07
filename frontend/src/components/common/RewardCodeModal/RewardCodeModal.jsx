import "./RewardCodeModal.css";

export default function RewardCodeModal({ reward, onClose }) {
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="reward-code-modal" onClick={handleBackdropClick}>
      <div className="reward-code-modal__sheet">
        <button type="button" className="reward-code-modal__close" onClick={onClose}>
          닫기
        </button>

        <div className="reward-code-modal__header">
          <span className="reward-code-modal__emoji" aria-hidden="true">
            {reward.emoji}
          </span>
          <div>
            <p className="reward-code-modal__title">{reward.title}</p>
            <p className="reward-code-modal__description">{reward.description}</p>
          </div>
        </div>

        <div className="reward-code-modal__qr-box" aria-hidden="true">
          <div className="reward-code-modal__qr-grid" />
        </div>

        <div className="reward-code-modal__code-box">
          <p className="reward-code-modal__code-label">쿠폰 코드</p>
          <p className="reward-code-modal__code-value">{reward.couponCode}</p>
        </div>

        <div className="reward-code-modal__info">
          <p>
            <strong>제휴처</strong>
            <span>{reward.partner}</span>
          </p>
          <p>
            <strong>사용 방법</strong>
            <span>{reward.howToUse}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
