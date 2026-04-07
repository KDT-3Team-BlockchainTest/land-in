import { eventCatalog, featuredEvent } from "./events";

export const collectionFilters = [
  { id: "all", label: "전체" },
  { id: "ongoing", label: "진행 중" },
  { id: "completed", label: "완성" },
  { id: "ended", label: "종료" },
  { id: "nft", label: "NFT" },
];

const collectionStatusConfig = {
  ongoing: {
    label: "진행 중",
    tag: "ongoing",
    accentColor: "#fe6b70",
    accentSoft: "rgba(254, 107, 112, 0.1)",
  },
  completed: {
    label: "완성",
    tag: "completed",
    accentColor: "#22c55e",
    accentSoft: "rgba(34, 197, 94, 0.1)",
  },
  ended: {
    label: "종료",
    tag: "ended",
    accentColor: "#94a3b8",
    accentSoft: "rgba(148, 163, 184, 0.12)",
  },
};

const collectionSortOrder = {
  ongoing: 0,
  completed: 1,
  ended: 2,
};

function isJoinedCollection(event, joinedEventIds) {
  return joinedEventIds.includes(event.id);
}

export function getCollectionStatus(event, joinedEventIds = []) {
  if (!isJoinedCollection(event, joinedEventIds)) {
    return null;
  }

  if (event.status === "ended") {
    return "ended";
  }

  if (event.collected >= event.landmarkCount) {
    return "completed";
  }

  return "ongoing";
}

export function getTrackedCollections(joinedEventIds = []) {
  return eventCatalog
    .filter((event) => isJoinedCollection(event, joinedEventIds))
    .map((event) => {
      const collectionStatus = getCollectionStatus(event, joinedEventIds);
      const progressPercent =
        event.landmarkCount > 0 ? Math.round((event.collected / event.landmarkCount) * 100) : 0;

      return {
        ...event,
        collectionStatus,
        statusLabel: collectionStatusConfig[collectionStatus].label,
        statusTag: collectionStatusConfig[collectionStatus].tag,
        accentColor: collectionStatusConfig[collectionStatus].accentColor,
        accentSoft: collectionStatusConfig[collectionStatus].accentSoft,
        progressPercent,
      };
    })
    .sort((left, right) => {
      const orderGap =
        collectionSortOrder[left.collectionStatus] - collectionSortOrder[right.collectionStatus];

      if (orderGap !== 0) {
        return orderGap;
      }

      return right.collected - left.collected;
    });
}

export function getTrackedCollectionById(eventId, joinedEventIds = []) {
  return getTrackedCollections(joinedEventIds).find((collection) => collection.id === eventId);
}

export function getCollectionStats(joinedEventIds = []) {
  const trackedCollections = getTrackedCollections(joinedEventIds);
  const nftCount = trackedCollections.reduce(
    (total, collection) => total + collection.collectedNfts.length,
    0,
  );

  return {
    ongoingCount: trackedCollections.filter((collection) => collection.collectionStatus === "ongoing")
      .length,
    completedCount: trackedCollections.filter(
      (collection) => collection.collectionStatus === "completed",
    ).length,
    nftCount,
  };
}

export function getPrimaryProgressEventId(joinedEventIds = []) {
  const trackedCollections = getTrackedCollections(joinedEventIds);
  const ongoingCollection = trackedCollections.find(
    (collection) => collection.collectionStatus === "ongoing",
  );

  return ongoingCollection?.id ?? featuredEvent.id;
}

export function getFilteredCollections(filterId, joinedEventIds = []) {
  const trackedCollections = getTrackedCollections(joinedEventIds);

  if (filterId === "all") {
    return trackedCollections;
  }

  return trackedCollections.filter((collection) => collection.collectionStatus === filterId);
}

export function getCollectedNfts(joinedEventIds = []) {
  return getTrackedCollections(joinedEventIds).flatMap((collection) =>
    collection.collectedNfts.map((nft) => ({
      ...nft,
      collectionId: collection.id,
      collectionTitle: collection.title,
      collectionStatus: collection.collectionStatus,
      collectionStatusLabel: collection.statusLabel,
      collectionTag: collection.statusTag,
      collectionPeriod: collection.period,
      collectionRegion: collection.region,
      accentColor: collection.accentColor,
      collectionImage: collection.image,
    })),
  );
}
