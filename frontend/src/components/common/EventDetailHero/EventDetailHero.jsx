import "./EventDetailHero.css";
import clockIconW from "../../../assets/icon/icon_clock_w.png";
import IconImage from "../IconImage/IconImage";
import PlaceImage from "../PlaceImage/PlaceImage";
import { useLanguage } from "../../../contexts/useLanguage";

function useMetaLabel(event) {
  const { t } = useLanguage();

  if (event.heroDayLabel) {
    return event.heroDayLabel;
  }

  if (typeof event.daysLeft === "number") {
    return t("event.daysLeft", { days: event.daysLeft });
  }

  if (typeof event.daysUntilOpen === "number") {
    return t("event.daysUntilOpen", { days: event.daysUntilOpen });
  }

  return t("event.detailFallback");
}

export default function EventDetailHero({ event, statusLabel }) {
  const { t } = useLanguage();
  const metaLabel = useMetaLabel(event);

  return (
    <section className="event-detail-hero">
      <PlaceImage
        className="event-detail-hero__image"
        src={event.image}
        fallbackSrc={event.routeSteps?.[0]?.image}
        alt={event.title}
      />
      <div className="event-detail-hero__overlay" />

      <div className="event-detail-hero__status">{statusLabel ?? event.detailStatusLabel}</div>

      <div className="event-detail-hero__content">
        <p className="event-detail-hero__region">
          {event.flag} {event.region}
        </p>
        <h1 className="event-detail-hero__title">{event.title}</h1>

        <div className="event-detail-hero__chips">
          <span className="event-detail-hero__chip">{event.period}</span>
          <span className="event-detail-hero__chip">
            {t("event.landmarkChip", { count: event.landmarkCount })}
          </span>
          <span className="event-detail-hero__chip event-detail-hero__chip--accent">
            <IconImage src={clockIconW} size={12} />
            <span>{metaLabel}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
