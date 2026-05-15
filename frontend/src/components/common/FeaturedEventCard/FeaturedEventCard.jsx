import "./FeaturedEventCard.css";
import { Link } from "react-router-dom";
import clockIconW from "../../../assets/icon/icon_clock_w.png";
import rightArrowIcon from "../../../assets/icon/icon_right_arrow_w.png";
import EventTagBadge from "../EventTagBadge/EventTagBadge";
import IconImage from "../IconImage/IconImage";
import PlaceImage from "../PlaceImage/PlaceImage";
import { useLanguage } from "../../../contexts/useLanguage";

export default function FeaturedEventCard({ event }) {
  const { t } = useLanguage();
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
            <span>{t("event.daysLeft", { days: event.daysLeft })}</span>
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
              {t("event.collectedRatio", { collected: event.collected, total: event.landmarkCount })}
            </span>
          </div>

          <div className="featured-event-card__footer">
            <span className="featured-event-card__meta">{t("event.featuredAction")}</span>
            <span className="featured-event-card__cta">
              <span>{t("event.continue")}</span>
              <IconImage src={rightArrowIcon} size={14} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
