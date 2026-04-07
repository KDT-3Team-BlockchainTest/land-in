import "./TagPage.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adaptCollection, adaptNft } from "../../api/adapters";
import { collectionsApi } from "../../api/collections";
import { nfcApi } from "../../api/nfc";
import { nftsApi } from "../../api/nfts";
import PlaceImage from "../../components/common/PlaceImage/PlaceImage";
import { eventsApi } from "../../api/events";

const VERIFY_DELAY_MS = 2500;
const VERIFIED_DELAY_MS = 1700;

function PhoneIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="20" y="10" width="24" height="44" rx="6" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="32" cy="46" r="2.3" fill="currentColor" />
    </svg>
  );
}

function CheckIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M22 33.5 29 40.5 43 24.5" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparklesIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 10 37.6 24.4 52 30 37.6 35.6 32 50 26.4 35.6 12 30 26.4 24.4 32 10Z" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M48 10v8M44 14h8M18 46v6M15 49h6M47 46v4M45 48h4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ShareIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="18" cy="32" r="6" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="46" cy="18" r="6" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="46" cy="46" r="6" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <path d="M23 28 40 21M23 36 40 43" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

function VerificationGuide() {
  return (
    <section className="tag-page__guide-card">
      <h2 className="tag-page__guide-title">사용 방법</h2>
      <div className="tag-page__guide-list">
        {["랜드마크의 NFC 태그를 찾으세요.", "휴대폰을 태그에 가까이 대세요.", "확인 메시지가 나올 때까지 기다리세요."].map((step, i) => (
          <div key={step} className="tag-page__guide-item">
            <span className="tag-page__guide-number">{i + 1}</span>
            <p>{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ConfettiLayer() {
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${4 + ((i * 4.1) % 92)}%`,
    delay: `${(i % 8) * 90}ms`,
    duration: `${2200 + (i % 5) * 220}ms`,
    rotation: `${(i % 6) * 18}deg`,
  }));
  return (
    <div className="tag-page__confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span key={p.id} className={p.id % 3 === 0 ? "is-dot" : ""} style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, transform: `rotate(${p.rotation})` }} />
      ))}
    </div>
  );
}

export default function TagPage() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [phase, setPhase] = useState("ready");
  const [tagUid, setTagUid] = useState("");
  const [mintedNft, setMintedNft] = useState(null);
  const [mintError, setMintError] = useState("");

  useEffect(() => {
    collectionsApi.list('ongoing')
      .then((list) => setCollections((list ?? []).map((c) => adaptCollection(c))))
      .catch(() => {});
  }, []);

  const activeCollection = collections[0] ?? null;
  const currentStep = useMemo(
    () => activeCollection?.routeSteps?.find((s) => s.stepState === 'current') ?? null,
    [activeCollection],
  );

  // scanning → verified
  useEffect(() => {
    if (phase !== 'scanning') return;
    const t = setTimeout(() => setPhase('verified'), VERIFY_DELAY_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // verified → minting (실제 API 호출)
  useEffect(() => {
    if (phase !== 'verified') return;
    const t = setTimeout(async () => {
      setPhase('minting');
      try {
        const result = await nfcApi.verify(tagUid);
        setMintedNft(result.mintedNft);
        setPhase('minted');
      } catch (err) {
        setMintError(err.message || 'NFC 인증에 실패했습니다.');
        setPhase('error');
      }
    }, VERIFIED_DELAY_MS);
    return () => clearTimeout(t);
  }, [phase, tagUid]);

  const handleStartScan = () => {
    if (!tagUid.trim()) return;
    setMintError('');
    setPhase('scanning');
  };

  if (!activeCollection) {
    return (
      <div className="tag-page">
        <main className="tag-page__content">
          <h1 className="tag-page__page-title">방문 인증</h1>
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell"><PhoneIcon className="tag-page__status-icon" /></div>
            <h2 className="tag-page__status-title">인증할 장소가 없어요</h2>
            <p className="tag-page__status-description">현재 진행 중인 컬렉션이 없어서 NFC 방문 인증을 시작할 수 없습니다.</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={["tag-page", phase === "minting" || phase === "minted" ? "is-mint-stage" : ""].join(" ")}>
      {phase === "minted" && <ConfettiLayer />}
      <main className="tag-page__content">
        <h1 className="tag-page__page-title">방문 인증</h1>

        {phase === "ready" && (
          <>
            <section className="tag-page__status-card">
              <div className="tag-page__icon-shell"><PhoneIcon className="tag-page__status-icon" /></div>
              <h2 className="tag-page__status-title">인증 준비 완료</h2>
              <p className="tag-page__status-description">NFC 태그 UID를 입력하세요</p>
              <input
                className="tag-page__uid-input"
                type="text"
                placeholder="NFC Tag UID 입력"
                value={tagUid}
                onChange={(e) => setTagUid(e.target.value)}
              />
              <button type="button" className="tag-page__primary-button" onClick={handleStartScan} disabled={!tagUid.trim()}>
                인증하기
              </button>
            </section>
            <VerificationGuide />
          </>
        )}

        {phase === "scanning" && (
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell"><PhoneIcon className="tag-page__status-icon tag-page__status-icon--scan" /></div>
            <h2 className="tag-page__status-title">NFC 태그 스캔 중...</h2>
            <p className="tag-page__status-description">Please keep your phone steady</p>
          </section>
        )}

        {phase === "verified" && (
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell is-success"><CheckIcon className="tag-page__status-icon tag-page__status-icon--success" /></div>
            <h2 className="tag-page__status-title">방문 인증 완료!</h2>
            <p className="tag-page__status-description">NFT 발행 중...</p>
          </section>
        )}

        {phase === "minting" && (
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell"><SparklesIcon className="tag-page__status-icon tag-page__status-icon--mint" /></div>
            <h2 className="tag-page__status-title">NFT 발행 중...</h2>
            <p className="tag-page__status-description">고유한 컬렉션을 생성하고 있습니다</p>
          </section>
        )}

        {phase === "error" && (
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell"><PhoneIcon className="tag-page__status-icon" /></div>
            <h2 className="tag-page__status-title">인증 실패</h2>
            <p className="tag-page__status-description">{mintError}</p>
            <button type="button" className="tag-page__primary-button" onClick={() => { setPhase("ready"); setTagUid(""); }}>
              다시 시도
            </button>
          </section>
        )}

        {phase === "minted" && mintedNft && (
          <>
            <section className="tag-page__mint-card">
              <div className="tag-page__mint-image-wrap">
                <PlaceImage className="tag-page__mint-image" src={mintedNft.imageUrl} fallbackSrc={activeCollection.image} alt={mintedNft.name} />
                <div className="tag-page__mint-serial">#NFT</div>
              </div>
              <div className="tag-page__mint-copy">
                <h2 className="tag-page__mint-title">축하합니다!</h2>
                <p className="tag-page__mint-subtitle">NFT 발행 완료</p>
                <p className="tag-page__mint-place">{mintedNft.name}</p>
                <p className="tag-page__mint-location">{mintedNft.rarity}</p>
              </div>
            </section>
            <div className="tag-page__mint-actions">
              <button type="button" className="tag-page__primary-button" onClick={() => navigate(`/nft-gallery/${activeCollection.id}`)}>
                컬렉션 보기
              </button>
              <button type="button" className="tag-page__secondary-button">
                <ShareIcon className="tag-page__secondary-icon" /><span>성과 공유</span>
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
