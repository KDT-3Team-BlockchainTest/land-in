const _apiBase = (process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '');
function fixUrl(url) {
  if (!url) return null;
  return url.replace(/^http:\/\/localhost(:\d+)?/, _apiBase);
}

const COUNTRY_FLAGS = {
  France: '🇫🇷', '프랑스': '🇫🇷',
  'South Korea': '🇰🇷', Korea: '🇰🇷', '한국': '🇰🇷', '대한민국': '🇰🇷',
  Japan: '🇯🇵', '일본': '🇯🇵',
  Italy: '🇮🇹', '이탈리아': '🇮🇹',
  USA: '🇺🇸', 'United States': '🇺🇸', '미국': '🇺🇸',
  UK: '🇬🇧', England: '🇬🇧', '영국': '🇬🇧',
  Germany: '🇩🇪', '독일': '🇩🇪',
  Spain: '🇪🇸', '스페인': '🇪🇸',
  China: '🇨🇳', '중국': '🇨🇳',
  Thailand: '🇹🇭', '태국': '🇹🇭',
};

function toFlag(country) { return COUNTRY_FLAGS[country] ?? null; }
function formatDate(d) { return d ? d.replace(/-/g, '. ') : ''; }
function daysLeft(end) {
  if (!end) return 0;
  return Math.max(0, Math.ceil((new Date(end) - new Date()) / 86400000));
}
function daysUntil(start) {
  if (!start) return 0;
  return Math.max(0, Math.ceil((new Date(start) - new Date()) / 86400000));
}
function progressPct(done, total) {
  return total ? Math.min(100, Math.round((done / total) * 100)) : 0;
}

const COL_STATUS = {
  ONGOING:   { label: '진행 중',  color: '#fe6b70' },
  COMPLETED: { label: '완성',    color: '#22c55e' },
  ENDED:     { label: '종료',    color: '#94a3b8' },
};

export function adaptEventSummary(ev, joinedIds = []) {
  const isJoined = joinedIds.includes(ev.id);
  return {
    id: ev.id,
    title: ev.title,
    city: ev.city,
    country: ev.country,
    region: `${ev.country} · ${ev.city}`,
    flag: toFlag(ev.country),
    period: `${formatDate(ev.startDate)} - ${formatDate(ev.endDate)}`,
    daysLeft: daysLeft(ev.endDate),
    daysUntilOpen: daysUntil(ev.startDate),
    landmarkCount: ev.totalSteps,
    image: fixUrl(ev.heroImageUrl),
    tag: ev.featured ? 'featured' : ev.status?.toLowerCase(),
    status: ev.status?.toLowerCase(),
    themeColor: ev.themeColor || '#fe6b70',
    partnerName: ev.partnerName,
    rewardTitle: ev.rewardTitle || '컬렉션 완성 리워드',
    rewardLabel: ev.partnerName ? `${ev.partnerName} 혜택` : (ev.rewardTitle || '컬렉션 완성 리워드'),
    rewardDescription: ev.rewardDescription || '컬렉션 완성 시 특별 리워드가 지급됩니다.',
    highlights: ev.partnerName
      ? [`${ev.partnerName} 파트너 혜택`, `${ev.totalSteps}개 랜드마크`]
      : [`${ev.totalSteps}개 랜드마크`],
    isJoined,
    bottomCtaLabel: isJoined ? '내 진행 현황 보기' : '루트 보기 & 참여하기',
  };
}

export function adaptEventDetail(ev) {
  return {
    id: ev.id,
    title: ev.title,
    city: ev.city,
    country: ev.country,
    region: `${ev.country} · ${ev.city}`,
    flag: toFlag(ev.country),
    period: `${formatDate(ev.startDate)} - ${formatDate(ev.endDate)}`,
    daysLeft: daysLeft(ev.endDate),
    landmarkCount: ev.totalSteps,
    collected: ev.completedSteps ?? 0,
    image: fixUrl(ev.heroImageUrl),
    mapImageUrl: fixUrl(ev.mapImageUrl),
    description: ev.description,
    tag: ev.featured ? 'featured' : ev.status?.toLowerCase(),
    status: ev.status?.toLowerCase(),
    themeColor: ev.themeColor || '#fe6b70',
    partnerName: ev.partnerName,
    partnerLogoUrl: ev.partnerLogoUrl,
    rewardTitle: ev.rewardTitle || '컬렉션 완성 리워드',
    rewardDescription: ev.rewardDescription || '컬렉션 완성 시 특별 리워드가 지급됩니다.',
    rewardHowToUse: ev.rewardHowToUse,
    rewardEmoji: ev.rewardEmoji || '🎁',
    rewardAccentColor: ev.rewardAccentColor || '#fe6b70',
    highlights: ev.partnerName
      ? [`${ev.partnerName} 파트너 혜택`, `${ev.totalSteps}개 랜드마크`]
      : [`${ev.totalSteps}개 랜드마크`],
    joined: ev.joined,
    routeSteps: (ev.steps || []).map(adaptStep),
  };
}

export function adaptStep(step) {
  return {
    id: step.id,
    title: step.placeName,
    subtitle: step.placeDescription ? `@ ${step.placeDescription}` : '',
    image: fixUrl(step.imageUrl),
    stepState: step.state?.toLowerCase() ?? 'locked',
    nft: step.nftName
      ? { name: step.nftName, image: fixUrl(step.nftImageUrl), rarity: step.nftRarity?.toLowerCase() }
      : null,
    isFinalStep: step.finalStep,
  };
}

export function adaptCollection(col) {
  const cfg = COL_STATUS[col.collectionStatus] ?? COL_STATUS.ONGOING;
  return {
    id: col.eventId,
    title: col.eventTitle,
    city: col.city,
    country: col.country,
    region: `${col.country} · ${col.city}`,
    flag: toFlag(col.country),
    period: `${formatDate(col.startDate)} - ${formatDate(col.endDate)}`,
    daysLeft: daysLeft(col.endDate),
    image: fixUrl(col.heroImageUrl),
    themeColor: col.themeColor || '#fe6b70',
    accentColor: cfg.color,
    collectionStatus: col.collectionStatus?.toLowerCase(),
    statusLabel: cfg.label,
    landmarkCount: col.totalSteps,
    collected: col.completedSteps,
    progressPercent: progressPct(col.completedSteps, col.totalSteps),
    partnerName: col.partnerName,
    rewardTitle: col.rewardTitle || '컬렉션 완성 리워드',
    rewardDescription: col.rewardDescription || '컬렉션 완성 리워드',
  };
}

export function adaptNft(nft) {
  return {
    id: nft.id,
    name: nft.name,
    placeName: nft.stepPlaceName || nft.name,
    image: fixUrl(nft.imageUrl),
    serial: `#${String(nft.id).slice(0, 6).toUpperCase()}`,
    rarity: nft.rarity?.toLowerCase(),
    eventId: nft.eventId,
    mintedAt: nft.mintedAt,
    mintStatus: nft.mintStatus,
    tokenId: nft.tokenId,
    transactionHash: nft.transactionHash,
  };
}

export function adaptReward(r) {
  return {
    id: r.id,
    title: r.title,
    collectionName: r.eventTitle,
    description: r.description,
    validUntil: r.validUntil,
    usedDate: r.usedAt,
    status: r.status?.toLowerCase(),
    couponCode: r.couponCode,
    partner: r.partnerName,
    howToUse: r.howToUse,
    emoji: r.emoji || '🎁',
    accentColor: r.accentColor || '#fe6b70',
  };
}

export function adaptDashboard(stats) {
  return {
    totalNfts: stats.nftCount ?? 0,
    joinedCities: stats.cityCount ?? 0,
    activeEventsCount: stats.activeCollectionsCount ?? 0,
    nftCount: stats.nftCount ?? 0,
    cityCount: stats.cityCount ?? 0,
    countryCount: stats.countryCount ?? 0,
    completedCollectionCount: stats.completedCollectionCount ?? 0,
    landmarkCount: stats.landmarkCount ?? 0,
    totalDistanceLabel: stats.totalDistanceLabel ?? '— km',
  };
}
