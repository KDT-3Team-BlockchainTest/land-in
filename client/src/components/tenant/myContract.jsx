import { useState } from "react";
import VacancyModal from "../shared/modal/vacancyModal";
import "./myContract.css";

const ALL_CONTRACTS = [
  { id: 1, name: "강남역 1층 상가", status: "진행 중", statusColor: "#e74c3c", period: "2026.04.01 ~ 2026.06.30", rent: "150만/월", area: "33㎡", deposit: "1,000만" },
  { id: 2, name: "홍대입구 팝업 공간", status: "진행 중", statusColor: "#e74c3c", period: "2026.05.01 ~ 2026.05.31", rent: "80만/월", area: "20㎡", deposit: "500만" },
  { id: 3, name: "성수동 카페거리 2층", status: "예약", statusColor: "#555", period: "2026.06.15 ~ 2026.07.14", rent: "200만/월", area: "45㎡", deposit: "2,000만" },
  { id: 4, name: "이태원 메인로드 1층", status: "지난 계약", statusColor: "#777", period: "2025.09.01 ~ 2025.12.31", rent: "120만/월", area: "28㎡", deposit: "800만" },
  { id: 5, name: "연남동 골목 소형매장", status: "지난 계약", statusColor: "#777", period: "2025.06.01 ~ 2025.08.31", rent: "60만/월", area: "15㎡", deposit: "300만" },
  { id: 6, name: "을지로 빈티지샵 자리", status: "지난 계약", statusColor: "#777", period: "2025.03.01 ~ 2025.05.31", rent: "90만/월", area: "22㎡", deposit: "600만" },
  { id: 7, name: "망원동 브런치카페", status: "지난 계약", statusColor: "#777", period: "2025.01.01 ~ 2025.03.31", rent: "180만/월", area: "40㎡", deposit: "1,500만" },
  { id: 8, name: "합정역 지하1층", status: "지난 계약", statusColor: "#777", period: "2024.10.01 ~ 2024.12.31", rent: "100만/월", area: "50㎡", deposit: "700만" },
  { id: 9, name: "신촌 대학가 매장", status: "취소", statusColor: "#999", period: "2026.03.01 ~ 2026.03.31", rent: "70만/월", area: "18㎡", deposit: "400만" },
];

const TABS = [
  { key: "예약", label: "계약 예약", color: "#555" },
  { key: "진행 중", label: "계약 진행 중", color: "#e74c3c" },
  { key: "지난 계약", label: "지난 계약", color: "#777" },
  { key: "취소", label: "취소된 계약", color: "#999" },
];

export default function MyContract() {
  const [activeTab, setActiveTab] = useState(null);
  const [selected, setSelected] = useState(null);

  const counts = {};
  TABS.forEach((t) => { counts[t.key] = ALL_CONTRACTS.filter((c) => c.status === t.key).length; });

  const filtered = activeTab ? ALL_CONTRACTS.filter((c) => c.status === activeTab) : ALL_CONTRACTS;

  return (
    <div className="contract-page">
      <h2 className="contract-title">나의 계약</h2>

      <div className="contract-stats">
        {TABS.map((t) => (
          <div
            key={t.key}
            className={`stat-box ${activeTab === t.key ? "stat-box--active" : ""}`}
            onClick={() => setActiveTab(activeTab === t.key ? null : t.key)}
          >
            <span className="stat-count" style={{ color: t.color }}>{counts[t.key]}</span>
            <span className="stat-label">{t.label}</span>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="contract-empty">해당 상태의 계약이 없습니다.</div>
      ) : (
        <div className="contract-list">
          {filtered.map((c) => (
            <div key={c.id} className="contract-card" onClick={() => setSelected(c)}>
              <div className="contract-card-header">
                <h4>{c.name}</h4>
                <span className="contract-status" style={{ color: c.statusColor, borderColor: c.statusColor }}>{c.status}</span>
              </div>
              <p className="contract-period">{c.period}</p>
              <p className="contract-rent">월세 ₩{c.rent}</p>
            </div>
          ))}
        </div>
      )}

      <VacancyModal data={selected} onClose={() => setSelected(null)} />
    </div>
  );
}