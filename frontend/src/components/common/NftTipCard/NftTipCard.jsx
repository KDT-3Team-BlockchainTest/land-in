import "./NftTipCard.css";
import { useLanguage } from "../../../contexts/useLanguage";

export default function NftTipCard() {
  const { t } = useLanguage();
  const chips = [t("nftTip.chip1"), t("nftTip.chip2"), t("nftTip.chip3")];

  return (
    <section className="nft-tip-card">
      <div className="nft-tip-card__icon" aria-hidden="true">
        ✨
      </div>
      <div className="nft-tip-card__body">
        <p className="nft-tip-card__title">{t("nftTip.title")}</p>
        <p className="nft-tip-card__description">{t("nftTip.body")}</p>
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
