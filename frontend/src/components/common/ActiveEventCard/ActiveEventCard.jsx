import "./ActiveEventCard.css";
import { useNavigate } from "react-router-dom";
import clockIcon from "../../../assets/icon/icon_clock.png";
import rightArrowIcon from "../../../assets/icon/icon_right_arrow.png";
import sparklesIcon from "../../../assets/icon/icon_sparkles.png";
import EventTagBadge from "../EventTagBadge/EventTagBadge";
import IconImage from "../IconImage/IconImage";
import PlaceImage from "../PlaceImage/PlaceImage";
import { useLanguage } from "../../../contexts/useLanguage";

export default function ActiveEventCard({ event, onJoin }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const openDetail = () => {
    navigate(`/event/${event.id}`);
  };

  const handleCardKeyDown = (keyboardEvent) => {
    if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
      keyboardEvent.preventDefault();
      openDetail();
    }
  };

  const handleCtaClick = (clickEvent) => {
    clickEvent.stopPropagation();

    if (!event.joined) {
      onJoin?.();
    }

    openDetail();
  };

  return (
    <article
      className="active-event-card"
      role="button"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={handleCardKeyDown}
    >
      <div className="active-event-card__image-wrap">
        <PlaceImage
          className="active-event-card__image"
          src={event.image}
          fallbackSrc={event.routeSteps?.[0]?.image}
          alt={event.title}
        />
        <div className="active-event-card__image-overlay" />

        <div className="active-event-card__badge">
          <EventTagBadge tag={event.tag} />
        </div>

        <span className="active-event-card__timer">
          <IconImage src={clockIcon} size={12} />
          <span>{t("event.daysLeft", { days: event.daysLeft })}</span>
        </span>

        <span className="active-event-card__flag" aria-hidden="true">
          {event.flag}
        </span>
      </div>

      <div className="active-event-card__content">
        <div className="active-event-card__title-group">
          <h3 className="active-event-card__title">{event.title}</h3>
          <p className="active-event-card__location">{event.region}</p>
        </div>

        <div className="active-event-card__meta">
          <span>📍 {t("event.landmarkChip", { count: event.landmarkCount })}</span>
          <span>🎁 {t("event.rewardChip")}</span>
        </div>

        <button
          type="button"
          className={`active-event-card__cta${event.joined ? " is-joined" : ""}`}
          onClick={handleCtaClick}
        >
          {event.joined && <IconImage src={sparklesIcon} size={14} />}
          <span>{event.joined ? t("event.continue") : t("event.joinAndView")}</span>
          <IconImage src={rightArrowIcon} size={14} />
        </button>
      </div>
    </article>
  );
}
