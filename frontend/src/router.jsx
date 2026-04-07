import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import CollectionPage from "./pages/collection/CollectionPage";
import EventDetailPage from "./pages/event/EventDetailPage";
import HomePage from "./pages/home/Home";
import MyPage from "./pages/mypage/MyPage";
import MyProgressPage from "./pages/myProgress/MyProgressPage";
import NftGalleryPage from "./pages/nftGallery/NftGalleryPage";
import RewardsPage from "./pages/rewards/RewardsPage";
import TagPage from "./pages/tag/TagPage";

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
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
