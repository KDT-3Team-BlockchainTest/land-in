import "./EventRouteTimeline.css";
import PlaceImage from "../PlaceImage/PlaceImage";
import { useLanguage } from "../../../contexts/useLanguage";

function RouteStepCard({ step, fallbackImage }) {
  const isCurrent = step.stepState === "current";
  const isDone = step.stepState === "done";
  const isReward = step.stepState === "reward";
  const isLocked = step.stepState === "locked";

  return (
    <article
      className={[
        "event-route-step-card",
        isCurrent ? "is-current" : "",
        isDone ? "is-done" : "",
        isReward ? "is-reward" : "",
        isLocked ? "is-locked" : "",
      ]
        .join(" ")
        .trim()}
    >
      <PlaceImage
        className="event-route-step-card__image"
        src={step.image}
        fallbackSrc={fallbackImage}
        alt={step.title}
      />

      <div className="event-route-step-card__content">
        <div className="event-route-step-card__header">
          <div>
            <h3 className="event-route-step-card__title">{step.title}</h3>
            <p className="event-route-step-card__subtitle">{step.subtitle}</p>
          </div>

          {step.badgeText && (
            <span className="event-route-step-card__badge">{step.badgeText}</span>
          )}

          {step.actionLabel && (
            <span className="event-route-step-card__action">{step.actionLabel}</span>
          )}
        </div>

        {step.statusText && (
          <p className="event-route-step-card__status">{step.statusText}</p>
        )}

        <p className="event-route-step-card__description">{step.description}</p>

        {step.rewardText && (
          <p className="event-route-step-card__reward">{step.rewardText}</p>
        )}
      </div>
    </article>
  );
}

export default function EventRouteTimeline({ steps, fallbackImage }) {
  const { t } = useLanguage();
  return (
    <section className="event-route-timeline">
      <div className="event-route-timeline__header">
        <div>
          <h2 className="event-route-timeline__title">{t("event.routeTitle")}</h2>
          <p className="event-route-timeline__description">{t("event.routeSubtitle")}</p>
        </div>

        <div className="event-route-timeline__legend">
          <span><i className="is-done" />{t("event.stepDone")}</span>
          <span><i className="is-current" />{t("event.stepCurrent")}</span>
          <span><i className="is-locked" />{t("event.stepLocked")}</span>
        </div>
      </div>

      <div className="event-route-timeline__body">
        {steps.map((step, index) => {
          const markerState = step.stepState === "reward" ? "reward" : step.stepState;

          return (
            <div key={step.id} className="event-route-timeline__row">
              <div className="event-route-timeline__rail">
                {index < steps.length - 1 && <span className="event-route-timeline__line" />}
                <span
                  className={`event-route-timeline__marker is-${markerState}`}
                  aria-hidden="true"
                >
                  {step.stepState === "done" && "✓"}
                  {step.stepState === "reward" && "🏆"}
                </span>
              </div>

              <RouteStepCard step={step} fallbackImage={fallbackImage} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
