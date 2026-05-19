import "./MyProgressPage.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adaptCollection, adaptDashboard } from "../../api/adapters";
import { collectionsApi } from "../../api/collections";
import { dashboardApi } from "../../api/dashboard";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import NftTipCard from "../../components/common/NftTipCard/NftTipCard";
import RouteMapTeaser from "../../components/common/RouteMapTeaser/RouteMapTeaser";
import StatSummaryGrid from "../../components/common/StatSummaryGrid/StatSummaryGrid";
import TagCampaignCard from "../../components/common/TagCampaignCard/TagCampaignCard";
import { useLanguage } from "../../i18n/LanguageContext";

export default function MyProgressPage() {
  const [stats, setStats] = useState(null);
  const [activeCollections, setActiveCollections] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    dashboardApi.stats().then((s) => setStats(adaptDashboard(s))).catch(() => {});
    collectionsApi.list('ongoing')
      .then((list) => setActiveCollections((list ?? []).map((c) => adaptCollection(c))))
      .catch(() => {});
  }, []);

  const primaryEventLink = activeCollections[0] ? `/event/${activeCollections[0].id}` : '/collection';
  const hasEvents = activeCollections.length > 0;

  const statItems = [
    { label: t("progress.stat.nft"), value: stats?.totalNfts ?? 0, color: "#fe6b70", backgroundColor: "rgba(254, 107, 112, 0.08)", icon: "✨" },
    { label: t("progress.stat.cities"), value: stats?.joinedCities ?? 0, color: "#8b5cf6", backgroundColor: "rgba(139, 92, 246, 0.08)", icon: "📍" },
    { label: t("progress.stat.events"), value: stats?.activeEventsCount ?? 0, color: "#22c55e", backgroundColor: "rgba(34, 197, 94, 0.08)", icon: "🗺" },
  ];

  return (
    <div className="page-layout">
      <main className="page-layout__content">
        <section className="my-progress-page__intro">
          <h1 className="page-title my-progress-page__title">{t("progress.title")}</h1>
          <p className="page-subtitle">{t("progress.subtitle")}</p>
        </section>

        <StatSummaryGrid items={statItems} />

        <RouteMapTeaser
          to={primaryEventLink}
          title={t("progress.route_teaser.title")}
          description={t("progress.route_teaser.desc")}
          actionLabel={t("progress.route_teaser.action")}
        />

        {hasEvents ? (
          <>
            <section className="my-progress-page__section">
              <p className="my-progress-page__section-title">{t("progress.section.title")}</p>
              <p className="my-progress-page__section-description">{t("progress.section.desc")}</p>
            </section>
            <div className="my-progress-page__campaign-list">
              {activeCollections.map((c) => <TagCampaignCard key={c.id} collection={c} />)}
            </div>
          </>
        ) : (
          <EmptyState icon="🧭" title={t("progress.empty.title")} description={t("progress.empty.desc")}>
            <Link to="/" className="my-progress-page__empty-link">{t("progress.empty.link")}</Link>
          </EmptyState>
        )}

        <NftTipCard />
      </main>
    </div>
  );
}
