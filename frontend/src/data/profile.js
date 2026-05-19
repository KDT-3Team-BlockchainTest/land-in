export function getAchievementItems(profileSummary = {}, t = (k) => k) {
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
      title: t("achievement.first_nft.title"),
      description: t("achievement.first_nft.desc"),
      state: stats.nftCount >= 1 ? "unlocked" : "progress",
      progress: { current: Math.min(stats.nftCount, 1), total: 1, label: t("achievement.first_nft.label") },
      color: "#fe6b70",
      backgroundColor: "rgba(254, 107, 112, 0.12)",
    },
    {
      id: "city-explorer",
      emoji: "🌆",
      title: t("achievement.city_explorer.title"),
      description: t("achievement.city_explorer.desc"),
      state: stats.cityCount >= 3 ? "unlocked" : "progress",
      progress: { current: Math.min(stats.cityCount, 3), total: 3, label: t("achievement.city_explorer.label") },
      color: "#8b5cf6",
      backgroundColor: "rgba(139, 92, 246, 0.12)",
    },
    {
      id: "collection-master",
      emoji: "🏆",
      title: t("achievement.collection_master.title"),
      description: t("achievement.collection_master.desc"),
      state: stats.completedCollectionCount >= 3 ? "unlocked" : "progress",
      progress: { current: Math.min(stats.completedCollectionCount, 3), total: 3, label: t("achievement.collection_master.label") },
      color: "#22c55e",
      backgroundColor: "rgba(34, 197, 94, 0.12)",
    },
    {
      id: "landmark-hunter",
      emoji: "📸",
      title: t("achievement.landmark_hunter.title"),
      description: t("achievement.landmark_hunter.desc"),
      state: stats.landmarkCount >= 30 ? "unlocked" : "progress",
      progress: { current: Math.min(stats.landmarkCount, 30), total: 30, label: t("achievement.landmark_hunter.label") },
      color: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.12)",
    },
    {
      id: "world-traveler",
      emoji: "🌍",
      title: t("achievement.world_traveler.title"),
      description: t("achievement.world_traveler.desc"),
      state: stats.countryCount >= 2 ? "unlocked" : "progress",
      progress: { current: Math.min(stats.countryCount, 2), total: 2, label: t("achievement.world_traveler.label") },
      color: "#06b6d4",
      backgroundColor: "rgba(6, 182, 212, 0.12)",
    },
  ];
}

export function getSettingsItems(t = (k) => k) {
  return [
    { id: "notification", emoji: "🔔", label: t("settings.notification.label"), description: t("settings.notification.desc"), to: "/settings/language" },
    { id: "language", emoji: "🌐", label: t("settings.language.label"), description: t("settings.language.desc"), to: "/settings/language" },
    { id: "security", emoji: "🔒", label: t("settings.security.label"), description: t("settings.security.desc") },
    { id: "support", emoji: "💬", label: t("settings.support.label"), description: t("settings.support.desc") },
  ];
}