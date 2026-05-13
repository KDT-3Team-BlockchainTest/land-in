import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsApi } from '../../api/events';
import { uploadsApi } from '../../api/uploads';

const STATUS_OPTIONS = ['UPCOMING', 'ACTIVE', 'COMPLETED', 'ENDED'];
const RARITY_OPTIONS = ['COMMON', 'RARE', 'LEGENDARY'];

const emptyStep = (orderIndex = 1, finalStep = false) => ({
  orderIndex,
  placeName: '',
  placeDescription: '',
  imageUrl: '',
  lat: '',
  lng: '',
  finalStep,
  tagUid: '',
  nftName: '',
  nftImageUrl: '',
  nftRarity: 'COMMON',
  nftDescription: '',
});

const emptyForm = () => ({
  id: '',
  title: '',
  city: '',
  country: '',
  status: 'UPCOMING',
  featured: false,
  startDate: '',
  endDate: '',
  description: '',
  heroImageUrl: '',
  themeColor: '#fe6b70',
  steps: [emptyStep(1, true)],
  reward: {
    title: '',
    description: '',
    howToUse: '',
    validityDays: 90,
    emoji: '',
    accentColor: '#fe6b70',
  },
});

function toFormFromResponse(response) {
  return {
    id: response.id ?? '',
    title: response.title ?? '',
    city: response.city ?? '',
    country: response.country ?? '',
    status: response.status ?? 'UPCOMING',
    featured: Boolean(response.featured),
    startDate: response.startDate ?? '',
    endDate: response.endDate ?? '',
    description: response.description ?? '',
    heroImageUrl: response.heroImageUrl ?? '',
    themeColor: response.themeColor ?? '#fe6b70',
    steps: (response.steps?.length ? response.steps : [emptyStep(1, true)]).map((step, index) => ({
      orderIndex: step.orderIndex ?? index + 1,
      placeName: step.placeName ?? '',
      placeDescription: step.placeDescription ?? '',
      imageUrl: step.imageUrl ?? '',
      lat: step.lat ?? '',
      lng: step.lng ?? '',
      finalStep: Boolean(step.finalStep),
      tagUid: step.tagUid ?? '',
      nftName: step.nftName ?? '',
      nftImageUrl: step.nftImageUrl ?? '',
      nftRarity: step.nftRarity ?? 'COMMON',
      nftDescription: step.nftDescription ?? '',
    })),
    reward: response.reward
      ? {
          title: response.reward.title ?? '',
          description: response.reward.description ?? '',
          howToUse: response.reward.howToUse ?? '',
          validityDays: response.reward.validityDays ?? 90,
          emoji: response.reward.emoji ?? '',
          accentColor: response.reward.accentColor ?? '#fe6b70',
        }
      : emptyForm().reward,
  };
}

function toPayload(form) {
  const numberOrNull = (value) => {
    if (value === '' || value == null) return null;
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  };

  return {
    id: form.id.trim().toLowerCase(),
    title: form.title.trim(),
    city: form.city.trim(),
    country: form.country.trim(),
    status: form.status,
    featured: form.featured,
    startDate: form.startDate || null,
    endDate: form.endDate || null,
    description: form.description.trim() || null,
    heroImageUrl: form.heroImageUrl.trim() || null,
    themeColor: form.themeColor || null,
    steps: form.steps
      .slice()
      .sort((a, b) => Number(a.orderIndex) - Number(b.orderIndex))
      .map((step) => ({
        orderIndex: Number(step.orderIndex),
        placeName: step.placeName.trim(),
        placeDescription: step.placeDescription.trim() || null,
        imageUrl: step.imageUrl.trim() || null,
        lat: numberOrNull(step.lat),
        lng: numberOrNull(step.lng),
        finalStep: Boolean(step.finalStep),
        tagUid: step.tagUid.trim().toUpperCase(),
        nftName: step.nftName.trim(),
        nftImageUrl: step.nftImageUrl.trim() || null,
        nftRarity: step.nftRarity,
        nftDescription: step.nftDescription.trim() || null,
      })),
    reward: {
      title: form.reward.title.trim(),
      description: form.reward.description.trim() || null,
      howToUse: form.reward.howToUse.trim() || null,
      validityDays: Number(form.reward.validityDays) || 1,
      emoji: form.reward.emoji.trim() || null,
      accentColor: form.reward.accentColor || null,
    },
  };
}

function validateForm(form, finalStepCount) {
  if (!/^[a-z0-9-]{3,64}$/.test(form.id.trim())) {
    return '이벤트 ID는 3~64자의 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.';
  }
  if (!form.title.trim() || !form.city.trim() || !form.country.trim()) {
    return '기본 정보의 필수 값을 입력하세요.';
  }
  if (!form.startDate || !form.endDate) {
    return '시작일과 종료일을 입력하세요.';
  }
  if (form.endDate < form.startDate) {
    return '종료일은 시작일 이후여야 합니다.';
  }
  if (form.steps.length === 0) {
    return '스텝은 최소 1개 이상 필요합니다.';
  }
  if (finalStepCount !== 1) {
    return '보상을 지급할 마지막 스텝은 정확히 1개여야 합니다.';
  }
  const orderSet = new Set();
  const tagSet = new Set();
  for (const step of form.steps) {
    const order = Number(step.orderIndex);
    if (!Number.isInteger(order) || order < 1) return '스텝 순서는 1 이상의 정수여야 합니다.';
    if (orderSet.has(order)) return '스텝 순서는 중복될 수 없습니다.';
    orderSet.add(order);
    if (!step.placeName.trim() || !step.tagUid.trim() || !step.nftName.trim()) {
      return '각 스텝의 장소명, NFC 태그 UID, NFT 이름을 입력하세요.';
    }
    if (!step.imageUrl.trim()) {
      return '각 스텝에는 방문루트에 표시할 장소 이미지를 등록하세요.';
    }
    if (!step.nftImageUrl.trim()) {
      return '각 스텝에는 컬렉션 NFT 카드에 표시할 NFT 이미지를 등록하세요.';
    }
    const tagUid = step.tagUid.trim().toUpperCase();
    if (tagSet.has(tagUid)) return 'NFC 태그 UID는 이벤트 안에서 중복될 수 없습니다.';
    tagSet.add(tagUid);
  }
  if (!form.reward.title.trim()) return '보상 제목을 입력하세요.';
  if (Number(form.reward.validityDays) < 1) return '보상 유효기간은 1일 이상이어야 합니다.';
  return '';
}

export default function EventEditorPage({ mode }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => emptyForm());
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingStepImages, setUploadingStepImages] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (mode !== 'edit' || !eventId) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    eventsApi
      .get(eventId)
      .then((response) => {
        if (!cancelled) setForm(toFormFromResponse(response));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || '이벤트를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, eventId]);

  const finalStepCount = useMemo(() => form.steps.filter((step) => step.finalStep).length, [form.steps]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateReward = (key, value) => {
    setForm((prev) => ({ ...prev, reward: { ...prev.reward, [key]: value } }));
  };

  const updateStep = (index, key, value) => {
    setForm((prev) => {
      const next = prev.steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, [key]: value } : step
      );
      if (key === 'finalStep' && value) {
        return {
          ...prev,
          steps: next.map((step, stepIndex) => ({ ...step, finalStep: stepIndex === index })),
        };
      }
      return { ...prev, steps: next };
    });
  };

  const stepUploadKey = (index, field) => `${index}:${field}`;

  const isUploadingStepImage = (index, field) => Boolean(uploadingStepImages[stepUploadKey(index, field)]);

  const setStepImageUploading = (index, field, value) => {
    setUploadingStepImages((prev) => ({
      ...prev,
      [stepUploadKey(index, field)]: value,
    }));
  };

  const addStep = () => {
    setForm((prev) => {
      const nextOrder = Math.max(0, ...prev.steps.map((step) => Number(step.orderIndex) || 0)) + 1;
      return {
        ...prev,
        steps: [
          ...prev.steps.map((step) => ({ ...step, finalStep: false })),
          emptyStep(nextOrder, true),
        ],
      };
    });
  };

  const removeStep = (index) => {
    setForm((prev) => {
      const next = prev.steps.filter((_, stepIndex) => stepIndex !== index);
      if (next.length > 0 && !next.some((step) => step.finalStep)) {
        next[next.length - 1] = { ...next[next.length - 1], finalStep: true };
      }
      return { ...prev, steps: next };
    });
  };

  const handleHeroImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setUploadingHero(true);
    try {
      const uploaded = await uploadsApi.image(file);
      updateField('heroImageUrl', uploaded.url);
      setSuccess('대표 이미지가 업로드되었습니다. 저장하면 이벤트에 반영됩니다.');
    } catch (err) {
      setError(err.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingHero(false);
      event.target.value = '';
    }
  };

  const handleStepImageUpload = async (event, index, field) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setStepImageUploading(index, field, true);
    try {
      const uploaded = await uploadsApi.image(file);
      updateStep(index, field, uploaded.url);
      setSuccess(field === 'imageUrl'
        ? '장소 이미지가 업로드되었습니다. 저장하면 스텝에 반영됩니다.'
        : 'NFT 이미지가 업로드되었습니다. 저장하면 NFT 템플릿에 반영됩니다.');
    } catch (err) {
      setError(err.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setStepImageUploading(index, field, false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm(form, finalStepCount);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const payload = toPayload(form);
      if (mode === 'create') {
        const created = await eventsApi.create(payload);
        navigate(`/events/${created.id}`, { replace: true });
      } else {
        const updated = await eventsApi.update(eventId, payload);
        setForm(toFormFromResponse(updated));
        setSuccess('변경사항이 저장되었습니다.');
      }
    } catch (err) {
      setError(err.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">불러오는 중...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">
            {mode === 'create' ? '새 이벤트 만들기' : `이벤트 편집: ${form.title || form.id}`}
          </h1>
          <p className="admin-page__subtitle">
            이벤트 기본 정보, 방문 스텝, NFC 태그, NFT 템플릿, 완료 보상을 한 번에 관리합니다.
          </p>
        </div>
        <div className="admin-flex-end">
          <button type="button" className="admin-button admin-button--secondary" onClick={() => navigate('/events')}>
            목록으로
          </button>
          <button type="submit" className="admin-button admin-button--primary" disabled={saving}>
            {saving ? '저장 중...' : mode === 'create' ? '이벤트 생성' : '변경사항 저장'}
          </button>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="admin-alert admin-alert--success" style={{ marginBottom: 16 }}>{success}</div>}

      <section className="admin-card">
        <h2 className="admin-card__title">기본 정보</h2>
        <p className="admin-card__hint">사용자 앱의 홈, 상세, 컬렉션 화면에 노출되는 정보입니다.</p>
        <div className="admin-grid admin-grid--cols-4">
          <div className="admin-field admin-field--span-2">
            <label className="admin-field__label" htmlFor="event-id">이벤트 ID</label>
            <input
              id="event-id"
              className="admin-input"
              value={form.id}
              onChange={(e) => updateField('id', e.target.value)}
              placeholder="paris-spring-2026"
              pattern="^[a-z0-9-]+$"
              disabled={mode === 'edit'}
              required
            />
            <span className="admin-field__hint">URL에 사용됩니다. 생성 후에는 변경할 수 없습니다.</span>
          </div>
          <div className="admin-field admin-field--span-2">
            <label className="admin-field__label" htmlFor="event-title">컬렉션 제목</label>
            <input
              id="event-title"
              className="admin-input"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              required
            />
          </div>
          <div className="admin-field admin-field--span-2">
            <label className="admin-field__label" htmlFor="event-city">도시</label>
            <input
              id="event-city"
              className="admin-input"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              required
            />
          </div>
          <div className="admin-field admin-field--span-2">
            <label className="admin-field__label" htmlFor="event-country">국가</label>
            <input
              id="event-country"
              className="admin-input"
              value={form.country}
              onChange={(e) => updateField('country', e.target.value)}
              required
            />
          </div>
          <div className="admin-field">
            <label className="admin-field__label" htmlFor="event-status">상태</label>
            <select
              id="event-status"
              className="admin-select"
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-field__label" htmlFor="start-date">시작일</label>
            <input
              id="start-date"
              type="date"
              className="admin-input"
              value={form.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
              required
            />
          </div>
          <div className="admin-field">
            <label className="admin-field__label" htmlFor="end-date">종료일</label>
            <input
              id="end-date"
              type="date"
              className="admin-input"
              value={form.endDate}
              onChange={(e) => updateField('endDate', e.target.value)}
              required
            />
          </div>
          <div className="admin-field">
            <span className="admin-field__label">대표 노출</span>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => updateField('featured', e.target.checked)}
              />
              <span>홈 Featured 표시</span>
            </label>
          </div>
          <div className="admin-field admin-field--span-3">
            <label className="admin-field__label" htmlFor="hero-image">대표 이미지</label>
            <input
              id="hero-image"
              className="admin-input"
              value={form.heroImageUrl}
              onChange={(e) => updateField('heroImageUrl', e.target.value)}
              placeholder="파일 업로드 후 URL이 자동 입력됩니다."
            />
            <div className="admin-inline-actions">
              <label className={`admin-file-button ${uploadingHero ? 'is-disabled' : ''}`}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleHeroImageUpload}
                  disabled={uploadingHero}
                />
                <span>{uploadingHero ? '업로드 중...' : '이미지 파일 업로드'}</span>
              </label>
              {form.heroImageUrl && (
                <a className="admin-text-link" href={form.heroImageUrl} target="_blank" rel="noreferrer">
                  이미지 보기
                </a>
              )}
            </div>
            <span className="admin-field__hint">JPG, PNG, WebP, GIF 파일을 업로드하면 서버 저장 URL이 입력됩니다.</span>
          </div>
          <div className="admin-field">
            <label className="admin-field__label" htmlFor="theme-color">테마 컬러</label>
            <input
              id="theme-color"
              type="color"
              className="admin-input"
              value={form.themeColor || '#fe6b70'}
              onChange={(e) => updateField('themeColor', e.target.value)}
              style={{ height: 42, padding: 4 }}
            />
          </div>
          <div className="admin-field admin-field--span-4">
            <label className="admin-field__label" htmlFor="event-description">설명</label>
            <textarea
              id="event-description"
              className="admin-textarea"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="컬렉션을 한두 문장으로 소개하세요."
            />
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-flex-between" style={{ marginBottom: 12 }}>
          <div>
            <h2 className="admin-card__title">스텝</h2>
            <p className="admin-card__hint">
              사용자가 방문해야 하는 장소입니다. NFC 태그 UID와 NFT 템플릿은 각 스텝에 저장됩니다.
            </p>
          </div>
          <button type="button" className="admin-button admin-button--secondary" onClick={addStep}>
            + 스텝 추가
          </button>
        </div>

        {form.steps.map((step, index) => (
          <div className="admin-step" key={`${step.orderIndex}-${index}`}>
            <div className="admin-step__header">
              <span className="admin-step__order">Step #{step.orderIndex || index + 1}</span>
              <div className="admin-flex-end">
                {step.finalStep && <span className="admin-step__final">Final Reward</span>}
                <button
                  type="button"
                  className="admin-button admin-button--danger"
                  onClick={() => removeStep(index)}
                  disabled={form.steps.length === 1}
                >
                  삭제
                </button>
              </div>
            </div>

            <div className="admin-grid admin-grid--cols-4">
              <div className="admin-field">
                <label className="admin-field__label">순서</label>
                <input
                  type="number"
                  min={1}
                  className="admin-input"
                  value={step.orderIndex}
                  onChange={(e) => updateStep(index, 'orderIndex', e.target.value)}
                  required
                />
              </div>
              <div className="admin-field admin-field--span-3">
                <label className="admin-field__label">장소명</label>
                <input
                  className="admin-input"
                  value={step.placeName}
                  onChange={(e) => updateStep(index, 'placeName', e.target.value)}
                  required
                />
              </div>
              <div className="admin-field admin-field--span-4">
                <label className="admin-field__label">장소 설명</label>
                <textarea
                  className="admin-textarea"
                  value={step.placeDescription}
                  onChange={(e) => updateStep(index, 'placeDescription', e.target.value)}
                />
              </div>
              <div className="admin-field admin-field--span-2">
                <label className="admin-field__label">장소 이미지 URL</label>
                <input
                  className="admin-input"
                  value={step.imageUrl}
                  onChange={(e) => updateStep(index, 'imageUrl', e.target.value)}
                  placeholder="https://..."
                />
                <div className="admin-inline-actions">
                  <label className={`admin-file-button ${isUploadingStepImage(index, 'imageUrl') ? 'is-disabled' : ''}`}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(e) => handleStepImageUpload(e, index, 'imageUrl')}
                      disabled={isUploadingStepImage(index, 'imageUrl')}
                    />
                    <span>{isUploadingStepImage(index, 'imageUrl') ? '업로드 중...' : '이미지 파일 업로드'}</span>
                  </label>
                  {step.imageUrl && (
                    <a className="admin-text-link" href={step.imageUrl} target="_blank" rel="noreferrer">
                      이미지 보기
                    </a>
                  )}
                </div>
              </div>
              <div className="admin-field">
                <label className="admin-field__label">위도</label>
                <input
                  className="admin-input"
                  value={step.lat}
                  onChange={(e) => updateStep(index, 'lat', e.target.value)}
                  placeholder="48.8584"
                />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">경도</label>
                <input
                  className="admin-input"
                  value={step.lng}
                  onChange={(e) => updateStep(index, 'lng', e.target.value)}
                  placeholder="2.2945"
                />
              </div>
              <div className="admin-field admin-field--span-2">
                <label className="admin-field__label">NFC 태그 UID</label>
                <input
                  className="admin-input"
                  value={step.tagUid}
                  onChange={(e) => updateStep(index, 'tagUid', e.target.value)}
                  placeholder="TAG-PARIS-001"
                  required
                />
              </div>
              <div className="admin-field admin-field--span-2">
                <span className="admin-field__label">마지막 스텝</span>
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={step.finalStep}
                    onChange={(e) => updateStep(index, 'finalStep', e.target.checked)}
                  />
                  <span>이 스텝 완료 시 보상 지급</span>
                </label>
              </div>
              <div className="admin-field admin-field--span-2">
                <label className="admin-field__label">NFT 이름</label>
                <input
                  className="admin-input"
                  value={step.nftName}
                  onChange={(e) => updateStep(index, 'nftName', e.target.value)}
                  required
                />
              </div>
              <div className="admin-field admin-field--span-2">
                <label className="admin-field__label">NFT 이미지 URL</label>
                <input
                  className="admin-input"
                  value={step.nftImageUrl}
                  onChange={(e) => updateStep(index, 'nftImageUrl', e.target.value)}
                  placeholder="컬렉션 NFT 카드에 표시될 이미지"
                />
                <div className="admin-inline-actions">
                  <label className={`admin-file-button ${isUploadingStepImage(index, 'nftImageUrl') ? 'is-disabled' : ''}`}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(e) => handleStepImageUpload(e, index, 'nftImageUrl')}
                      disabled={isUploadingStepImage(index, 'nftImageUrl')}
                    />
                    <span>{isUploadingStepImage(index, 'nftImageUrl') ? '업로드 중...' : '이미지 파일 업로드'}</span>
                  </label>
                  {step.nftImageUrl && (
                    <a className="admin-text-link" href={step.nftImageUrl} target="_blank" rel="noreferrer">
                      이미지 보기
                    </a>
                  )}
                </div>
              </div>
              <div className="admin-field">
                <label className="admin-field__label">희귀도</label>
                <select
                  className="admin-select"
                  value={step.nftRarity}
                  onChange={(e) => updateStep(index, 'nftRarity', e.target.value)}
                >
                  {RARITY_OPTIONS.map((rarity) => (
                    <option key={rarity} value={rarity}>{rarity}</option>
                  ))}
                </select>
              </div>
              <div className="admin-field admin-field--span-3">
                <label className="admin-field__label">NFT 설명</label>
                <input
                  className="admin-input"
                  value={step.nftDescription}
                  onChange={(e) => updateStep(index, 'nftDescription', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="admin-card">
        <h2 className="admin-card__title">완료 보상</h2>
        <p className="admin-card__hint">모든 스텝을 완료한 사용자에게 발급되는 쿠폰 템플릿입니다.</p>
        <div className="admin-grid admin-grid--cols-4">
          <div className="admin-field admin-field--span-3">
            <label className="admin-field__label">보상 제목</label>
            <input
              className="admin-input"
              value={form.reward.title}
              onChange={(e) => updateReward('title', e.target.value)}
              required
            />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">유효기간(일)</label>
            <input
              type="number"
              min={1}
              className="admin-input"
              value={form.reward.validityDays}
              onChange={(e) => updateReward('validityDays', e.target.value)}
              required
            />
          </div>
          <div className="admin-field admin-field--span-4">
            <label className="admin-field__label">보상 설명</label>
            <textarea
              className="admin-textarea"
              value={form.reward.description}
              onChange={(e) => updateReward('description', e.target.value)}
            />
          </div>
          <div className="admin-field admin-field--span-4">
            <label className="admin-field__label">사용 방법</label>
            <textarea
              className="admin-textarea"
              value={form.reward.howToUse}
              onChange={(e) => updateReward('howToUse', e.target.value)}
              placeholder="쿠폰 코드를 매장에서 제시하세요."
            />
          </div>
          <div className="admin-field admin-field--span-2">
            <label className="admin-field__label">아이콘 텍스트</label>
            <input
              className="admin-input"
              value={form.reward.emoji}
              onChange={(e) => updateReward('emoji', e.target.value)}
              placeholder="ticket, coffee, palace"
            />
          </div>
          <div className="admin-field admin-field--span-2">
            <label className="admin-field__label">강조 컬러</label>
            <input
              type="color"
              className="admin-input"
              value={form.reward.accentColor || '#fe6b70'}
              onChange={(e) => updateReward('accentColor', e.target.value)}
              style={{ height: 42, padding: 4 }}
            />
          </div>
        </div>
      </section>

      <div className="admin-flex-end" style={{ marginTop: 20 }}>
        <button type="button" className="admin-button admin-button--secondary" onClick={() => navigate('/events')}>
          취소
        </button>
        <button type="submit" className="admin-button admin-button--primary" disabled={saving}>
          {saving ? '저장 중...' : mode === 'create' ? '이벤트 생성' : '변경사항 저장'}
        </button>
      </div>
    </form>
  );
}
