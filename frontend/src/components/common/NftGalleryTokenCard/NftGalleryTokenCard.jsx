import "./NftGalleryTokenCard.css";
import PlaceImage from "../PlaceImage/PlaceImage";

export default function NftGalleryTokenCard({
  nft,
  accentColor = "#fe6b70",
  index = 0,
  locked = false,
  fallbackSrc,
}) {
  if (locked) {
    return (
      <article
        className="nft-gallery-token-card nft-gallery-token-card--locked"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="nft-gallery-token-card__locked-visual">
          <span className="nft-gallery-token-card__lock" aria-hidden="true">
            🔒
          </span>
          <span className="nft-gallery-token-card__locked-label">미수집</span>
        </div>

        <div className="nft-gallery-token-card__locked-lines" aria-hidden="true">
          <span />
          <span />
        </div>
      </article>
    );
  }

  return (
    <article
      className="nft-gallery-token-card"
      style={{
        animationDelay: `${index * 50}ms`,
        "--nft-accent": accentColor,
      }}
    >
      <div className="nft-gallery-token-card__image-wrap">
        <PlaceImage
          className="nft-gallery-token-card__image"
          src={nft.image}
          fallbackSrc={fallbackSrc ?? nft.collectionImage}
          alt={nft.name}
        />
        <div className="nft-gallery-token-card__shine" />
        <span className="nft-gallery-token-card__token">{nft.serial}</span>
        <span className="nft-gallery-token-card__check" aria-hidden="true">
          ✓
        </span>
      </div>

      <div className="nft-gallery-token-card__body">
        <p className="nft-gallery-token-card__title">{nft.name}</p>
        <p className="nft-gallery-token-card__meta">{nft.placeName}</p>
        <p className="nft-gallery-token-card__description">{nft.description}</p>
      </div>
    </article>
  );
}
