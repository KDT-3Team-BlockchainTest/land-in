import "./Coupon.css";

export default function Coupon({ coupon, onClick }) {
  return (
    <button type="button" className="coupon" onClick={() => onClick(coupon)}>
      <div className="coupon__image-wrap">
        <img src={coupon.image} alt={coupon.name} className="coupon__image" />
      </div>
      <span className="coupon__brand">{coupon.brand}</span>
      <span className="coupon__name">{coupon.name}</span>
    </button>
  );
}