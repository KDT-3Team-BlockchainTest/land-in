import "./Home.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adaptEventSummary } from "../../api/adapters";
import { eventsApi } from "../../api/events";
import ActiveEventCard from "../../components/common/ActiveEventCard/ActiveEventCard";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import FeaturedEventCard from "../../components/common/FeaturedEventCard/FeaturedEventCard";
import MoreEventsCard from "../../components/common/MoreEventsCard/MoreEventsCard";
import ProgressBanner from "../../components/common/ProgressBanner/ProgressBanner";
import SectionHeader from "../../components/common/SectionHeader/SectionHeader";
import UpcomingEventCard from "../../components/common/UpcomingEventCard/UpcomingEventCard";
import { useAuth } from "../../contexts/useAuth";
import useJoinedEventIds from "../../hooks/useJoinedEventIds";
import { useLanguage } from "../../i18n/LanguageContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinedEventIds, joinEvent } = useJoinedEventIds();
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    eventsApi.list()
      .then((list) => setEvents(list ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
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
            {t("home.greeting")} <span>{user?.displayName ?? t("home.default_name")}</span> <span aria-hidden="true">.</span>
          </p>
          <h1 className="page-title">{t("home.tagline")}</h1>
        </section>

        <ProgressBanner
          title={t("home.progress.title")}
          description={t(ongoingCount === 1 ? "home.progress.desc_one" : "home.progress.desc_other", { count: ongoingCount })}
          onClick={() => navigate("/my-progress")}
        />

        {loaded && adapted.length === 0 && (
          <EmptyState
            icon="🗺️"
            title={t("home.empty.title")}
            description={t("home.empty.desc")}
          />
        )}

        {featuredEvent && (
          <section className="home-page__section">
            <SectionHeader title={t("home.featured.title")} description={t("home.featured.desc")} />
            <FeaturedEventCard event={featuredEvent} />
          </section>
        )}

        {activeEvents.length > 0 && (
          <section className="home-page__section">
            <SectionHeader
              title={t("home.active.title")}
              description={t("home.active.desc")}
              actionLabel={t("home.active.action")}
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
              title={t("home.upcoming.title")}
              description={t("home.upcoming.desc")}
              actionLabel={t("home.upcoming.action")}
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
