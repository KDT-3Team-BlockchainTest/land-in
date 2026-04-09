export function getAchievementItems(profileSummary) {
  return [
    {
      id: "first-nft",
      emoji: "🎉",
      title: "첫 번째 NFT",
      description: "여행 중 첫 랜드마크 NFT를 수집했어요.",
      state: "unlocked",
      color: "#fe6b70",
      backgroundColor: "rgba(254, 107, 112, 0.12)",
    },
    {
      id: "city-explorer",
      emoji: "🌆",
      title: "도시 탐험가",
      description: "3개 이상의 도시 컬렉션에 참여해보세요.",
      state: profileSummary.cityCount >= 3 ? "unlocked" : "progress",
      progress: {
        current: profileSummary.cityCount,
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
      state: profileSummary.completedCollectionCount >= 3 ? "unlocked" : "progress",
      progress: {
        current: profileSummary.completedCollectionCount,
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
      state: profileSummary.landmarkCount >= 30 ? "unlocked" : "locked",
      progress: {
        current: profileSummary.landmarkCount,
        total: 30,
        label: "랜드마크 방문",
      },
      color: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.12)",
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
