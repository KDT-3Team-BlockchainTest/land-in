import "./NftGalleryTokenCard.css";
import PlaceImage from "../PlaceImage/PlaceImage";

function getMintStatusLabel(status) {
  switch (status) {
    case "MINTED_ONCHAIN":
      return "On-chain";
    case "PENDING_WALLET":
      return "Wallet needed";
    case "PENDING_ONCHAIN":
      return "Pending";
    case "FAILED_ONCHAIN":
      return "Retry";
    default:
      return "Off-chain";
  }
}

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
            ?뵏
          </span>
          <span className="nft-gallery-token-card__locked-label">Locked</span>
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
        <span className={`nft-gallery-token-card__status is-${(nft.mintStatus || "OFFCHAIN_ONLY").toLowerCase()}`}>
          {getMintStatusLabel(nft.mintStatus)}
        </span>
        <span className="nft-gallery-token-card__token">{nft.serial}</span>
        <span className="nft-gallery-token-card__check" aria-hidden="true">
          ??
        </span>
      </div>

      <div className="nft-gallery-token-card__body">
        <p className="nft-gallery-token-card__title">{nft.name}</p>
        <p className="nft-gallery-token-card__meta">{nft.placeName}</p>
        <p className="nft-gallery-token-card__description">{nft.description}</p>
        {nft.tokenId ? <p className="nft-gallery-token-card__chain-meta">Token #{nft.tokenId}</p> : null}
      </div>
    </article>
  );
}
