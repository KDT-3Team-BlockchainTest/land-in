import "./CouponWindow.css";

export default function CouponWindow({ coupon, onClose }) {
  if (!coupon) return null;

  const barcodePattern = [2,1,3,1,1,2,1,3,2,1,1,1,2,1,3,1,2,1,1,2,3,1,1,2,1,1,2,3,1,2,1,1,3,1,2,1,1,2,1,3,1,1,2,1,2,3,1,1,2,1,1,3,2,1,1,2,1,1,3,1,2,1,2,1,1,3,1,2,1,1,2,3,1,1,2,1,3,1,1,2,1,1];

  const bars = [];
  let totalWidth = 0;
  barcodePattern.forEach((w) => { totalWidth += w * 1.8 + 0.8; });
  const startX = (400 - totalWidth) / 2;
  let x = startX;
  barcodePattern.forEach((w, i) => {
    if (i % 2 === 0) {
      bars.push(<rect key={i} x={x} y="10" width={w * 1.8} height="90" fill="#111827" />);
    }
    x += w * 1.8 + 0.8;
  });

  return (
    <div className="coupon-window__overlay" onClick={onClose}>
      <div className="coupon-window" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="coupon-window__close" onClick={onClose}>
          ✕
        </button>

        <div className="coupon-window__image-wrap">
          <img src={coupon.image} alt={coupon.name} className="coupon-window__image" />
        </div>

        <span className="coupon-window__brand">{coupon.brand}</span>
        <span className="coupon-window__name">{coupon.name}</span>

        <div className="coupon-window__barcode-area">
          <svg
            className="coupon-window__barcode-svg"
            viewBox="0 0 400 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            {bars}
          </svg>
          <p className="coupon-window__barcode-number">{coupon.barcode}</p>
        </div>
      </div>
    </div>
  );
}