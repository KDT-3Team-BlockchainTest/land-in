import "./RewardCodeModal.css";
import { useLanguage } from "../../../i18n/LanguageContext";

export default function RewardCodeModal({ reward, onClose }) {
  const { t } = useLanguage();
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="reward-code-modal" onClick={handleBackdropClick}>
      <div className="reward-code-modal__sheet">
        <button type="button" className="reward-code-modal__close" onClick={onClose}>
          {t("reward.modal.close")}
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
          <p className="reward-code-modal__code-label">{t("reward.modal.coupon_code")}</p>
          <p className="reward-code-modal__code-value">{reward.couponCode}</p>
        </div>

        <div className="reward-code-modal__info">
          <p>
            <strong>{t("reward.modal.partner")}</strong>
            <span>{reward.partner}</span>
          </p>
          <p>
            <strong>{t("reward.modal.how_to_use")}</strong>
            <span>{reward.howToUse}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
