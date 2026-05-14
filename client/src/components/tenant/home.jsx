import { useState } from "react";
import VacancyModal from "../shared/modal/vacancyModal";
import "./home.css";

const MOCK_VACANCIES = [
  { id: 1, name: "강남 프리미엄 리테일 공간", address: "서울시 강남구 테헤란로 123", area: "33㎡", rent: "300만/월", deposit: "3,000만", verified: true, hot: true, lat: 37.498, lng: 127.028, color: "#e8d5b7" },
  { id: 2, name: "홍대 아늑한 카페 공간", address: "서울시 마포구 홍익로 45", area: "20㎡", rent: "200만/월", deposit: "2,000만", verified: true, hot: true, lat: 37.557, lng: 126.924, color: "#c4a882" },
  { id: 3, name: "여의도 프리미엄 오피스", address: "서울시 영등포구 여의대로 108", area: "45㎡", rent: "800만/월", deposit: "8,000만", verified: true, hot: true, lat: 37.525, lng: 126.925, color: "#7b9cc4" },
  { id: 9, name: "잠실 롯데타워 프리미엄", address: "서울시 송파구 올림픽로 300", area: "60㎡", rent: "500만/월", deposit: "5,000만", verified: true, hot: true, lat: 37.513, lng: 127.102, color: "#a8c4e0" },
  { id: 10, name: "신사동 가로수길 팝업", address: "서울시 강남구 가로수길 50", area: "25㎡", rent: "280만/월", deposit: "2,800만", verified: true, hot: true, lat: 37.521, lng: 127.023, color: "#d4b896" },
  { id: 4, name: "성수동 트렌디 팝업 스토어", address: "서울시 성동구 서울숲길 33", area: "28㎡", rent: "250만/월", deposit: "2,500만", verified: false, hot: false, lat: 37.544, lng: 127.056 },
  { id: 5, name: "이태원 메인로드 1층 상가", address: "서울시 용산구 이태원로 77", area: "35㎡", rent: "350만/월", deposit: "3,500만", verified: false, hot: false, lat: 37.534, lng: 126.994 },
  { id: 6, name: "연남동 감성 소형 매장", address: "서울시 마포구 연남로 12", area: "15㎡", rent: "120만/월", deposit: "1,000만", verified: false, hot: false, lat: 37.566, lng: 126.918 },
  { id: 7, name: "을지로 빈티지 컨셉 공간", address: "서울시 중구 을지로 28", area: "22㎡", rent: "180만/월", deposit: "1,500만", verified: false, hot: false, lat: 37.566, lng: 126.991 },
  { id: 8, name: "합정역 복합문화 공간", address: "서울시 마포구 양화로 55", area: "50㎡", rent: "400만/월", deposit: "4,000만", verified: false, hot: false, lat: 37.549, lng: 126.914 },
  { id: 11, name: "망원동 브런치 카페 공간", address: "서울시 마포구 망원로 88", area: "30㎡", rent: "160만/월", deposit: "1,200만", verified: false, hot: false, lat: 37.556, lng: 126.909 },
  { id: 12, name: "건대입구 먹자골목 매장", address: "서울시 광진구 능동로 120", area: "20㎡", rent: "140만/월", deposit: "1,000만", verified: false, hot: false, lat: 37.540, lng: 127.070 },
];

const HOT_PLACES = MOCK_VACANCIES.filter((v) => v.hot);
const RECOMMENDED = MOCK_VACANCIES.filter((v) => !v.hot);

export default function Home() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="home">
      <div className="home-body">
        <div className="home-left">
          <div className="map-container">
            <div className="map-grid" />

            {MOCK_VACANCIES.map((v) => (
              <div
                key={v.id}
                className={`map-pin2 ${v.verified ? "map-pin2--verified" : ""}`}
                style={{
                  top: `${(37.58 - v.lat) * 2800}px`,
                  left: `${(v.lng - 126.9) * 2200}px`,
                }}
                title={v.name}
                onClick={() => setSelected(v)}
              />
            ))}

            <div className="map-legend">
              <span className="legend-item"><span className="legend-dot verified" /> 인증 매물</span>
              <span className="legend-item"><span className="legend-dot normal" /> 일반</span>
            </div>

            <button className="map-locate-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A7CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            </button>
          </div>
        </div>

        <div className="home-right">
          <div className="home-card">
            <div className="home-card-header">
              <h3><span className="header-icon">📈</span> 요즘 뜨는 핫플레이스</h3>
              <span className="header-chevron">&rsaquo;</span>
            </div>
            <div className="listing-list">
              {HOT_PLACES.map((v) => (
                <div key={v.id} className="listing-item" onClick={() => setSelected(v)}>
                  <div className="listing-thumb" style={{ background: v.color || "#ddd" }}>
                    <span>🏢</span>
                  </div>
                  <div className="listing-info">
                    <div className="listing-name-row">
                      <h4>{v.name}</h4>
                      {v.verified && <span className="badge-verified">인증</span>}
                    </div>
                    <p className="listing-address">{v.address}</p>
                    <p className="listing-price">₩{v.rent}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="home-card">
            <div className="home-card-header">
              <h3><span className="header-icon">📍</span> 근처 추천 공실</h3>
              <span className="header-chevron">&rsaquo;</span>
            </div>
            <div className="listing-list">
              {RECOMMENDED.map((v) => (
                <div key={v.id} className="listing-item" onClick={() => setSelected(v)}>
                  <div className="listing-thumb" style={{ background: v.color || "#bbb" }}>
                    <span>🏢</span>
                  </div>
                  <div className="listing-info">
                    <div className="listing-name-row">
                      <h4>{v.name}</h4>
                      {v.verified && <span className="badge-verified">인증</span>}
                    </div>
                    <p className="listing-address">{v.address}</p>
                    <p className="listing-price">₩{v.rent}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <VacancyModal data={selected} onClose={() => setSelected(null)} />
    </div>
  );
}