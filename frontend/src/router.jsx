import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// ⭐ 실제 데스크탑 파일명과 똑같이 대문자로 맞춤
import Login from "./pages/login_all/Login.jsx"; 
import Join from "./pages/login_all/Join.jsx";

import CollectionPage from "./pages/collection/CollectionPage.jsx";
import EventDetailPage from "./pages/event/EventDetailPage.jsx";
import HomePage from "./pages/home/Home.jsx";
import MyPage from "./pages/mypage/MyPage.jsx";
import MyProgressPage from "./pages/myProgress/MyProgressPage.jsx";
import NftGalleryPage from "./pages/nftGallery/NftGalleryPage.jsx";
import RewardsPage from "./pages/rewards/RewardsPage.jsx";
import TagPage from "./pages/tag/TagPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/join",
    element: <Join />,
  },
  {
    path: "/app",
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