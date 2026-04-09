import "./CollectionNftCard.css";
import { Link } from "react-router-dom";
import PlaceImage from "../PlaceImage/PlaceImage";

export default function CollectionNftCard({ nft, index = 0 }) {
  return (
    <Link
      to={`/nft-gallery/${nft.collectionId}`}
      className="collection-nft-card"
      aria-label={`${nft.name} NFT 갤러리로 이동`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="collection-nft-card__image-wrap">
        <PlaceImage
          className="collection-nft-card__image"
          src={nft.image}
          fallbackSrc={nft.collectionImage}
          alt={nft.name}
        />
        <div className="collection-nft-card__shine" />
        <span className="collection-nft-card__token">{nft.serial}</span>
        <span className="collection-nft-card__check" aria-hidden="true">
          ✓
        </span>
      </div>

      <div className="collection-nft-card__body">
        <p className="collection-nft-card__title">{nft.name}</p>
        <p className="collection-nft-card__meta">{nft.placeName}</p>
      </div>
    </Link>
  );
}
