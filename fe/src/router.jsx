import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import CollectionPage from "./pages/collection/CollectionPage";
import EventDetailPage from "./pages/event/EventDetailPage";
import HomePage from "./pages/home/Home";
import MyPage from "./pages/mypage/MyPage";
import MyProgressPage from "./pages/myProgress/MyProgressPage";
import NftGalleryPage from "./pages/nftGallery/NftGalleryPage";
import RewardsPage from "./pages/rewards/RewardsPage";
import TagPage from "./pages/tag/TagPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "collection", element: <CollectionPage /> },
      { path: "tag", element: <TagPage /> },
      { path: "reward", element: <RewardsPage /> },
      { path: "mypage", element: <MyPage /> },
      { path: "my-progress", element: <MyProgressPage /> },
      { path: "event/:eventId", element: <EventDetailPage /> },
      { path: "nft-gallery/:eventId", element: <NftGalleryPage /> },
    ],
  },
]);

export default router;
