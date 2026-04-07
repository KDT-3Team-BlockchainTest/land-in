import "./TagPage.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlaceImage from "../../components/common/PlaceImage/PlaceImage";
import { getTagDashboard } from "../../data/dashboard";
import useJoinedEventIds from "../../hooks/useJoinedEventIds";

const VERIFY_DELAY_MS = 2500;
const VERIFIED_DELAY_MS = 1700;
const MINT_DELAY_MS = 2500;

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
  const steps = [
    "랜드마크의 NFC 태그를 찾으세요.",
    "휴대폰을 태그에 가까이 대세요.",
    "확인 메시지가 나올 때까지 기다리세요.",
  ];

  return (
    <section className="tag-page__guide-card">
      <h2 className="tag-page__guide-title">사용 방법</h2>
      <div className="tag-page__guide-list">
        {steps.map((step, index) => (
          <div key={step} className="tag-page__guide-item">
            <span className="tag-page__guide-number">{index + 1}</span>
            <p>{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function buildMintedNft(activeCollection, currentStep) {
  const nextSerialNumber =
    activeCollection.collectedNfts.length > 0
      ? Number.parseInt(
          activeCollection.collectedNfts[activeCollection.collectedNfts.length - 1].serial.replace("#", ""),
          10,
        ) + 1
      : 1201;

  return {
    title: currentStep.title,
    location: currentStep.subtitle.replace("@", "").trim(),
    image: currentStep.image,
    serial: `#${nextSerialNumber}`,
  };
}

function ConfettiLayer() {
  const pieces = Array.from({ length: 24 }, (_, index) => ({
    id: index,
    left: `${4 + ((index * 4.1) % 92)}%`,
    delay: `${(index % 8) * 90}ms`,
    duration: `${2200 + (index % 5) * 220}ms`,
    rotation: `${(index % 6) * 18}deg`,
  }));

  return (
    <div className="tag-page__confetti" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={piece.id % 3 === 0 ? "is-dot" : ""}
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            transform: `rotate(${piece.rotation})`,
          }}
        />
      ))}
    </div>
  );
}

export default function TagPage() {
  const navigate = useNavigate();
  const { joinedEventIds } = useJoinedEventIds();
  const { activeCollections } = getTagDashboard(joinedEventIds);
  const activeCollection = activeCollections[0] ?? null;
  const currentStep = useMemo(
    () => activeCollection?.routeSteps?.find((step) => step.stepState === "current") ?? null,
    [activeCollection],
  );
  const mintedNft = useMemo(() => {
    if (!activeCollection || !currentStep) {
      return null;
    }

    return buildMintedNft(activeCollection, currentStep);
  }, [activeCollection, currentStep]);
  const [phase, setPhase] = useState("ready");

  useEffect(() => {
    if (phase !== "scanning") {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPhase("verified");
    }, VERIFY_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "verified") {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPhase("minting");
    }, VERIFIED_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "minting") {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPhase("minted");
    }, MINT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [phase]);

  if (!activeCollection || !currentStep || !mintedNft) {
    return (
      <div className="tag-page">
        <main className="tag-page__content">
          <h1 className="tag-page__page-title">방문 인증</h1>

          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell">
              <PhoneIcon className="tag-page__status-icon" />
            </div>
            <h2 className="tag-page__status-title">인증할 장소가 없어요</h2>
            <p className="tag-page__status-description">
              현재 진행 중인 컬렉션이 없어서 NFC 방문 인증을 시작할 수 없습니다.
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={["tag-page", phase === "minting" || phase === "minted" ? "is-mint-stage" : ""].join(" ")}>
      {phase === "minted" ? <ConfettiLayer /> : null}

      <main className="tag-page__content">
        <h1 className="tag-page__page-title">방문 인증</h1>

        {phase === "ready" ? (
          <>
            <section className="tag-page__status-card">
              <div className="tag-page__icon-shell">
                <PhoneIcon className="tag-page__status-icon" />
              </div>
              <h2 className="tag-page__status-title">인증 준비 완료</h2>
              <p className="tag-page__status-description">Position your phone near the NFC tag</p>
              <button type="button" className="tag-page__primary-button" onClick={() => setPhase("scanning")}>
                인증하기
              </button>
            </section>

            <VerificationGuide />
          </>
        ) : null}

        {phase === "scanning" ? (
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell">
              <PhoneIcon className="tag-page__status-icon tag-page__status-icon--scan" />
            </div>
            <h2 className="tag-page__status-title">NFC 태그 스캔 중...</h2>
            <p className="tag-page__status-description">Please keep your phone steady</p>
          </section>
        ) : null}

        {phase === "verified" ? (
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell is-success">
              <CheckIcon className="tag-page__status-icon tag-page__status-icon--success" />
            </div>
            <h2 className="tag-page__status-title">방문 인증 완료!</h2>
            <p className="tag-page__status-description">Preparing to mint your NFT...</p>
          </section>
        ) : null}

        {phase === "minting" ? (
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell">
              <SparklesIcon className="tag-page__status-icon tag-page__status-icon--mint" />
            </div>
            <h2 className="tag-page__status-title">NFT 발행 중...</h2>
            <p className="tag-page__status-description">고유한 컬렉션을 생성하고 있습니다</p>
          </section>
        ) : null}

        {phase === "minted" ? (
          <>
            <section className="tag-page__mint-card">
              <div className="tag-page__mint-image-wrap">
                <PlaceImage
                  className="tag-page__mint-image"
                  src={mintedNft.image}
                  fallbackSrc={activeCollection.image}
                  alt={mintedNft.title}
                />
                <div className="tag-page__mint-serial">{mintedNft.serial}</div>
              </div>

              <div className="tag-page__mint-copy">
                <h2 className="tag-page__mint-title">축하합니다!</h2>
                <p className="tag-page__mint-subtitle">NFT 발행 완료</p>
                <p className="tag-page__mint-place">{mintedNft.title}</p>
                <p className="tag-page__mint-location">{mintedNft.location}</p>
              </div>
            </section>

            <div className="tag-page__mint-actions">
              <button
                type="button"
                className="tag-page__primary-button"
                onClick={() => navigate(`/nft-gallery/${activeCollection.id}`)}
              >
                컬렉션 보기
              </button>
              <button type="button" className="tag-page__secondary-button">
                <ShareIcon className="tag-page__secondary-icon" />
                <span>성과 공유</span>
              </button>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
