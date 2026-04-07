import "./NftGalleryPage.css";
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { adaptCollection, adaptNft } from "../../api/adapters";
import { collectionsApi } from "../../api/collections";
import { nftsApi } from "../../api/nfts";
import GradientActionButton from "../../components/common/GradientActionButton/GradientActionButton";
import NftGalleryTokenCard from "../../components/common/NftGalleryTokenCard/NftGalleryTokenCard";
import PlaceImage from "../../components/common/PlaceImage/PlaceImage";
import ProgressBar from "../../components/common/ProgressBar/ProgressBar";

function GalleryBanner({ collection }) {
  if (collection.collectionStatus === "completed") {
    return (
      <section className="nft-gallery-page__banner nft-gallery-page__banner--completed" style={{ "--gallery-accent": collection.accentColor }}>
        <div className="nft-gallery-page__banner-icon" aria-hidden="true">🏆</div>
        <div>
          <p className="nft-gallery-page__banner-title">컬렉션 완성!</p>
          <p className="nft-gallery-page__banner-text">모든 NFT를 수집했고 리워드가 열렸어요.</p>
        </div>
      </section>
    );
  }
  if (collection.collectionStatus === "ended") {
    return (
      <section className="nft-gallery-page__banner nft-gallery-page__banner--ended">
        <div className="nft-gallery-page__banner-icon" aria-hidden="true">🗂</div>
        <div>
          <p className="nft-gallery-page__banner-title">시즌이 종료된 컬렉션</p>
          <p className="nft-gallery-page__banner-text">수집한 NFT와 기록은 계속 내 컬렉션에 보관돼요.</p>
        </div>
      </section>
    );
  }
  return (
    <section className="nft-gallery-page__banner nft-gallery-page__banner--active" style={{ "--gallery-accent": collection.accentColor }}>
      <div className="nft-gallery-page__banner-icon" aria-hidden="true">🎁</div>
      <div>
        <p className="nft-gallery-page__banner-title">완성 리워드</p>
        <p className="nft-gallery-page__banner-text">{collection.rewardDescription}</p>
      </div>
    </section>
  );
}

export default function NftGalleryPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [collection, setCollection] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    collectionsApi.list()
      .then((list) => {
        const raw = (list ?? []).find((c) => c.eventId === eventId);
        if (!raw) { setNotFound(true); return; }
        setCollection(adaptCollection(raw));
      })
      .catch(() => setNotFound(true));

    nftsApi.list(eventId)
      .then((list) => setNfts((list ?? []).map(adaptNft)))
      .catch(() => {});
  }, [eventId]);

  if (notFound) return <Navigate to="/collection" replace />;
  if (!collection) return null;

  const nftCount = nfts.length;
  const remainingCount = Math.max(collection.landmarkCount - nftCount, 0);
  const progressPercent = collection.landmarkCount > 0
    ? Math.round((collection.collected / collection.landmarkCount) * 100)
    : 0;

  return (
    <div className="nft-gallery-page">
      <div className="nft-gallery-page__hero" style={{ "--gallery-accent": collection.accentColor }}>
        <PlaceImage className="nft-gallery-page__hero-image" src={collection.image} alt={collection.title} />
        <div className="nft-gallery-page__hero-overlay" />
        <div className="nft-gallery-page__hero-status">{collection.statusLabel}</div>
        <div className="nft-gallery-page__hero-content">
          <p className="nft-gallery-page__hero-region">{collection.flag} {collection.region}</p>
          <h1 className="nft-gallery-page__hero-title">{collection.title}</h1>
          <p className="nft-gallery-page__hero-period">{collection.period}</p>
        </div>
      </div>

      <main className="nft-gallery-page__content">
        <section className="nft-gallery-page__stats">
          <article className="nft-gallery-page__stat-card"><strong>{nftCount}</strong><span>수집</span></article>
          <article className="nft-gallery-page__stat-card"><strong>{progressPercent}%</strong><span>진행률</span></article>
          <article className="nft-gallery-page__stat-card nft-gallery-page__stat-card--muted"><strong>{remainingCount}</strong><span>잠금</span></article>
        </section>

        <section className="nft-gallery-page__progress-card">
          <div className="nft-gallery-page__progress-header"><h2>컬렉션 진행률</h2><span>{progressPercent}%</span></div>
          <ProgressBar value={collection.collected} max={collection.landmarkCount} className="nft-gallery-page__progress-track" fillClassName="nft-gallery-page__progress-fill" />
          <div className="nft-gallery-page__progress-meta">
            <span>{collection.collected}/{collection.landmarkCount} 수집</span>
            <span>{remainingCount}개 남음</span>
          </div>
        </section>

        <GalleryBanner collection={collection} />

        <section className="nft-gallery-page__gallery-header">
          <div><h2>내 NFT 컬렉션</h2><p>수집한 NFT는 이 컬렉션 안에서 계속 보관돼요.</p></div>
          <div className="nft-gallery-page__gallery-count">{nftCount}개</div>
        </section>

        {nftCount === 0 ? (
          <section className="nft-gallery-page__empty">
            <div className="nft-gallery-page__empty-icon" aria-hidden="true">✦</div>
            <h2>아직 수집한 NFT가 없어요</h2>
            <p>현장에서 NFC를 태그하면 첫 번째 NFT가 발행돼요.</p>
            <Link to={`/event/${eventId}`} className="nft-gallery-page__empty-link">루트 보러 가기</Link>
          </section>
        ) : (
          <section className="nft-gallery-page__grid" aria-label="NFT 갤러리">
            {nfts.map((nft, i) => <NftGalleryTokenCard key={nft.id} nft={nft} index={i} accentColor={collection.accentColor} fallbackSrc={collection.image} />)}
            {Array.from({ length: remainingCount }).map((_, i) => (
              <NftGalleryTokenCard key={`locked-${eventId}-${i}`} locked index={nfts.length + i} />
            ))}
          </section>
        )}

        <div className="nft-gallery-page__actions">
          <GradientActionButton label="방문 루트 보기" onClick={() => navigate(`/event/${eventId}`)} />
          <Link to="/collection" className="nft-gallery-page__secondary-link">전체 컬렉션으로</Link>
        </div>
      </main>
    </div>
  );
}
