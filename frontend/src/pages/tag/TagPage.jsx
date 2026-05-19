import "./TagPage.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { adaptCollection } from "../../api/adapters";
import { collectionsApi } from "../../api/collections";
import { nfcApi } from "../../api/nfc";
import { nftsApi } from "../../api/nfts";
import PlaceImage from "../../components/common/PlaceImage/PlaceImage";
import { useLanguage } from "../../i18n/LanguageContext";

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

function VerificationGuide({ t }) {
  return (
    <section className="tag-page__guide-card">
      <h2 className="tag-page__guide-title">{t("tag.guide.title")}</h2>
      <div className="tag-page__guide-list">
        {[
          t("tag.guide.step1"),
          t("tag.guide.step2"),
          t("tag.guide.step3"),
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

function IosTagGuide({ t }) {
  const faqItems = [
    { question: t("tag.ios.faq1.q"), answer: t("tag.ios.faq1.a") },
    { question: t("tag.ios.faq2.q"), answer: t("tag.ios.faq2.a") },
    { question: t("tag.ios.faq3.q"), answer: t("tag.ios.faq3.a") },
  ];

  return (
    <section className="tag-page__guide-card tag-page__guide-card--ios">
      <h2 className="tag-page__guide-title">{t("tag.ios.title")}</h2>
      <div className="tag-page__guide-list">
        {[
          t("tag.ios.step1"),
          t("tag.ios.step2"),
          t("tag.ios.step3"),
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

function formatNfcReadError(error, t) {
  if (!error) return t("tag.nfc.error.default");

  if (error.name === "NotAllowedError") return t("tag.nfc.error.not_allowed");
  if (error.name === "NotSupportedError") return t("tag.nfc.error.not_supported");
  if (error.name === "NotReadableError") return t("tag.nfc.error.not_readable");
  if (error.name === "AbortError") return t("tag.nfc.error.aborted");

  return error.message || t("tag.nfc.error.default");
}

function getMintStatusCopy(mintedNft, t) {
  switch (mintedNft?.mintStatus) {
    case "MINTED_ONCHAIN":
      return {
        title: t("tag.mint.onchain.title"),
        description: mintedNft.tokenId
          ? t("tag.mint.onchain.desc_token", { tokenId: mintedNft.tokenId })
          : t("tag.mint.onchain.desc"),
      };
    case "PENDING_WALLET":
      return {
        title: t("tag.mint.pending_wallet.title"),
        description: t("tag.mint.pending_wallet.desc"),
      };
    case "PENDING_ONCHAIN":
      return {
        title: t("tag.mint.pending_onchain.title"),
        description: mintedNft.mintFailureReason || t("tag.mint.pending_onchain.desc"),
      };
    case "FAILED_ONCHAIN":
      return {
        title: t("tag.mint.failed_onchain.title"),
        description: mintedNft.mintFailureReason || t("tag.mint.failed_onchain.desc"),
      };
    default:
      return {
        title: t("tag.mint.default.title"),
        description: t("tag.mint.default.desc"),
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

async function readTagValueFromDevice(t) {
  if (!isWebNfcSupported()) {
    throw new Error(t("tag.nfc.error.no_browser"));
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
            throw new Error(t("tag.nfc.error.no_value"));
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
        finish(reject, new Error(t("tag.nfc.error.unreadable")));
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
  const { t } = useLanguage();
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
        setMintError(error.message || t("tag.nfc.error.default"));
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
      const value = await readTagValueFromDevice(t);
      setTagUid(value);
      setPhase("scanning");
    } catch (error) {
      setMintError(formatNfcReadError(error, t));
      setPhase("error");
    } finally {
      setNfcReading(false);
    }
  };

  if (!activeCollection) {
    return (
      <div className="tag-page">
        <main className="tag-page__content">
          <h1 className="tag-page__page-title">{t("tag.title")}</h1>
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell">
              <PhoneIcon className="tag-page__status-icon" />
            </div>
            <h2 className="tag-page__status-title">{t("tag.no_collection.title")}</h2>
            <p className="tag-page__status-description">{t("tag.no_collection.desc")}</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={["tag-page", phase === "minting" || phase === "minted" ? "is-mint-stage" : ""].join(" ")}>
      {phase === "minted" && <ConfettiLayer />}
      <main className="tag-page__content">
        <h1 className="tag-page__page-title">{t("tag.title")}</h1>

        {phase === "ready" && (
          <>
            <section className="tag-page__status-card">
              <div className="tag-page__icon-shell">
                <PhoneIcon className="tag-page__status-icon" />
              </div>
              {isIos && !canUseWebNfc && (
                <>
                  <h2 className="tag-page__status-title">{t("tag.ios.ready.title")}</h2>
                  <p className="tag-page__status-description">{t("tag.ios.ready.desc")}</p>
                  <div className="tag-page__platform-note">
                    <p className="tag-page__status-description">{t("tag.ios.note1")}</p>
                    <p className="tag-page__status-description">{t("tag.ios.note2")}</p>
                  </div>
                </>
              )}
              {!(isIos && !canUseWebNfc) && (
                <>
              <h2 className="tag-page__status-title">{t("tag.ready.title")}</h2>
              <p className="tag-page__status-description">{t("tag.ready.desc")}</p>
              <input
                className="tag-page__uid-input"
                type="text"
                placeholder={t("tag.ready.placeholder")}
                value={tagUid}
                onChange={(event) => setTagUid(event.target.value)}
              />
              <button
                type="button"
                className="tag-page__primary-button"
                onClick={handleStartScan}
                disabled={!tagUid.trim() || nfcReading}
              >
                {t("tag.ready.submit")}
              </button>
              {canUseWebNfc && (
                <button
                  type="button"
                  className="tag-page__secondary-button"
                  onClick={handleReadTag}
                  disabled={nfcReading}
                >
                  <PhoneIcon className="tag-page__secondary-icon" />
                  <span>{nfcReading ? t("tag.ready.reading") : t("tag.ready.read_btn")}</span>
                </button>
              )}
              {!canUseWebNfc && (
                <p className="tag-page__status-description">{t("tag.ready.no_nfc")}</p>
              )}
              {!canUseWebNfc && isIos && (
                <div className="tag-page__platform-note">
                  <p className="tag-page__status-description">{t("tag.ios.note1")}</p>
                  <p className="tag-page__status-description">{t("tag.ios.note2")}</p>
                </div>
              )}
                </>
              )}
            </section>
            {isIos && !canUseWebNfc ? <IosTagGuide t={t} /> : <VerificationGuide t={t} />}
          </>
        )}

        {phase === "scanning" && (
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell">
              <PhoneIcon className="tag-page__status-icon tag-page__status-icon--scan" />
            </div>
            <h2 className="tag-page__status-title">{t("tag.scanning.title")}</h2>
            <p className="tag-page__status-description">{t("tag.scanning.value")} {tagUid}</p>
          </section>
        )}

        {phase === "verified" && (
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell is-success">
              <CheckIcon className="tag-page__status-icon tag-page__status-icon--success" />
            </div>
            <h2 className="tag-page__status-title">{t("tag.verified.title")}</h2>
            <p className="tag-page__status-description">{t("tag.verified.desc")}</p>
          </section>
        )}

        {phase === "minting" && (
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell">
              <SparklesIcon className="tag-page__status-icon tag-page__status-icon--mint" />
            </div>
            <h2 className="tag-page__status-title">{t("tag.minting.title")}</h2>
            <p className="tag-page__status-description">{t("tag.minting.desc")}</p>
          </section>
        )}

        {phase === "error" && (
          <section className="tag-page__status-card">
            <div className="tag-page__icon-shell">
              <PhoneIcon className="tag-page__status-icon" />
            </div>
            <h2 className="tag-page__status-title">{t("tag.error.title")}</h2>
            <p className="tag-page__status-description">{mintError}</p>
            <button type="button" className="tag-page__primary-button" onClick={resetToReady}>
              {t("tag.error.retry")}
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
                <h2 className="tag-page__mint-title">{t("tag.minted.congrats")}</h2>
                <p className="tag-page__mint-subtitle">{t("tag.minted.subtitle")}</p>
                <p className="tag-page__mint-place">{mintedNft.name}</p>
                <p className="tag-page__mint-location">{mintedNft.rarity}</p>
                <p className="tag-page__status-description">{getMintStatusCopy(mintedNft, t).title}</p>
                <p className="tag-page__status-description">{getMintStatusCopy(mintedNft, t).description}</p>
                {mintedNft.transactionHash ? (
                  <a
                    className="tag-page__secondary-button"
                    href={getTransactionUrl(mintedNft.transactionHash)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>{t("tag.minted.view_tx")}</span>
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
                {t("tag.minted.view_collection")}
              </button>
              <button type="button" className="tag-page__secondary-button">
                <ShareIcon className="tag-page__secondary-icon" />
                <span>{t("tag.minted.share")}</span>
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
