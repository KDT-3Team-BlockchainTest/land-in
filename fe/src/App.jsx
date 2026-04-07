import { Outlet } from "react-router-dom";
import Header from "./components/layout/Header/Header";
import BottomNav from "./components/layout/BottomNav/BottomNav";

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-shell__content">
        <div className="app-shell__page">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}