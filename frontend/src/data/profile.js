export function getAchievementItems(profileSummary = {}) {
  const stats = {
    nftCount: profileSummary.nftCount ?? 0,
    cityCount: profileSummary.cityCount ?? 0,
    countryCount: profileSummary.countryCount ?? 0,
    completedCollectionCount: profileSummary.completedCollectionCount ?? 0,
    landmarkCount: profileSummary.landmarkCount ?? 0,
  };

  return [
    {
      id: "first-nft",
      emoji: "🎉",
      title: "첫 번째 NFT",
      description: "여행 중 첫 랜드마크 NFT를 수집했어요.",
      state: stats.nftCount >= 1 ? "unlocked" : "progress",
      progress: {
        current: Math.min(stats.nftCount, 1),
        total: 1,
        label: "NFT 수집",
      },
      color: "#fe6b70",
      backgroundColor: "rgba(254, 107, 112, 0.12)",
    },
    {
      id: "city-explorer",
      emoji: "🌆",
      title: "도시 탐험가",
      description: "3개 이상의 도시 컬렉션에 참여해보세요.",
      state: stats.cityCount >= 3 ? "unlocked" : "progress",
      progress: {
        current: Math.min(stats.cityCount, 3),
        total: 3,
        label: "도시 참여",
      },
      color: "#8b5cf6",
      backgroundColor: "rgba(139, 92, 246, 0.12)",
    },
    {
      id: "collection-master",
      emoji: "🏆",
      title: "컬렉션 마스터",
      description: "3개의 컬렉션을 완성하면 특별 리워드가 열려요.",
      state: stats.completedCollectionCount >= 3 ? "unlocked" : "progress",
      progress: {
        current: Math.min(stats.completedCollectionCount, 3),
        total: 3,
        label: "컬렉션 완성",
      },
      color: "#22c55e",
      backgroundColor: "rgba(34, 197, 94, 0.12)",
    },
    {
      id: "landmark-hunter",
      emoji: "📸",
      title: "랜드마크 헌터",
      description: "랜드마크 30곳 방문을 목표로 수집을 이어가보세요.",
      state: stats.landmarkCount >= 30 ? "unlocked" : "progress",
      progress: {
        current: Math.min(stats.landmarkCount, 30),
        total: 30,
        label: "랜드마크 방문",
      },
      color: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.12)",
    },
    {
      id: "world-traveler",
      emoji: "🌍",
      title: "월드 트래블러",
      description: "2개 이상의 국가에서 컬렉션에 참여해보세요.",
      state: stats.countryCount >= 2 ? "unlocked" : "progress",
      progress: {
        current: Math.min(stats.countryCount, 2),
        total: 2,
        label: "국가 방문",
      },
      color: "#06b6d4",
      backgroundColor: "rgba(6, 182, 212, 0.12)",
    },
  ];
}

export const settingsItems = [
  {
    id: "notification",
    emoji: "🔔",
    label: "알림 설정",
    description: "리워드와 컬렉션 진행 알림을 관리해요.",
  },
  {
    id: "language",
    emoji: "🌐",
    label: "언어 설정",
    description: "앱 언어와 지역 표시를 변경할 수 있어요.",
  },
  {
    id: "security",
    emoji: "🔒",
    label: "개인정보 및 보안",
    description: "계정 보호와 로그인 정보를 확인해요.",
  },
  {
    id: "support",
    emoji: "💬",
    label: "고객센터",
    description: "문의 내역과 도움말을 확인할 수 있어요.",
  },
];