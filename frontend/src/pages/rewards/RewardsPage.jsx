import "./RewardsPage.css";
import { useState } from "react";
import Coupon from "../../components/common/Coupon/Coupon.jsx";
import CouponWindow from "../../components/common/CouponWindow/CouponWindow.jsx";
import { useLanguage } from "../../i18n/LanguageContext";

const dummyCoupons = [
  {
    id: 1,
    brand: "버거킹",
    name: "불고기와퍼+콜라L+21치즈스틱",
    image: "/burger-coupon.jpeg",
    barcode: "1 234 5678 9101 1121 3141 5161",
  },
  {
    id: 2,
    brand: "버거킹",
    name: "불고기와퍼+콜라L+21치즈스틱",
    image: "https://via.placeholder.com/200x200.png?text=Burger+2",
    barcode: "2 345 6789 0123 4567 8901 2345",
  },
  {
    id: 3,
    brand: "버거킹",
    name: "치킨버거+콜라M",
    image: "https://via.placeholder.com/200x200.png?text=Burger+3",
    barcode: "3 456 7890 1234 5678 9012 3456",
  },
  {
    id: 4,
    brand: "스타벅스",
    name: "아이스 아메리카노 T",
    image: "https://via.placeholder.com/200x200.png?text=Coffee+1",
    barcode: "4 567 8901 2345 6789 0123 4567",
  },
  {
    id: 5,
    brand: "GS25",
    name: "모바일 상품권 5000원",
    image: "https://via.placeholder.com/200x200.png?text=Gift+1",
    barcode: "5 678 9012 3456 7890 1234 5678",
  },
  {
    id: 6,
    brand: "CU",
    name: "삼각김밥 2개 교환권",
    image: "https://via.placeholder.com/200x200.png?text=Gift+2",
    barcode: "6 789 0123 4567 8901 2345 6789",
  },
];

export default function RewardsPage() {
  const { t } = useLanguage();
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [searchText, setSearchText] = useState("");

  const filtered = dummyCoupons.filter(
    (c) => c.name.includes(searchText) || c.brand.includes(searchText)
  );

  return (
    <>
      <div className="page-layout">
        <main className="page-layout__content">
          <section className="rewards-page__intro">
            <h1 className="page-title rewards-page__title">{t("rewards.title")}</h1>
            <p className="page-subtitle">{t("rewards.subtitle")}</p>
          </section>

          {/* 포인트 요약 */}
          <section className="rewards-page__points-card">
            <div className="rewards-page__point-row">
              <span className="rewards-page__point-label">현재 보유 포인트 :</span>
              <span className="rewards-page__point-value"><strong>7,958</strong> P</span>
            </div>
            <div className="rewards-page__point-row">
              <span className="rewards-page__point-label">소멸 예정 포인트 :</span>
              <span className="rewards-page__point-value"><strong>2,261</strong> P</span>
            </div>
            {/* <div className="rewards-page__point-row">
              <span className="rewards-page__point-label">적립 예정 포인트 :</span>
              <span className="rewards-page__point-value"><strong>130</strong> P</span>
            </div> */}
          </section>

          {/* 필터 + 검색 */}
          <section className="rewards-page__filter-bar">
            <select className="rewards-page__select">
              <option>선택</option>
              <option>버거킹</option>
              <option>스타벅스</option>
              <option>GS25</option>
              <option>CU</option>
            </select>
            <input
              type="text"
              className="rewards-page__search"
              placeholder="상품을 검색하세요."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </section>

          {/* 쿠폰 갤러리 */}
          <section className="rewards-page__gallery">
            {filtered.map((coupon) => (
              <Coupon key={coupon.id} coupon={coupon} onClick={setSelectedCoupon} />
            ))}
          </section>
        </main>
      </div>

      {selectedCoupon && (
        <CouponWindow coupon={selectedCoupon} onClose={() => setSelectedCoupon(null)} />
      )}
    </>
  );
}