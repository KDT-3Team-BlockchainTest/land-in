import "./CollectionOverviewCard.css";
import { Link } from "react-router-dom";
import bookPrimaryIcon from "../../../assets/icon/icon_book_p.png";
import clockIconW from "../../../assets/icon/icon_clock_w.png";
import giftPrimaryIcon from "../../../assets/icon/icon_gift_p.png";
import rightArrowIcon from "../../../assets/icon/icon_right_arrow_p.png";
import EventTagBadge from "../EventTagBadge/EventTagBadge";
import IconImage from "../IconImage/IconImage";
import PlaceImage from "../PlaceImage/PlaceImage";
import ProgressBar from "../ProgressBar/ProgressBar";

function getRewardTone(status) {
  if (status === "completed") {
    return "collection-overview-card__reward--completed";
  }

  if (status === "ended") {
    return "collection-overview-card__reward--ended";
  }

  return "collection-overview-card__reward--ongoing";
}

export default function CollectionOverviewCard({ collection, index = 0 }) {
  const isCompleted = collection.collectionStatus === "completed";
  const isEnded = collection.collectionStatus === "ended";
  const toneClassName = getRewardTone(collection.collectionStatus);

  return (
    <article
      className={[
        "collection-overview-card",
        isEnded ? "is-ended" : "",
        isCompleted ? "is-completed" : "",
      ]
        .join(" ")
        .trim()}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Link
        to={`/event/${collection.id}`}
        className="collection-overview-card__hero-link"
        aria-label={`${collection.title} 상세 보기`}
      >
        <div className="collection-overview-card__hero">
          <PlaceImage
            className="collection-overview-card__image"
            src={collection.image}
            fallbackSrc={collection.routeSteps?.[0]?.image}
            alt={collection.title}
          />
          <div className="collection-overview-card__overlay" />

          <div className="collection-overview-card__top">
            {isCompleted ? (
              <div className="collection-overview-card__complete-chip">전부 수집 완료</div>
            ) : (
              <div />
            )}
            <EventTagBadge tag={collection.statusTag} />
          </div>

          <div className="collection-overview-card__bottom-meta">
            <span className="collection-overview-card__region">
              {collection.flag} {collection.region}
            </span>

            {collection.collectionStatus === "ongoing" && typeof collection.daysLeft === "number" && (
              <span className="collection-overview-card__days-left">
                <IconImage src={clockIconW} size={11} />
                <span>{collection.daysLeft}일 남음</span>
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="collection-overview-card__body">
        <Link to={`/event/${collection.id}`} className="collection-overview-card__title-link">
          <h3 className="collection-overview-card__title">{collection.title}</h3>
          <p className="collection-overview-card__period">{collection.period}</p>
        </Link>

        <div className="collection-overview-card__progress">
          <ProgressBar
            value={collection.collected}
            max={collection.landmarkCount}
            className="collection-overview-card__progress-track"
            fillClassName={`collection-overview-card__progress-fill collection-overview-card__progress-fill--${collection.collectionStatus}`}
          />
          <div className="collection-overview-card__progress-meta">
            <span>
              <strong>{collection.collected}</strong> / {collection.landmarkCount} 수집
            </span>
            <span>{collection.progressPercent}%</span>
          </div>
        </div>

        <div className={`collection-overview-card__reward ${toneClassName}`}>
          <IconImage src={giftPrimaryIcon} size={14} />
          <span>{collection.rewardDescription}</span>
        </div>

        <Link
          to={`/nft-gallery/${collection.id}`}
          className={`collection-overview-card__cta ${toneClassName}`}
        >
          <IconImage src={bookPrimaryIcon} size={15} />
          <span>NFT 컬렉션 보기</span>
          <IconImage src={rightArrowIcon} size={14} />
        </Link>
      </div>
    </article>
  );
}
