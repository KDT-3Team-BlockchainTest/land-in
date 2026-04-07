import "./TagCampaignCard.css";
import { Link } from "react-router-dom";
import PlaceImage from "../PlaceImage/PlaceImage";
import ProgressBar from "../ProgressBar/ProgressBar";

function RouteStepRow({ step, isLast }) {
  const isDone = step.stepState === "done";
  const isCurrent = step.stepState === "current";
  const isLocked = step.stepState === "locked";
  const isReward = step.stepState === "reward";

  return (
    <div className="tag-campaign-card__step-row">
      <div className="tag-campaign-card__rail">
        <span
          className={[
            "tag-campaign-card__marker",
            isDone ? "is-done" : "",
            isCurrent ? "is-current" : "",
            isLocked ? "is-locked" : "",
            isReward ? "is-reward" : "",
          ]
            .join(" ")
            .trim()}
          aria-hidden="true"
        >
          {isDone ? "✓" : isReward ? "🏆" : isLocked ? "🔒" : ""}
        </span>
        {!isLast && <span className="tag-campaign-card__line" />}
      </div>

      <div
        className={[
          "tag-campaign-card__step-card",
          isCurrent ? "is-current" : "",
          isLocked ? "is-locked" : "",
        ]
          .join(" ")
          .trim()}
      >
        <div className="tag-campaign-card__step-image-wrap">
          <PlaceImage
            className="tag-campaign-card__step-image"
            src={step.image}
            fallbackSrc={step.image}
            alt={step.title}
          />
        </div>

        <div className="tag-campaign-card__step-content">
          <div className="tag-campaign-card__step-header">
            <div>
              <p className="tag-campaign-card__step-title">{step.title}</p>
              <p className="tag-campaign-card__step-subtitle">{step.subtitle}</p>
            </div>
            {step.badgeText && (
              <span className="tag-campaign-card__step-badge">{step.badgeText}</span>
            )}
            {isCurrent && (
              <span className="tag-campaign-card__step-badge is-current">다음 목적지</span>
            )}
          </div>

          {step.rewardText ? (
            <p className="tag-campaign-card__step-reward">{step.rewardText}</p>
          ) : (
            <p className="tag-campaign-card__step-description">{step.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TagCampaignCard({ collection }) {
  const progressPercent = Math.round((collection.collected / collection.landmarkCount) * 100);

  return (
    <article className="tag-campaign-card">
      <Link to={`/event/${collection.id}`} className="tag-campaign-card__hero-link">
        <div className="tag-campaign-card__hero">
          <PlaceImage
            className="tag-campaign-card__hero-image"
            src={collection.image}
            fallbackSrc={collection.routeSteps?.[0]?.image}
            alt={collection.title}
          />
          <div className="tag-campaign-card__hero-overlay" />
          <div className="tag-campaign-card__hero-content">
            <div>
              <p className="tag-campaign-card__hero-region">
                {collection.flag} {collection.region}
              </p>
              <h3 className="tag-campaign-card__hero-title">{collection.title}</h3>
            </div>
            <div className="tag-campaign-card__hero-pill">{collection.daysLeft}일 남음</div>
          </div>
          <div className="tag-campaign-card__hero-progress">
            <ProgressBar
              value={collection.collected}
              max={collection.landmarkCount}
              className="tag-campaign-card__hero-track"
              fillClassName="tag-campaign-card__hero-fill"
            />
            <div className="tag-campaign-card__hero-meta">
              <span>
                {collection.collected}/{collection.landmarkCount} 수집 완료
              </span>
              <span>{progressPercent}%</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="tag-campaign-card__body">
        <div className="tag-campaign-card__section-header">
          <div>
            <p className="tag-campaign-card__section-title">방문 루트</p>
            <p className="tag-campaign-card__section-description">
              순서대로 방문하고 NFT를 차근차근 완성해보세요.
            </p>
          </div>
          <div className="tag-campaign-card__legend">
            <span>
              <i className="is-done" />
              완료
            </span>
            <span>
              <i className="is-current" />
              현재
            </span>
            <span>
              <i className="is-locked" />
              예정
            </span>
          </div>
        </div>

        <div className="tag-campaign-card__steps">
          {collection.routeSteps.map((step, index) => (
            <RouteStepRow
              key={step.id}
              step={step}
              isLast={index === collection.routeSteps.length - 1}
            />
          ))}
        </div>

        <div className="tag-campaign-card__reward">
          <span className="tag-campaign-card__reward-icon" aria-hidden="true">
            🏆
          </span>
          <div>
            <p className="tag-campaign-card__reward-label">컬렉션 완성 리워드</p>
            <p className="tag-campaign-card__reward-text">{collection.rewardDescription}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
