import "./EventDetailHero.css";
import clockIconW from "../../../assets/icon/icon_clock_w.png";
import IconImage from "../IconImage/IconImage";
import PlaceImage from "../PlaceImage/PlaceImage";

function getMetaLabel(event) {
  if (event.heroDayLabel) {
    return event.heroDayLabel;
  }

  if (typeof event.daysLeft === "number") {
    return `${event.daysLeft}일 남음`;
  }

  if (typeof event.daysUntilOpen === "number") {
    return `${event.daysUntilOpen}일 후 오픈`;
  }

  return "상세 보기";
}

export default function EventDetailHero({ event, statusLabel }) {
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
          <span className="event-detail-hero__chip">{event.landmarkCount}개 명소</span>
          <span className="event-detail-hero__chip event-detail-hero__chip--accent">
            <IconImage src={clockIconW} size={12} />
            <span>{getMetaLabel(event)}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
