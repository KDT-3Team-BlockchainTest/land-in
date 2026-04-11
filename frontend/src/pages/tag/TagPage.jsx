import "./TagPage.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { adaptCollection } from "../../api/adapters";
import { collectionsApi } from "../../api/collections";
import { nfcApi } from "../../api/nfc";
import { nftsApi } from "../../api/nfts";
import PlaceImage from "../../components/common/PlaceImage/PlaceImage";

const VERIFY_DELAY_MS = 2500;
const VERIFIED_DELAY_MS = 1700;
const MINT_POLL_INTERVAL_MS = 3000;
const MINT_POLL_TIMEOUT_MS = 45000;
const HOODI_EXPLORER_BASE_URL = "https://hoodi.etherscan.io";

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
        {[
          "랜드마크의 NFC 태그를 찾으세요.",
          "휴대폰을 태그에 가까이 대세요.",
          "스캔 후 NFT 발행이 끝날 때까지 기다리세요.",
        ].map((step, index) => (
          <div key={step} className="tag-page__guide-item">
            <span className="tag-page__guide-number">{index + 1}</span>
            <p>{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function IosTagGuide() {
  const faqItems = [
    {
      question: "Why is there no read button on iPhone?",
      answer: "Safari does not let websites start NFC scans directly, so iPhone cannot use the same in-page scan button as Android.",
    },
    {
      question: "How do I tag on iPhone?",
      answer: "Keep this page open, then place the top of your iPhone near the real NFC tag. The tag should open Land-in automatically.",
    },
    {
      question: "What if nothing happens?",
      answer: "Check that the NFC tag is programmed with a Land-in URL, the phone is unlocked, and you already finished login, wallet connection, and event join.",
    },
  ];

  return (
    <section className="tag-page__guide-card tag-page__guide-card--ios">
      <h2 className="tag-page__guide-title">iPhone Tag Guide</h2>
      <div className="tag-page__guide-list">
        {[
          "Stay on this page after login.",
          "Hold the top edge of your iPhone close to the physical NFC tag.",
          "When Land-in opens with the tag URL, verification starts automatically.",
        ].map((step, index) => (
          <div key={step} className="tag-page__guide-item">
            <span className="tag-page__guide-number">{index + 1}</span>
            <p>{step}</p>
          </div>
        ))}
      </div>
      <div className="tag-page__faq-list">
        {faqItems.map((item) => (
          <article key={item.question} className="tag-page__faq-item">
            <h3 className="tag-page__faq-question">{item.question}</h3>
            <p className="tag-page__faq-answer">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
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

function parseTagValueFromUrl(value) {
  try {
    const url = new URL(value);
    const fromQuery = url.searchParams.get("tagUid");
    if (fromQuery) return fromQuery.trim();

    const pathSegments = url.pathname.split("/").filter(Boolean);
    if (pathSegments.length > 0) return pathSegments[pathSegments.length - 1].trim();
  } catch {
    // not a URL, fall through
  }

  return value.trim();
}

function decodeTextRecord(record) {
  const rawValue = new TextDecoder(record.encoding || "utf-8").decode(record.data).trim();
  if (/^TAG-[A-Z0-9-]+$/i.test(rawValue)) {
    return rawValue;
  }
  return "";
}

function decodeRecordValue(record) {
  if (!record?.data) return "";

  if (record.recordType === "text") {
    return decodeTextRecord(record);
  }

  if (record.recordType === "url" || record.recordType === "absolute-url") {
    return parseTagValueFromUrl(new TextDecoder().decode(record.data));
  }

  if (record.recordType === "mime" && record.mediaType === "application/json") {
    try {
      const payload = JSON.parse(new TextDecoder().decode(record.data));
      if (typeof payload.tagUid === "string") return payload.tagUid.trim();
    } catch {
      return "";
    }
  }

  if (typeof record.toRecords === "function") {
    try {
      const nestedRecords = record.toRecords();
      for (const nestedRecord of nestedRecords) {
        const nestedValue = decodeRecordValue(nestedRecord);
        if (nestedValue) return nestedValue;
      }
    } catch {
      return "";
    }
  }

  return "";
}

function isWebNfcSupported() {
  return typeof window !== "undefined" && "NDEFReader" in window;
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function formatNfcReadError(error) {
  if (!error) return "NFC 태그를 읽지 못했습니다.";

  if (error.name === "NotAllowedError") return "브라우저의 NFC 권한을 허용해 주세요.";
  if (error.name === "NotSupportedError") return "이 기기나 브라우저는 Web NFC를 지원하지 않습니다.";
  if (error.name === "NotReadableError") return "태그를 읽을 수 없습니다. 다시 가까이 대보세요.";
  if (error.name === "AbortError") return "NFC 읽기가 취소되었습니다.";

  return error.message || "NFC 태그를 읽지 못했습니다.";
}

function getMintStatusCopy(mintedNft) {
  switch (mintedNft?.mintStatus) {
    case "MINTED_ONCHAIN":
      return {
        title: "On-chain mint completed",
        description: mintedNft.tokenId
          ? `Token #${mintedNft.tokenId} was minted on Hoodi.`
          : "The NFT was minted on Hoodi and recorded on-chain.",
      };
    case "PENDING_WALLET":
      return {
        title: "Wallet connection required",
        description: "The NFC proof is saved. Connect your wallet to continue the on-chain mint.",
      };
    case "PENDING_ONCHAIN":
      return {
        title: "On-chain mint pending",
        description: mintedNft.mintFailureReason || "The NFT was created off-chain and is waiting for the blockchain mint.",
      };
    case "FAILED_ONCHAIN":
      return {
        title: "On-chain mint needs retry",
        description: mintedNft.mintFailureReason || "The NFC proof is saved, but the blockchain mint did not finish.",
      };
    default:
      return {
        title: "Off-chain record saved",
        description: "The NFT record was created in Land-in, but no on-chain result is available yet.",
      };
  }
}

function getTransactionUrl(transactionHash) {
  if (!transactionHash) return "";
  return `${HOODI_EXPLORER_BASE_URL}/tx/${transactionHash}`;
}

function shouldPollMintStatus(mintedNft) {
  return mintedNft?.id && mintedNft.mintStatus === "PENDING_ONCHAIN";
}

async function readTagValueFromDevice() {
  if (!isWebNfcSupported()) {
    throw new Error("이 브라우저에서는 NFC 직접 읽기를 사용할 수 없습니다.");
  }

  const reader = new window.NDEFReader();
  const controller = new AbortController();

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      controller.abort();
      callback(value);
    };

    reader.addEventListener(
      "reading",
      (event) => {
        try {
          let resolvedValue = event.serialNumber?.trim() ?? "";

          for (const record of event.message.records) {
            const recordValue = decodeRecordValue(record);
            if (recordValue) {
              resolvedValue = recordValue;
              break;
            }
          }

          if (!resolvedValue) {
            throw new Error("태그에서 사용할 값을 찾지 못했습니다.");
          }

          finish(resolve, resolvedValue);
        } catch (error) {
          finish(reject, error);
        }
      },
      { once: true },
    );

    reader.addEventListener(
      "readingerror",
      () => {
        finish(reject, new Error("태그 내용을 읽을 수 없습니다."));
      },
      { once: true },
    );

    reader.scan({ signal: controller.signal }).catch((error) => {
      finish(reject, error);
    });
  });
}

export default function TagPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [collections, setCollections] = useState([]);
  const [phase, setPhase] = useState("ready");
  const [tagUid, setTagUid] = useState("");
  const [mintedNft, setMintedNft] = useState(null);
  const [mintError, setMintError] = useState("");
  const [nfcReading, setNfcReading] = useState(false);
  const lastAutoVerifiedTagRef = useRef("");

  useEffect(() => {
    collectionsApi
      .list("ongoing")
      .then((list) => setCollections((list ?? []).map((collection) => adaptCollection(collection))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const tagUidFromQuery = searchParams.get("tagUid")?.trim();
    if (!tagUidFromQuery) return;
    if (phase !== "ready") return;
    if (lastAutoVerifiedTagRef.current === tagUidFromQuery) return;

    lastAutoVerifiedTagRef.current = tagUidFromQuery;
    setMintError("");
    setTagUid(tagUidFromQuery);
    setPhase("scanning");
  }, [phase, searchParams]);

  useEffect(() => {
    if (phase !== "scanning") return;

    const timer = setTimeout(() => setPhase("verified"), VERIFY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "verified") return;

    const timer = setTimeout(async () => {
      setPhase("minting");

      try {
        const result = await nfcApi.verify(tagUid);
        setMintedNft(result.mintedNft);
        setPhase("minted");
      } catch (error) {
        setMintError(error.message || "NFC 인증에 실패했습니다.");
        setPhase("error");
      }
    }, VERIFIED_DELAY_MS);

    return () => clearTimeout(timer);
  }, [phase, tagUid]);

  useEffect(() => {
    if (!shouldPollMintStatus(mintedNft)) return undefined;

    let cancelled = false;
    const startedAt = Date.now();

    const poll = async () => {
      try {
        const refreshed = await nftsApi.getById(mintedNft.id);
        if (cancelled || !refreshed) return;

        setMintedNft(refreshed);
        if (refreshed.mintStatus !== "PENDING_ONCHAIN") {
          return;
        }

        if (Date.now() - startedAt < MINT_POLL_TIMEOUT_MS) {
          setTimeout(poll, MINT_POLL_INTERVAL_MS);
        }
      } catch {
        if (!cancelled && Date.now() - startedAt < MINT_POLL_TIMEOUT_MS) {
          setTimeout(poll, MINT_POLL_INTERVAL_MS);
        }
      }
    };

    const timer = setTimeout(poll, MINT_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [mintedNft]);

  const activeCollection = collections[0] ?? null;
  const canUseWebNfc = isWebNfcSupported();
  const isIos = isIosDevice();

  const resetToReady = () => {
    setPhase("ready");
    setTagUid("");
    setMintError("");
    setMintedNft(null);
  };

  const handleStartScan = () => {
    if (!tagUid.trim()) return;
    setMintError("");
    setPhase("scanning");
  };

  const handleReadTag = async () => {
    setMintError("");
    setNfcReading(true);

    try {
      const value = await readTagValueFromDevice();
      setTagUid(value);
      setPhase("scanning");
    } catch (error) {
      setMintError(formatNfcReadError(error));
      setPhase("error");
    } finally {
      setNfcReading(false);
    }
  };

  if (!activeCollection) {
    return (
      <div className="tag-page">
        <main className="tag-page__content">
          <h1 className="tag-page__page-title">방문 인증</h1>
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell">
              <PhoneIcon className="tag-page__status-icon" />
            </div>
            <h2 className="tag-page__status-title">인증할 컬렉션이 없어요</h2>
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
      {phase === "minted" && <ConfettiLayer />}
      <main className="tag-page__content">
        <h1 className="tag-page__page-title">방문 인증</h1>

        {phase === "ready" && (
          <>
            <section className="tag-page__status-card">
              <div className="tag-page__icon-shell">
                <PhoneIcon className="tag-page__status-icon" />
              </div>
              {isIos && !canUseWebNfc && (
                <>
                  <h2 className="tag-page__status-title">Ready To Tag On iPhone</h2>
                  <p className="tag-page__status-description">
                    Place the top of your iPhone near the real NFC tag. The tag should open Land-in and continue the verification automatically.
                  </p>
                  <div className="tag-page__platform-note">
                    <p className="tag-page__status-description">
                      There is no in-page scan button on iPhone because Safari does not expose Web NFC to websites.
                    </p>
                    <p className="tag-page__status-description">
                      The physical NFC tag must open a Land-in URL like `/tag?tagUid=...` when tapped.
                    </p>
                  </div>
                </>
              )}
              {!(isIos && !canUseWebNfc) && (
                <>
              <h2 className="tag-page__status-title">인증 준비 완료</h2>
              <p className="tag-page__status-description">
                태그를 직접 읽거나, 테스트용 tag UID를 입력해 주세요.
              </p>
              <input
                className="tag-page__uid-input"
                type="text"
                placeholder="예: TAG-SEOUL-001"
                value={tagUid}
                onChange={(event) => setTagUid(event.target.value)}
              />
              <button
                type="button"
                className="tag-page__primary-button"
                onClick={handleStartScan}
                disabled={!tagUid.trim() || nfcReading}
              >
                입력값으로 인증하기
              </button>
              {canUseWebNfc && (
                <button
                  type="button"
                  className="tag-page__secondary-button"
                  onClick={handleReadTag}
                  disabled={nfcReading}
                >
                  <PhoneIcon className="tag-page__secondary-icon" />
                  <span>{nfcReading ? "태그 읽는 중..." : "휴대폰으로 태그 읽기"}</span>
                </button>
              )}
              {!canUseWebNfc && (
                <p className="tag-page__status-description">
                  이 브라우저에서는 직접 읽기를 지원하지 않아 테스트용 값 입력 방식만 사용할 수 있습니다.
                </p>
              )}
              {!canUseWebNfc && isIos && (
                <div className="tag-page__platform-note">
                  <p className="tag-page__status-description">
                    iPhone Safari does not expose Web NFC to websites, so the in-page read button cannot be shown.
                  </p>
                  <p className="tag-page__status-description">
                    To support iPhone, the NFC tag itself needs to open a Land-in URL like `/tag?tagUid=...` when tapped.
                  </p>
                </div>
              )}
                </>
              )}
            </section>
            {isIos && !canUseWebNfc ? <IosTagGuide /> : <VerificationGuide />}
          </>
        )}

        {phase === "scanning" && (
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell">
              <PhoneIcon className="tag-page__status-icon tag-page__status-icon--scan" />
            </div>
            <h2 className="tag-page__status-title">NFC 인증 확인 중...</h2>
            <p className="tag-page__status-description">태그 값: {tagUid}</p>
          </section>
        )}

        {phase === "verified" && (
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell is-success">
              <CheckIcon className="tag-page__status-icon tag-page__status-icon--success" />
            </div>
            <h2 className="tag-page__status-title">방문 인증 완료</h2>
            <p className="tag-page__status-description">NFT를 발행하고 있어요.</p>
          </section>
        )}

        {phase === "minting" && (
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell">
              <SparklesIcon className="tag-page__status-icon tag-page__status-icon--mint" />
            </div>
            <h2 className="tag-page__status-title">NFT 발행 중...</h2>
            <p className="tag-page__status-description">컬렉션 보상을 준비하고 있습니다.</p>
          </section>
        )}

        {phase === "error" && (
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell">
              <PhoneIcon className="tag-page__status-icon" />
            </div>
            <h2 className="tag-page__status-title">인증 실패</h2>
            <p className="tag-page__status-description">{mintError}</p>
            <button type="button" className="tag-page__primary-button" onClick={resetToReady}>
              다시 시도
            </button>
          </section>
        )}

        {phase === "minted" && mintedNft && (
          <>
            <section className="tag-page__mint-card">
              <div className="tag-page__mint-image-wrap">
                <PlaceImage
                  className="tag-page__mint-image"
                  src={mintedNft.imageUrl}
                  fallbackSrc={activeCollection.image}
                  alt={mintedNft.name}
                />
                <div className="tag-page__mint-serial">#NFT</div>
              </div>
              <div className="tag-page__mint-copy">
                <h2 className="tag-page__mint-title">축하합니다</h2>
                <p className="tag-page__mint-subtitle">NFT 발행 완료</p>
                <p className="tag-page__mint-place">{mintedNft.name}</p>
                <p className="tag-page__mint-location">{mintedNft.rarity}</p>
                <p className="tag-page__status-description">{getMintStatusCopy(mintedNft).title}</p>
                <p className="tag-page__status-description">{getMintStatusCopy(mintedNft).description}</p>
                {mintedNft.transactionHash ? (
                  <a
                    className="tag-page__secondary-button"
                    href={getTransactionUrl(mintedNft.transactionHash)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>View transaction</span>
                  </a>
                ) : null}
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
                <span>결과 공유</span>
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
