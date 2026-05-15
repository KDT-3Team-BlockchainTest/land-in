const COUNTRY_FLAGS = {
  France:'🇫🇷','프랑스':'🇫🇷','South Korea':'🇰🇷',Korea:'🇰🇷','한국':'🇰🇷',
  Japan:'🇯🇵','일본':'🇯🇵',Italy:'🇮🇹','이탈리아':'🇮🇹',USA:'🇺🇸',
  'United States':'🇺🇸','미국':'🇺🇸',UK:'🇬🇧',England:'🇬🇧','영국':'🇬🇧',
  Germany:'🇩🇪','독일':'🇩🇪',Spain:'🇪🇸','스페인':'🇪🇸',China:'🇨🇳','중국':'🇨🇳',
  Thailand:'🇹🇭','태국':'🇹🇭',
};
const toFlag = (c) => COUNTRY_FLAGS[c] ?? '🌏';
const fmt    = (d) => d ? d.replace(/-/g, '. ') : '';
const dLeft  = (e) => e ? Math.max(0, Math.ceil((new Date(e)-new Date())/(864e5))) : 0;
const dUntil = (s) => s ? Math.max(0, Math.ceil((new Date(s)-new Date())/(864e5))) : 0;
const pct    = (c,t) => t ? Math.min(100,Math.round(c/t*100)) : 0;

const COL_STATUS = {
  ONGOING:  {label:'진행 중', accentColor:'#fe6b70'},
  COMPLETED:{label:'완성',    accentColor:'#22c55e'},
  ENDED:    {label:'종료',    accentColor:'#94a3b8'},
};

export function adaptEventSummary(ev, joinedIds=[]) {
  const isJoined = joinedIds.includes(ev.id);
  return {
    id:ev.id, title:ev.title, city:ev.city, country:ev.country,
    region:`${ev.country} · ${ev.city}`, flag:toFlag(ev.country),
    period:`${fmt(ev.startDate)} - ${fmt(ev.endDate)}`,
    daysLeft:dLeft(ev.endDate), daysUntilOpen:dUntil(ev.startDate),
    landmarkCount:ev.totalSteps, collected:0,
    image:ev.heroImageUrl, heroImageFallbackUrl:ev.heroImageFallbackUrl,
    tag:ev.featured?'featured':ev.status.toLowerCase(),
    status:ev.status.toLowerCase(), themeColor:ev.themeColor||'#fe6b70',
    partnerName:ev.partnerName, partnerLogoUrl:ev.partnerLogoUrl,
    rewardTitle:ev.rewardTitle||'컬렉션 완성 리워드',
    rewardDescription:ev.rewardDescription||(ev.partnerName?`${ev.partnerName} 파트너 혜택을 받아보세요.`:'컬렉션 완성 시 특별 리워드가 지급됩니다.'),
    highlights:ev.partnerName?[`${ev.partnerName} 파트너 혜택`,`${ev.totalSteps}개 랜드마크`]:[`${ev.totalSteps}개 랜드마크`],
    participationState:ev.status==='ACTIVE'?'joinable':ev.status.toLowerCase(),
    detailStatusLabel:isJoined?'참여 중':'참여 가능',
    bottomCtaLabel:isJoined?'내 진행 현황 보기':'루트 보기 & 참여하기',
    joined:isJoined, routeSteps:[],
  };
}

export function adaptEventDetail(ev) {
  return {
    id:ev.id, title:ev.title, city:ev.city, country:ev.country,
    region:`${ev.country} · ${ev.city}`, flag:toFlag(ev.country),
    period:`${fmt(ev.startDate)} - ${fmt(ev.endDate)}`,
    daysLeft:dLeft(ev.endDate), landmarkCount:ev.totalSteps,
    collected:ev.completedSteps??0,
    image:ev.heroImageUrl, heroImageFallbackUrl:ev.heroImageFallbackUrl,
    mapImageUrl:ev.mapImageUrl, description:ev.description,
    tag:ev.featured?'featured':ev.status.toLowerCase(),
    status:ev.status.toLowerCase(), themeColor:ev.themeColor||'#fe6b70',
    partnerName:ev.partnerName,
    rewardTitle:ev.rewardTitle||'컬렉션 완성 리워드',
    rewardDescription:ev.rewardDescription||(ev.partnerName?`${ev.partnerName} 파트너 혜택을 받아보세요.`:'컬렉션 완성 시 특별 리워드가 지급됩니다.'),
    rewardHowToUse:ev.rewardHowToUse,
    highlights:ev.partnerName?[`${ev.partnerName} 파트너 혜택`,`${ev.totalSteps}개 랜드마크`]:[`${ev.totalSteps}개 랜드마크`],
    participationState:ev.status==='ACTIVE'?'joinable':ev.status.toLowerCase(),
    detailStatusLabel:ev.joined?'참여 중':'참여 가능',
    bottomCtaLabel:ev.joined?'내 진행 현황 보기':'루트 보기 & 참여하기',
    joined:ev.joined,
    routeSteps:(ev.steps||[]).map(adaptStep),
  };
}

export function adaptStep(step) {
  return {
    id:step.id, title:step.placeName,
    subtitle:step.placeDescription?`@ ${step.placeDescription}`:'',
    image:step.imageUrl, fallbackImage:step.imageFallbackUrl,
    stepState:step.state?.toLowerCase()?? 'locked',
    nft:step.nftName?{name:step.nftName,image:step.nftImageUrl,rarity:step.nftRarity?.toLowerCase()}:null,
    isReward:step.state==='REWARD', isFinalStep:step.finalStep,
  };
}

export function adaptCollection(col, nfts=[]) {
  const cfg = COL_STATUS[col.collectionStatus]??COL_STATUS.ONGOING;
  return {
    id:col.eventId, title:col.eventTitle, city:col.city, country:col.country,
    region:`${col.country} · ${col.city}`, flag:toFlag(col.country),
    period:`${fmt(col.startDate)} - ${fmt(col.endDate)}`,
    daysLeft:dLeft(col.endDate), image:col.heroImageUrl,
    themeColor:col.themeColor||'#fe6b70', accentColor:cfg.accentColor,
    collectionStatus:col.collectionStatus.toLowerCase(), statusLabel:cfg.label,
    tag:col.collectionStatus.toLowerCase(),
    landmarkCount:col.totalSteps, collected:col.completedSteps,
    progressPercent:pct(col.completedSteps,col.totalSteps),
    partnerName:col.partnerName,
    rewardTitle:col.rewardTitle||'컬렉션 완성 리워드',
    rewardDescription:col.rewardDescription||(col.partnerName?`${col.partnerName} 파트너 혜택`:'컬렉션 완성 리워드'),
    collectedNfts:nfts.filter(n=>n.eventId===col.eventId).map(adaptNft),
    routeSteps:[],
  };
}

export function adaptNft(nft) {
  return {
    id:nft.id, name:nft.name, placeName:nft.stepPlaceName||nft.name,
    image:nft.imageUrl, nftImage:nft.imageUrl, stepImage:nft.stepImageUrl,
    serial:`#${nft.id.slice(0,6).toUpperCase()}`,
    description:`${nft.eventTitle} 컬렉션 NFT`,
    rarity:nft.rarity?.toLowerCase(), eventId:nft.eventId,
    mintedAt:nft.mintedAt, mintStatus:nft.mintStatus,
    tokenId:nft.tokenId, transactionHash:nft.transactionHash,
    mintFailureReason:nft.mintFailureReason,
  };
}

export function adaptReward(r) {
  return {
    id:r.id, title:r.title, collectionName:r.eventTitle, description:r.description,
    validUntil:r.validUntil, usedDate:r.usedAt, status:r.status.toLowerCase(),
    couponCode:r.couponCode, partner:r.partnerName, howToUse:r.howToUse,
    emoji:r.emoji||'🎁', accentColor:r.accentColor||'#fe6b70',
  };
}

export function adaptDashboard(s) {
  return { totalNfts:s.nftCount, joinedCities:s.cityCount, activeEventsCount:s.activeCollectionsCount };
}

export function adaptProfileSummary(d) {
  return {
    nftCount:d.nftCount??0, cityCount:d.cityCount??0, countryCount:d.countryCount??0,
    completedCollectionCount:d.completedCollectionCount??0,
    landmarkCount:d.landmarkCount??0, totalDistanceLabel:d.totalDistanceLabel??'— km',
  };
}
