import "./EventDetailPage.css";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { adaptEventDetail } from "../../api/adapters";
import { eventsApi } from "../../api/events";
import EventDetailHero from "../../components/common/EventDetailHero/EventDetailHero";
import EventHighlightsCard from "../../components/common/EventHighlightsCard/EventHighlightsCard";
import EventProgressCard from "../../components/common/EventProgressCard/EventProgressCard";
import EventRewardCard from "../../components/common/EventRewardCard/EventRewardCard";
import EventRouteTimeline from "../../components/common/EventRouteTimeline/EventRouteTimeline";
import GradientActionButton from "../../components/common/GradientActionButton/GradientActionButton";
import useJoinedEventIds from "../../hooks/useJoinedEventIds";

export default function EventDetailPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { joinEvent } = useJoinedEventIds();
  const [raw, setRaw] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    eventsApi.detail(eventId)
      .then(setRaw)
      .catch((err) => { if (err.status === 404) setNotFound(true); });
  }, [eventId]);

  if (notFound) return <Navigate to="/" replace />;
  if (!raw) return null;

  const event = adaptEventDetail(raw);
  const isJoined = raw.joined;
  const isJoinable = event.participationState === 'joinable';
  const hasCurrentStep = event.routeSteps.some((s) => s.stepState === 'current');
  const statusLabel = isJoined ? '참여 중' : (isJoinable ? '참여 가능' : event.detailStatusLabel);

  let actionLabel = event.bottomCtaLabel;
  if (isJoinable && !isJoined) actionLabel = '루트 보기 & 참여하기';
  else if (hasCurrentStep) actionLabel = '태그';

  const handleBottomAction = async () => {
    if (isJoinable && !isJoined) {
      try { await joinEvent(event.id); } catch { /* ignore */ }
      navigate('/tag');
      return;
    }
    if (hasCurrentStep) { navigate('/tag'); return; }
    if (event.status === 'completed' || event.status === 'ended') {
      navigate('/collection'); return;
    }
    navigate('/');
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
