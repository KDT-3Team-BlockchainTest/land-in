import { createBrowserRouter, Navigate } from "react-router-dom";
import Language from "./pages/settings/Language.jsx";
import RequireAuth from "./components/auth/RequireAuth";
import Login from "./pages/login_all/Login";
import Join from "./pages/login_all/Join";
import CollectionPage from "./pages/collection/CollectionPage";
import EventDetailPage from "./pages/event/EventDetailPage";
import HomePage from "./pages/home/Home";
import MyPage from "./pages/mypage/MyPage";
import MyProgressPage from "./pages/myProgress/MyProgressPage";
import NftGalleryPage from "./pages/nftGallery/NftGalleryPage";
import RewardsPage from "./pages/rewards/RewardsPage";
import TagPage from "./pages/tag/TagPage";
import WalletConnectPage from "./pages/wallet/WalletConnectPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/join",
    element: <Join />,
  },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "settings/language", element: <Language /> },
      { path: "collection", element: <CollectionPage /> },
      { path: "tag", element: <TagPage /> },
      { path: "reward", element: <RewardsPage /> },
      { path: "mypage", element: <MyPage /> },
      { path: "wallet/connect", element: <WalletConnectPage /> },
      { path: "my-progress", element: <MyProgressPage /> },
      { path: "event/:eventId", element: <EventDetailPage /> },
      { path: "nft-gallery/:eventId", element: <NftGalleryPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;
