import { useState, useRef } from "react";
import { useAuth } from "../../../admin/authContxt";
import "./vacancyModal.css";

export default function VacancyModal({ data, onClose, isWishlisted, onToggleWishlist }) {
  const { user } = useAuth();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastFading, setToastFading] = useState(false);
  const toastTimer = useRef(null);

  if (!data) return null;

  const showLoginToast = () => {
    if (toastVisible) return;
    clearTimeout(toastTimer.current);
    setToastVisible(true);
    setToastFading(false);
    toastTimer.current = setTimeout(() => setToastFading(true), 900);
    toastTimer.current = setTimeout(() => { setToastVisible(false); setToastFading(false); }, 1300);
  };

  const guard = (action) => (e) => {
    e?.stopPropagation();
    if (!user) { showLoginToast(); return; }
    action(e);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-thumb" style={{ background: data.color || "#e8edf4" }}>
          <span>🏢</span>
          {data.hot && <span className="modal-hot-badge">HOT</span>}
        </div>

        <div className="modal-name-row">
          <h3 className="modal-name">{data.name}</h3>
          {onToggleWishlist && (
            <button
              className={`modal-heart-btn${isWishlisted ? " active" : ""}`}
              onClick={guard(() => onToggleWishlist())}
              title={isWishlisted ? "찜 해제" : "찜하기"}
            >
              {isWishlisted ? "♥" : "♡"}
            </button>
          )}
        </div>

        <span
          className="modal-status"
          style={data.verified
            ? { color: "#4A7CFF", borderColor: "#4A7CFF" }
            : { color: "#999", borderColor: "#ccc" }
          }
        >
          {data.verified ? "인증 매물" : "일반 매물"}
        </span>

        <div className="modal-details">
          {data.address && (
            <div className="modal-row">
              <span className="modal-label">주소</span>
              <span className="modal-value">{data.address}</span>
            </div>
          )}
          {data.area && (
            <div className="modal-row">
              <span className="modal-label">면적</span>
              <span className="modal-value">{data.area}</span>
            </div>
          )}
          {data.rent && (
            <div className="modal-row">
              <span className="modal-label">월세</span>
              <span className="modal-value">₩{data.rent}</span>
            </div>
          )}
          {data.deposit && (
            <div className="modal-row">
              <span className="modal-label">보증금</span>
              <span className="modal-value">₩{data.deposit}</span>
            </div>
          )}
          {data.period && (
            <div className="modal-row">
              <span className="modal-label">계약 기간</span>
              <span className="modal-value">{data.period}</span>
            </div>
          )}
        </div>

        <div className="modal-section">
          <h4>위치</h4>
          <div className="modal-map-placeholder">
            <p>지도 준비 중</p>
          </div>
        </div>

        <div className="modal-section">
          <h4>상세 설명</h4>
          <p className="modal-desc">
            쾌적한 환경의 상업 공간입니다. 대중교통 접근성이 좋으며 유동 인구가 많아 다양한 업종에 적합합니다.
          </p>
        </div>

        <div className="modal-actions">
          <button className="modal-btn-inquiry" onClick={guard(onClose)}>문의하기</button>
          <button className="modal-btn-apply" onClick={guard(onClose)}>계약 신청</button>
        </div>
      </div>

      {toastVisible && (
        <div className={`login-toast${toastFading ? " fading" : ""}`}>
          로그인 후 이용해주세요.
        </div>
      )}
    </div>
  );
}
