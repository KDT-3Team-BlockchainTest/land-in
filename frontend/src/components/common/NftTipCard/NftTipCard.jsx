import "./NftTipCard.css";
import { useLanguage } from "../../../i18n/LanguageContext";

export default function NftTipCard() {
  const { t } = useLanguage();
  const chips = [t("nft_tip.chip1"), t("nft_tip.chip2"), t("nft_tip.chip3")];
  return (
    <section className="nft-tip-card">
      <div className="nft-tip-card__icon" aria-hidden="true">
        ✨
      </div>
      <div className="nft-tip-card__body">
        <p className="nft-tip-card__title">{t("nft_tip.title")}</p>
        <p className="nft-tip-card__description">{t("nft_tip.desc")}</p>
        <div className="nft-tip-card__chips">
          {chips.map((chip) => (
            <span key={chip} className="nft-tip-card__chip">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
