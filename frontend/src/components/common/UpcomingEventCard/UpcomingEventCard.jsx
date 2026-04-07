import "./UpcomingEventCard.css";
import { Link } from "react-router-dom";
import clockIcon from "../../../assets/icon/icon_clock.png";
import rightArrowIcon from "../../../assets/icon/icon_right_arrow.png";
import IconImage from "../IconImage/IconImage";
import PlaceImage from "../PlaceImage/PlaceImage";

export default function UpcomingEventCard({ event }) {
  return (
    <Link to={`/event/${event.id}`} className="upcoming-event-card-link">
      <article className="upcoming-event-card">
        <div className="upcoming-event-card__thumb">
          <PlaceImage
            className="upcoming-event-card__image"
            src={event.image}
            fallbackSrc={event.routeSteps?.[0]?.image}
            alt={event.title}
          />
          <div className="upcoming-event-card__image-overlay" />
          <span className="upcoming-event-card__flag" aria-hidden="true">
            {event.flag}
          </span>
        </div>

        <div className="upcoming-event-card__content">
          <h3 className="upcoming-event-card__title">{event.title}</h3>
          <p className="upcoming-event-card__region">{event.region}</p>

          <div className="upcoming-event-card__chips">
            <span className="upcoming-event-card__time">
              <IconImage src={clockIcon} size={10} />
              <span>{event.daysUntilOpen}일 후 오픈</span>
            </span>
            <span className="upcoming-event-card__reward">🎁 {event.rewardLabel}</span>
          </div>
        </div>

        <span className="upcoming-event-card__arrow">
          <IconImage src={rightArrowIcon} size={16} />
        </span>
      </article>
    </Link>
  );
}
