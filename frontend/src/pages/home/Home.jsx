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
import { useAuth } from "../../contexts/useAuth";
import useJoinedEventIds from "../../hooks/useJoinedEventIds";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinedEventIds, joinEvent } = useJoinedEventIds();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    eventsApi.list().then((list) => setEvents(list ?? [])).catch(() => {});
  }, []);

  const adapted = events.map((event) => adaptEventSummary(event, joinedEventIds));
  const featuredEvent = adapted.find((event) => event.status === "featured" || event.tag === "featured");
  const activeEvents = adapted.filter((event) => event.status === "active");
  const upcomingEvents = adapted.filter((event) => event.status === "upcoming");
  const ongoingCount = joinedEventIds.length;

  return (
    <div className="page-layout">
      <main className="home-page__content">
        <section className="home-page__intro" aria-label="Home intro">
          <p className="home-page__greeting">
            Hello, <span>{user?.displayName ?? "Traveler"}</span> <span aria-hidden="true">.</span>
          </p>
          <h1 className="page-title">Find your next landmark route.</h1>
        </section>

        <ProgressBanner
          title="Current progress"
          description={`You are exploring ${ongoingCount} route${ongoingCount === 1 ? "" : "s"} right now.`}
          onClick={() => navigate("/my-progress")}
        />

        {featuredEvent && (
          <section className="home-page__section">
            <SectionHeader title="Featured event" description="See the route and reward details at a glance." />
            <FeaturedEventCard event={featuredEvent} />
          </section>
        )}

        {activeEvents.length > 0 && (
          <section className="home-page__section">
            <SectionHeader
              title="Active events"
              description="Join a route and keep collecting stamps."
              actionLabel="View all"
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
              title="Upcoming campaigns"
              description="Preview future routes before they open."
              actionLabel="Notify me"
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
