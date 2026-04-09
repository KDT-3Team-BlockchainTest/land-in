import "./NftTipCard.css";

export default function NftTipCard() {
  return (
    <section className="nft-tip-card">
      <div className="nft-tip-card__icon" aria-hidden="true">
        ✨
      </div>
      <div className="nft-tip-card__body">
        <p className="nft-tip-card__title">NFT 수집 팁</p>
        <p className="nft-tip-card__description">
          랜드마크 현장에서 NFC를 인증하면 즉시 NFT가 발행돼요. 컬렉션을 완성하면 리워드도
          함께 열립니다.
        </p>
        <div className="nft-tip-card__chips">
          {["현장 NFC 인증", "즉시 NFT 발행", "리워드 자동 해제"].map((chip) => (
            <span key={chip} className="nft-tip-card__chip">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
