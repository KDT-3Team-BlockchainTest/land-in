import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventsApi } from '../../api/events';

function formatRange(startDate, endDate) {
  if (!startDate && !endDate) return '—';
  return `${startDate ?? '?'} ~ ${endDate ?? '?'}`;
}

export default function EventListPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const refresh = () => {
    setLoading(true);
    eventsApi
      .list()
      .then((rows) => setEvents(rows || []))
      .catch((err) => setError(err.message || '이벤트 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm(`이벤트 "${eventId}"를 삭제할까요? 사용자 참여 기록이 있으면 삭제할 수 없습니다.`)) return;
    setBusyId(eventId);
    setError('');
    try {
      await eventsApi.remove(eventId);
      refresh();
    } catch (err) {
      setError(err.message || '삭제에 실패했습니다.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">이벤트 관리</h1>
          <p className="admin-page__subtitle">제휴사 컬렉션과 보상을 등록하고 수정합니다.</p>
        </div>
        <button
          type="button"
          className="admin-button admin-button--primary"
          onClick={() => navigate('/events/new')}
        >
          + 새 이벤트
        </button>
      </div>

      {error && <div className="admin-alert admin-alert--error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="admin-loading">불러오는 중…</div>
        ) : events.length === 0 ? (
          <div className="admin-empty">
            <p>등록된 이벤트가 없습니다.</p>
            <button
              type="button"
              className="admin-button admin-button--primary"
              onClick={() => navigate('/events/new')}
            >
              첫 이벤트 만들기
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>제목</th>
                <th>도시 · 국가</th>
                <th>상태</th>
                <th>기간</th>
                <th>스텝</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td><code>{event.id}</code></td>
                  <td>
                    <Link to={`/events/${event.id}`} style={{ fontWeight: 700 }}>
                      {event.title}
                    </Link>
                    {event.featured && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--color-primary)' }}>★ FEATURED</span>
                    )}
                  </td>
                  <td>{event.city} · {event.country}</td>
                  <td>
                    <span className={`admin-status-pill admin-status-pill--${event.status}`}>
                      {event.status}
                    </span>
                  </td>
                  <td>{formatRange(event.startDate, event.endDate)}</td>
                  <td>{event.steps?.length ?? 0}</td>
                  <td className="admin-flex-end">
                    <button
                      type="button"
                      className="admin-button admin-button--secondary"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      편집
                    </button>
                    <button
                      type="button"
                      className="admin-button admin-button--danger"
                      onClick={() => handleDelete(event.id)}
                      disabled={busyId === event.id}
                    >
                      {busyId === event.id ? '삭제 중…' : '삭제'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
