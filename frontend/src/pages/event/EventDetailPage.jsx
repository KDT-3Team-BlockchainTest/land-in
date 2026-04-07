import "./EventDetailPage.css";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import EventDetailHero from "../../components/common/EventDetailHero/EventDetailHero";
import EventHighlightsCard from "../../components/common/EventHighlightsCard/EventHighlightsCard";
import EventProgressCard from "../../components/common/EventProgressCard/EventProgressCard";
import EventRewardCard from "../../components/common/EventRewardCard/EventRewardCard";
import EventRouteTimeline from "../../components/common/EventRouteTimeline/EventRouteTimeline";
import GradientActionButton from "../../components/common/GradientActionButton/GradientActionButton";
import { getEventById } from "../../data/events";
import useJoinedEventIds from "../../hooks/useJoinedEventIds";

export default function EventDetailPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { joinedEventIds, joinEvent } = useJoinedEventIds();
  const event = getEventById(eventId);

  if (!event) {
    return <Navigate to="/" replace />;
  }

  const isJoined = joinedEventIds.includes(event.id);
  const isJoinable = event.participationState === "joinable";
  const hasCurrentStep = event.routeSteps.some((step) => step.stepState === "current");
  const statusLabel = isJoinable ? (isJoined ? "참여 중" : "참여 가능") : event.detailStatusLabel;

  let actionLabel = event.bottomCtaLabel;

  if (isJoinable && !isJoined) {
    actionLabel = "루트 보기 & 참여하기";
  } else if (hasCurrentStep) {
    actionLabel = "태그";
  }

  const handleBottomAction = () => {
    if (isJoinable && !isJoined) {
      joinEvent(event.id);
      navigate("/tag");
      return;
    }

    if (hasCurrentStep) {
      navigate("/tag");
      return;
    }

    if (event.status === "completed" || event.status === "ended") {
      navigate("/collection");
      return;
    }

    navigate("/");
  };

  return (
    <div className="event-detail-page">
      <div className="event-detail-page__hero-wrap">
        <EventDetailHero event={event} statusLabel={statusLabel} />
      </div>

      <div className="event-detail-page__content">
        <EventProgressCard collected={event.collected} total={event.landmarkCount} />
        <EventHighlightsCard highlights={event.highlights} />
        <EventRewardCard title={event.rewardTitle} description={event.rewardDescription} />
        <EventRouteTimeline steps={event.routeSteps} fallbackImage={event.image} />
        <GradientActionButton label={actionLabel} onClick={handleBottomAction} />
      </div>
    </div>
  );
}
