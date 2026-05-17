import { useState } from "react";
import VacancyModal from "../../shared/header/modal/vacancyModal";
import ConfirmModal from "../../shared/header/modal/confirmModal";
import "./wishlist.css";

const WISHLIST_KEY = "wishlist";
const getStored = () => { try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"); } catch { return []; } };
const saveStored = (list) => localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));

const PER_PAGE = 8;

export default function Wishlist() {
  const [savedList, setSavedList] = useState(getStored);
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
    saveStored(newList);
    setUnlikeTarget(null);
    const newFiltered = search.trim()
      ? newList.filter((v) => v.name.includes(search.trim()))
      : newList;
    const newTotalPages = Math.ceil(newFiltered.length / PER_PAGE);
    if (page > newTotalPages && newTotalPages > 0) setPage(newTotalPages);
  };

  const handleModalUnlike = () => {
    if (!selected) return;
    const newList = savedList.filter((v) => v.id !== selected.id);
    setSavedList(newList);
    saveStored(newList);
    setSelected(null);
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

      <VacancyModal
        data={selected}
        onClose={() => setSelected(null)}
        isWishlisted={true}
        onToggleWishlist={handleModalUnlike}
      />
      <ConfirmModal
        message={unlikeTarget ? "찜 해제하시겠습니까?" : null}
        onConfirm={confirmUnlike}
        onCancel={() => setUnlikeTarget(null)}
      />
    </div>
  );
}