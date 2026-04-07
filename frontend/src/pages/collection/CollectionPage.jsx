import "./CollectionPage.css";
import { useEffect, useMemo, useState } from "react";
import { adaptCollection, adaptNft } from "../../api/adapters";
import { collectionsApi } from "../../api/collections";
import { nftsApi } from "../../api/nfts";
import CollectionFilterTabs from "../../components/common/CollectionFilterTabs/CollectionFilterTabs";
import CollectionNftCard from "../../components/common/CollectionNftCard/CollectionNftCard";
import CollectionOverviewCard from "../../components/common/CollectionOverviewCard/CollectionOverviewCard";
import CollectionSummaryPanel from "../../components/common/CollectionSummaryPanel/CollectionSummaryPanel";

const collectionFilters = [
  { id: "all", label: "전체" },
  { id: "ongoing", label: "진행 중" },
  { id: "completed", label: "완성" },
  { id: "ended", label: "종료" },
  { id: "nft", label: "NFT" },
];

const filterDescriptions = {
  all: "참여한 모든 컬렉션을 한 번에 확인하세요",
  ongoing: "지금 여행 중인 컬렉션만 모아봤어요",
  completed: "완성한 컬렉션과 보상을 다시 감상해보세요",
  ended: "종료된 시즌 컬렉션도 기록으로 남아있어요",
  nft: "총 NFT를 갤러리처럼 보고, 탭하면 해당 컬렉션으로 이동해요",
};

export default function CollectionPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [rawCollections, setRawCollections] = useState([]);
  const [rawNfts, setRawNfts] = useState([]);

  useEffect(() => {
    collectionsApi.list().then((list) => setRawCollections(list ?? [])).catch(() => {});
    nftsApi.list().then((list) => setRawNfts(list ?? [])).catch(() => {});
  }, []);

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
          <h1 className="page-title collection-page__title">내 컬렉션</h1>
          <p className="page-subtitle">카드를 탭하면 루트 & 상세 보기, 버튼으로 NFT 감상</p>
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
          <p className="collection-page__filter-description">{filterDescriptions[activeFilter]}</p>
        </section>

        {isEmpty ? (
          <section className="collection-page__empty">
            <div className="collection-page__empty-icon" aria-hidden="true">✦</div>
            <h2 className="collection-page__empty-title">
              {showNftList ? "아직 수집한 NFT가 없어요" : "아직 컬렉션이 없어요"}
            </h2>
            <p className="collection-page__empty-description">
              {showNftList ? "현장에서 NFC를 태그하면 첫 번째 NFT가 발행됩니다." : "탐험을 시작해 새로운 컬렉션에 참여해보세요."}
            </p>
          </section>
        ) : showNftList ? (
          <section className="collection-page__nft-section" aria-label="NFT 목록">
            <p className="collection-page__nft-caption">총 {nfts.length}개의 NFT · 탭하면 해당 컬렉션으로 이동</p>
            <div className="collection-page__nft-grid">
              {nfts.map((nft, i) => <CollectionNftCard key={nft.id} nft={nft} index={i} />)}
            </div>
          </section>
        ) : (
          <section className="collection-page__collection-list" aria-label="컬렉션 목록">
            {filteredCollections.map((c, i) => <CollectionOverviewCard key={c.id} collection={c} index={i} />)}
          </section>
        )}
      </main>
    </div>
  );
}
