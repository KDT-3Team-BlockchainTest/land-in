import { useState } from "react";
import VacancyModal from "../shared/modal/vacancyModal";
import ConfirmModal from "../shared/modal/confirmModal";
import "./wishlist.css";

const INITIAL_SAVED = [
  { id: 1, name: "강남역 1층 상가", area: "33㎡", rent: "150만/월", deposit: "1,000만" },
  { id: 2, name: "홍대입구 팝업 공간", area: "20㎡", rent: "80만/월", deposit: "500만" },
  { id: 3, name: "성수동 카페거리 2층", area: "45㎡", rent: "200만/월", deposit: "2,000만" },
  { id: 4, name: "이태원 메인로드 1층", area: "28㎡", rent: "120만/월", deposit: "800만" },
  { id: 5, name: "연남동 골목 소형매장", area: "15㎡", rent: "60만/월", deposit: "300만" },
  { id: 6, name: "을지로 빈티지샵 자리", area: "22㎡", rent: "90만/월", deposit: "600만" },
  { id: 7, name: "망원동 브런치카페", area: "40㎡", rent: "180만/월", deposit: "1,500만" },
  { id: 8, name: "합정역 지하1층", area: "50㎡", rent: "100만/월", deposit: "700만" },
  { id: 9, name: "잠실 롯데타워 근처", area: "35㎡", rent: "250만/월", deposit: "3,000만" },
  { id: 10, name: "신촌 대학가 매장", area: "18㎡", rent: "70만/월", deposit: "400만" },
  { id: 11, name: "압구정 로데오거리", area: "30㎡", rent: "300만/월", deposit: "5,000만" },
  { id: 12, name: "건대입구 먹자골목", area: "25㎡", rent: "110만/월", deposit: "900만" },
];

const PER_PAGE = 8;

export default function Wishlist() {
  const [savedList, setSavedList] = useState(INITIAL_SAVED);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [unlikeTarget, setUnlikeTarget] = useState(null);

  const filtered = search.trim()
    ? savedList.filter((v) => v.name.includes(search.trim()) || v.area.includes(search.trim()) || v.rent.includes(search.trim()))
    : savedList;

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const currentPage = Math.min(page, totalPages || 1);
  const items = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleUnlike = (e, item) => {
    e.stopPropagation();
    setUnlikeTarget(item);
  };

  const confirmUnlike = () => {
    const newList = savedList.filter((v) => v.id !== unlikeTarget.id);
    setSavedList(newList);
    setUnlikeTarget(null);
    const newFiltered = search.trim()
      ? newList.filter((v) => v.name.includes(search.trim()))
      : newList;
    const newTotalPages = Math.ceil(newFiltered.length / PER_PAGE);
    if (page > newTotalPages && newTotalPages > 0) setPage(newTotalPages);
  };

  return (
    <div className="save-page">
      <h2 className="save-title">찜한 공실</h2>
      <p className="save-count">총 {filtered.length}개</p>

      <div className="save-search">
        <svg className="save-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          placeholder="찜한 공실 검색 (이름, 면적, 가격)"
          value={search}
          onChange={handleSearch}
        />
        {search && (
          <button className="save-search-clear" onClick={() => { setSearch(""); setPage(1); }}>✕</button>
        )}
      </div>

      {items.length > 0 ? (
        <div className="save-grid">
          {items.map((v) => (
            <div key={v.id} className="save-card" onClick={() => setSelected(v)}>
              <div className="save-card-thumb">
                <span>🏢</span>
                <button className="save-heart" onClick={(e) => handleUnlike(e, v)}>♥</button>
              </div>
              <div className="save-card-info">
                <h4>{v.name}</h4>
                <p>{v.area} · {v.rent}</p>
                <p className="save-deposit">보증금 {v.deposit}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="save-empty">
          <p>{search ? "검색 결과가 없습니다." : "찜한 공실이 없습니다."}</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="save-pagination">
          <button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>&lt;</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i + 1} className={currentPage === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>
              {i + 1}
            </button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>&gt;</button>
        </div>
      )}

      <VacancyModal data={selected} onClose={() => setSelected(null)} />
      <ConfirmModal
        message={unlikeTarget ? "찜 해제하시겠습니까?" : null}
        onConfirm={confirmUnlike}
        onCancel={() => setUnlikeTarget(null)}
      />
    </div>
  );
}