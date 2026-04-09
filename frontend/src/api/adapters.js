// 백엔드 응답 → 프론트엔드 컴포넌트가 기대하는 shape 변환

const COUNTRY_FLAGS = {
  France: '🇫🇷', '프랑스': '🇫🇷',
  'South Korea': '🇰🇷', Korea: '🇰🇷', '한국': '🇰🇷',
  Japan: '🇯🇵', '일본': '🇯🇵',
  Italy: '🇮🇹', '이탈리아': '🇮🇹',
  USA: '🇺🇸', 'United States': '🇺🇸', '미국': '🇺🇸',
  UK: '🇬🇧', England: '🇬🇧', '영국': '🇬🇧',
  Germany: '🇩🇪', '독일': '🇩🇪',
  Spain: '🇪🇸', '스페인': '🇪🇸',
  China: '🇨🇳', '중국': '🇨🇳',
  Thailand: '🇹🇭', '태국': '🇹🇭',
};

function toFlag(country) {
  return COUNTRY_FLAGS[country] ?? '🌏';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return dateStr.replace(/-/g, '. ');
}

function daysLeft(endDate) {
  if (!endDate) return 0;
  const diff = new Date(endDate) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const COLLECTION_STATUS_CONFIG = {
  ONGOING:   { label: '진행 중',  accentColor: '#fe6b70' },
  COMPLETED: { label: '완성',    accentColor: '#22c55e' },
  ENDED:     { label: '종료',    accentColor: '#94a3b8' },
};

/** GET /api/events → EventSummaryResponse[] */
export function adaptEventSummary(ev, joinedIds = [], completedMap = {}) {
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
    landmarkCount: ev.totalSteps,
    collected: completedMap[ev.id] ?? 0,
    image: ev.heroImageUrl,
    heroImageFallbackUrl: ev.heroImageFallbackUrl,
    tag: ev.featured ? 'featured' : ev.status.toLowerCase(),
    status: ev.status.toLowerCase(),
    themeColor: ev.themeColor || '#fe6b70',
    partnerName: ev.partnerName,
    partnerLogoUrl: ev.partnerLogoUrl,
    rewardLabel: ev.partnerName ? `${ev.partnerName} 혜택` : '컬렉션 완성 리워드',
    rewardTitle: '컬렉션 완성 리워드',
    rewardDescription: ev.partnerName
      ? `${ev.partnerName} 파트너 혜택을 받아보세요.`
      : '컬렉션 완성 시 특별 리워드가 지급됩니다.',
    highlights: ev.partnerName ? [`${ev.partnerName} 파트너 혜택`, `${ev.totalSteps}개 랜드마크`] : [`${ev.totalSteps}개 랜드마크`],
    participationState: ev.status === 'ACTIVE' ? 'joinable' : ev.status.toLowerCase(),
    detailStatusLabel: isJoined ? '참여 중' : '참여 가능',
    bottomCtaLabel: isJoined ? '내 진행 현황 보기' : '루트 보기 & 참여하기',
    routeSteps: [],
  };
}

/** GET /api/events/:id → EventDetailResponse */
export function adaptEventDetail(ev) {
  const routeSteps = (ev.steps || []).map(adaptStep);
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
    image: ev.heroImageUrl,
    heroImageFallbackUrl: ev.heroImageFallbackUrl,
    mapImageUrl: ev.mapImageUrl,
    description: ev.description,
    tag: ev.featured ? 'featured' : ev.status.toLowerCase(),
    status: ev.status.toLowerCase(),
    themeColor: ev.themeColor || '#fe6b70',
    partnerName: ev.partnerName,
    partnerLogoUrl: ev.partnerLogoUrl,
    rewardLabel: ev.partnerName ? `${ev.partnerName} 혜택` : '컬렉션 완성 리워드',
    rewardTitle: '컬렉션 완성 리워드',
    rewardDescription: ev.partnerName
      ? `${ev.partnerName} 파트너 혜택을 받아보세요.`
      : '컬렉션 완성 시 특별 리워드가 지급됩니다.',
    highlights: ev.partnerName ? [`${ev.partnerName} 파트너 혜택`, `${ev.totalSteps}개 랜드마크`] : [`${ev.totalSteps}개 랜드마크`],
    participationState: ev.status === 'ACTIVE' ? 'joinable' : ev.status.toLowerCase(),
    detailStatusLabel: ev.joined ? '참여 중' : '참여 가능',
    bottomCtaLabel: ev.joined ? '내 진행 현황 보기' : '루트 보기 & 참여하기',
    joined: ev.joined,
    routeSteps,
  };
}

export function adaptStep(step) {
  return {
    id: step.id,
    title: step.placeName,
    subtitle: step.placeDescription ? `@ ${step.placeDescription}` : '',
    image: step.imageUrl,
    fallbackImage: step.imageFallbackUrl,
    stepState: step.state?.toLowerCase() ?? 'locked',
    nft: step.nftName
      ? { name: step.nftName, image: step.nftImageUrl, rarity: step.nftRarity?.toLowerCase() }
      : null,
    isReward: step.state === 'REWARD',
    isFinalStep: step.finalStep,
  };
}

/** GET /api/collections → CollectionResponse[] */
export function adaptCollection(col, nfts = []) {
  const cfg = COLLECTION_STATUS_CONFIG[col.collectionStatus] ?? COLLECTION_STATUS_CONFIG.ONGOING;
  const colNfts = nfts.filter((n) => n.eventId === col.eventId);

  return {
    id: col.eventId,
    title: col.eventTitle,
    city: col.city,
    country: col.country,
    region: `${col.country} · ${col.city}`,
    flag: toFlag(col.country),
    period: `${formatDate(col.startDate)} - ${formatDate(col.endDate)}`,
    image: col.heroImageUrl,
    themeColor: col.themeColor || '#fe6b70',
    accentColor: cfg.accentColor,
    collectionStatus: col.collectionStatus.toLowerCase(),
    statusLabel: cfg.label,
    tag: col.collectionStatus.toLowerCase(),
    landmarkCount: col.totalSteps,
    collected: col.completedSteps,
    partnerName: col.partnerName,
    rewardDescription: col.partnerName
      ? `${col.partnerName} 파트너 혜택`
      : '컬렉션 완성 리워드',
    collectedNfts: colNfts.map(adaptNft),
    routeSteps: [],
  };
}

/** GET /api/nfts → UserNftResponse[] */
export function adaptNft(nft) {
  return {
    id: nft.id,
    name: nft.name,
    placeName: nft.name,
    image: nft.imageUrl,
    serial: `#${nft.id.slice(0, 6).toUpperCase()}`,
    description: `${nft.eventTitle} 컬렉션 NFT`,
    rarity: nft.rarity?.toLowerCase(),
    eventId: nft.eventId,
    mintedAt: nft.mintedAt,
  };
}

/** GET /api/rewards → UserRewardResponse[] */
export function adaptReward(r) {
  return {
    id: r.id,
    title: r.title,
    collectionName: r.eventTitle,
    description: r.description,
    validUntil: r.validUntil,
    usedDate: r.usedAt,
    status: r.status.toLowerCase(),
    couponCode: r.couponCode,
    partner: r.partnerName,
    howToUse: r.howToUse,
    emoji: r.emoji || '🎁',
    accentColor: r.accentColor || '#fe6b70',
  };
}

/** GET /api/dashboard/stats → DashboardStatsResponse */
export function adaptDashboard(stats) {
  return {
    totalNfts: stats.nftCount,
    joinedCities: stats.cityCount,
    activeEventsCount: stats.activeCollectionsCount,
    activeCollections: [],
  };
}

export function adaptProfileSummary(stats) {
  return {
    nftCount: stats.nftCount,
    cityCount: stats.cityCount,
    countryCount: stats.countryCount,
    completedCollectionCount: stats.completedCollectionCount,
    landmarkCount: stats.landmarkCount,
    totalDistanceLabel: '— km',
  };
}
