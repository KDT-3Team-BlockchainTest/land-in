import "./CollectionPage.css";
import { useEffect, useMemo, useState } from "react";
import { adaptCollection, adaptNft } from "../../api/adapters";
import { collectionsApi } from "../../api/collections";
import { nftsApi } from "../../api/nfts";
import CollectionFilterTabs from "../../components/common/CollectionFilterTabs/CollectionFilterTabs";
import CollectionNftCard from "../../components/common/CollectionNftCard/CollectionNftCard";
import CollectionOverviewCard from "../../components/common/CollectionOverviewCard/CollectionOverviewCard";
import CollectionSummaryPanel from "../../components/common/CollectionSummaryPanel/CollectionSummaryPanel";
import { useLanguage } from "../../contexts/useLanguage";

const FILTER_IDS = ["all", "ongoing", "completed", "ended", "nft"];

export default function CollectionPage() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState("all");
  const [rawCollections, setRawCollections] = useState([]);
  const [rawNfts, setRawNfts] = useState([]);

  useEffect(() => {
    collectionsApi.list().then((list) => setRawCollections(list ?? [])).catch(() => {});
    nftsApi.list().then((list) => setRawNfts(list ?? [])).catch(() => {});
  }, []);

  const collectionFilters = useMemo(
    () => FILTER_IDS.map((id) => ({ id, label: t(`collection.filters.${id}`) })),
    [t],
  );

  const nfts = rawNfts.map(adaptNft);
  const collections = rawCollections.map((c) => adaptCollection(c, rawNfts));

  const stats = useMemo(() => ({
    ongoingCount: collections.filter((c) => c.collectionStatus === 'ongoing').length,
    completedCount: collections.filter((c) => c.collectionStatus === 'completed').length,
    nftCount: nfts.length,
  }), [collections, nfts]);

  const filteredCollections = useMemo(() => {
    if (activeFilter === 'all' || activeFilter === 'nft') return collections;
    return collections.filter((c) => c.collectionStatus === activeFilter);
  }, [activeFilter, collections]);

  const showNftList = activeFilter === 'nft';
  const isEmpty = showNftList ? nfts.length === 0 : filteredCollections.length === 0;

  return (
    <div className="page-layout">
      <main className="page-layout__content">
        <section className="collection-page__intro">
          <h1 className="page-title collection-page__title">{t("collection.title")}</h1>
          <p className="page-subtitle">{t("collection.subtitle")}</p>
        </section>

        <CollectionSummaryPanel
          ongoingCount={stats.ongoingCount}
          completedCount={stats.completedCount}
          nftCount={stats.nftCount}
        />

        <section className="collection-page__filters">
          <div className="collection-page__filters-scroller">
            <CollectionFilterTabs filters={collectionFilters} activeFilter={activeFilter} onChange={setActiveFilter} />
          </div>
          <p className="collection-page__filter-description">
            {t(`collection.filterDescriptions.${activeFilter}`)}
          </p>
        </section>

        {isEmpty ? (
          <section className="collection-page__empty">
            <div className="collection-page__empty-icon" aria-hidden="true">✦</div>
            <h2 className="collection-page__empty-title">
              {showNftList ? t("collection.emptyNftTitle") : t("collection.emptyCollectionTitle")}
            </h2>
            <p className="collection-page__empty-description">
              {showNftList ? t("collection.emptyNftDescription") : t("collection.emptyCollectionDescription")}
            </p>
          </section>
        ) : showNftList ? (
          <section className="collection-page__nft-section" aria-label={t("collection.nftListLabel")}>
            <p className="collection-page__nft-caption">{t("collection.nftCaption", { count: nfts.length })}</p>
            <div className="collection-page__nft-grid">
              {nfts.map((nft, i) => <CollectionNftCard key={nft.id} nft={nft} index={i} />)}
            </div>
          </section>
        ) : (
          <section className="collection-page__collection-list" aria-label={t("collection.collectionListLabel")}>
            {filteredCollections.map((c, i) => <CollectionOverviewCard key={c.id} collection={c} index={i} />)}
          </section>
        )}
      </main>
    </div>
  );
}
