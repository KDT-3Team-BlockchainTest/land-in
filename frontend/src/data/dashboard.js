import { getCollectedNfts, getTrackedCollections } from "./collections";

export function getTagDashboard(joinedEventIds = []) {
  const trackedCollections = getTrackedCollections(joinedEventIds);
  const activeCollections = trackedCollections.filter(
    (collection) => collection.collectionStatus === "ongoing",
  );
  const collectedNfts = getCollectedNfts(joinedEventIds);

  return {
    activeCollections,
    totalNfts: collectedNfts.length,
    joinedCities: trackedCollections.length,
    activeEventsCount: activeCollections.length,
  };
}

export function getProfileSummary(joinedEventIds = []) {
  const trackedCollections = getTrackedCollections(joinedEventIds);
  const collectedNfts = getCollectedNfts(joinedEventIds);
  const completedCollections = trackedCollections.filter(
    (collection) => collection.collectionStatus === "completed",
  );

  const landmarkCount = trackedCollections.reduce(
    (total, collection) => total + collection.collected,
    0,
  );

  return {
    nftCount: collectedNfts.length,
    cityCount: trackedCollections.length,
    countryCount: trackedCollections.length > 0 ? Math.min(3, trackedCollections.length) : 0,
    completedCollectionCount: completedCollections.length,
    landmarkCount,
    totalDistanceLabel: "8,240 km",
  };
}
