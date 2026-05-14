import "./confirmModal.css";

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  if (!message) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-close" onClick={onCancel}>✕</button>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn-cancel" onClick={onCancel}>취소</button>
          <button className="confirm-btn-ok" onClick={onConfirm}>확인</button>
        </div>
      </div>
    </div>
  );
}