import { createBrowserRouter } from "react-router-dom";
import RequireAuth from "./components/auth/RequireAuth";
import Login from "./pages/login_all/Login";
import Join from "./pages/login_all/Join";
import OAuthCallback from "./pages/login_all/OAuthCallback";
import ProfileSetupPage from "./pages/profile/ProfileSetupPage";
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
    path: "/oauth/callback",
    element: <OAuthCallback />,
  },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "profile/setup", element: <ProfileSetupPage /> },
      { path: "collection", element: <CollectionPage /> },
      { path: "tag", element: <TagPage /> },
      { path: "reward", element: <RewardsPage /> },
      { path: "mypage", element: <MyPage /> },
      { path: "wallet/connect", element: <WalletConnectPage /> },
      { path: "my-progress", element: <MyProgressPage /> },
      { path: "event/:eventId", element: <EventDetailPage /> },
      { path: "nft-gallery/:eventId", element: <NftGalleryPage /> },
    ],
  },
]);

export default router;
