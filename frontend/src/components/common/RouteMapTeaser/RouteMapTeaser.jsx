import "./RouteMapTeaser.css";
import { Link } from "react-router-dom";

export default function RouteMapTeaser({
  to,
  title,
  description,
  actionLabel = "루트 보기",
}) {
  return (
    <Link to={to} className="route-map-teaser">
      <div className="route-map-teaser__dots" aria-hidden="true">
        <span className="is-primary" />
        <span className="is-violet" />
        <span className="is-primary" />
        <span className="is-cyan" />
        <span className="is-amber" />
      </div>
      <svg className="route-map-teaser__line" viewBox="0 0 320 100" aria-hidden="true">
        <path d="M 40 28 Q 120 55 178 36 Q 238 18 284 54" />
      </svg>

      <div className="route-map-teaser__content">
        <div>
          <div className="route-map-teaser__header">
            <span className="route-map-teaser__badge" aria-hidden="true">
              🗺
            </span>
            <p className="route-map-teaser__title">{title}</p>
          </div>
          <p className="route-map-teaser__description">{description}</p>
        </div>

        <span className="route-map-teaser__action">{actionLabel}</span>
      </div>
    </Link>
  );
}
