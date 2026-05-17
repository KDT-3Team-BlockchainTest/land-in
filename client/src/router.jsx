import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// Tenant pages
import Home from "./components/tenant/home.jsx";
import MyContract from "./components/tenant/myContract.jsx";
import Wishlist from "./components/tenant/wishlist.jsx";
import MyPage from "./components/tenant/myPage.jsx";
import LoginTest from "./components/tenant/loginTest.jsx";

const router = createBrowserRouter([
  { path: "/login", element: <LoginTest /> },
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "contract", element: <MyContract /> },
      { path: "save", element: <Wishlist /> },
      { path: "mypage", element: <MyPage /> },
    ],
  },
]);

export default router;