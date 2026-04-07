import "./Home.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adaptEventSummary } from "../../api/adapters";
import { eventsApi } from "../../api/events";
import ActiveEventCard from "../../components/common/ActiveEventCard/ActiveEventCard";
import FeaturedEventCard from "../../components/common/FeaturedEventCard/FeaturedEventCard";
import MoreEventsCard from "../../components/common/MoreEventsCard/MoreEventsCard";
import ProgressBanner from "../../components/common/ProgressBanner/ProgressBanner";
import SectionHeader from "../../components/common/SectionHeader/SectionHeader";
import UpcomingEventCard from "../../components/common/UpcomingEventCard/UpcomingEventCard";
import { useAuth } from "../../contexts/AuthContext";
import useJoinedEventIds from "../../hooks/useJoinedEventIds";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinedEventIds, joinEvent } = useJoinedEventIds();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    eventsApi.list().then((list) => setEvents(list ?? [])).catch(() => {});
  }, []);

  const adapted = events.map((e) => adaptEventSummary(e, joinedEventIds));
  const featuredEvent = adapted.find((e) => e.status === 'featured' || e.tag === 'featured');
  const activeEvents = adapted.filter((e) => e.status === 'active');
  const upcomingEvents = adapted.filter((e) => e.status === 'upcoming');

  const ongoingCount = joinedEventIds.length;
  const nftCount = 0; // 대시보드에서 관리

  return (
    <div className="page-layout">
      <main className="home-page__content">
        <section className="home-page__intro" aria-label="인트로">
          <p className="home-page__greeting">
            안녕하세요, <span>{user?.displayName ?? ''}님</span> <span aria-hidden="true">👋</span>
          </p>
          <h1 className="page-title">다음 여행을 찾아보세요</h1>
        </section>

        <ProgressBanner
          title="내 진행 현황"
          description={`진행 중 ${ongoingCount}개`}
          onClick={() => navigate("/my-progress")}
        />

        {featuredEvent && (
          <section className="home-page__section">
            <SectionHeader title="추천 이벤트" description="탭하면 루트 & 리워드 상세 보기" />
            <FeaturedEventCard event={featuredEvent} />
          </section>
        )}

        {activeEvents.length > 0 && (
          <section className="home-page__section">
            <SectionHeader
              title="진행 중인 이벤트"
              description="탭해서 참여 & 루트 확인"
              actionLabel="전체 보기"
            />
            <div className="home-page__active-scroller">
              <div className="home-page__active-track">
                {activeEvents.map((event) => (
                  <ActiveEventCard
                    key={event.id}
                    event={{ ...event, joined: joinedEventIds.includes(event.id) }}
                    onJoin={() => joinEvent(event.id)}
                  />
                ))}
                <MoreEventsCard />
              </div>
            </div>
          </section>
        )}

        {upcomingEvents.length > 0 && (
          <section className="home-page__section">
            <SectionHeader
              title="오픈 예정 캠페인"
              description="탭해서 루트 미리 보기 & 알림 신청"
              actionLabel="알림 신청"
            />
            <div className="home-page__upcoming-list">
              {upcomingEvents.map((event) => (
                <UpcomingEventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
