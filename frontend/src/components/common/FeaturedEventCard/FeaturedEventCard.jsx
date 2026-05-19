import "./FeaturedEventCard.css";
import { Link } from "react-router-dom";
import clockIconW from "../../../assets/icon/icon_clock_w.png";
import rightArrowIcon from "../../../assets/icon/icon_right_arrow_w.png";
import EventTagBadge from "../EventTagBadge/EventTagBadge";
import IconImage from "../IconImage/IconImage";
import PlaceImage from "../PlaceImage/PlaceImage";

export default function FeaturedEventCard({ event }) {
  const progressPercent = Math.round((event.collected / event.landmarkCount) * 100);

  return (
    <Link to={`/event/${event.id}`} className="featured-event-card-link">
      <article className="featured-event-card">
        <PlaceImage
          className="featured-event-card__image"
          src={event.image}
          fallbackSrc={event.routeSteps?.[0]?.image}
          alt={event.title}
        />
        <div className="featured-event-card__overlay" />

        <div className="featured-event-card__top">
          <div className="featured-event-card__chips">
            <EventTagBadge tag={event.tag} />
            <span className="featured-event-card__region">
              {event.flag} {event.region}
            </span>
          </div>

          <span className="featured-event-card__timer">
            <IconImage src={clockIconW} size={12} />
            <span>{event.daysLeft}일 남음</span>
          </span>
        </div>

        <div className="featured-event-card__bottom">
          <h3 className="featured-event-card__title">{event.title}</h3>

          <div className="featured-event-card__progress-row">
            <div className="featured-event-card__progress-track">
              <div
                className="featured-event-card__progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="featured-event-card__progress-text">
              {event.collected}/{event.landmarkCount} 수집
            </span>
          </div>

          <div className="featured-event-card__footer">
            <span className="featured-event-card__meta">루트 및 리워드 보기</span>
            <span className="featured-event-card__cta">
              <span>이어하기</span>
              <IconImage src={rightArrowIcon} size={14} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
