import { Outlet } from "react-router-dom";
import Header from "./components/layout/Header/Header";
import BottomNav from "./components/layout/BottomNav/BottomNav";
import NfcPermissionPrompt from "./components/nfc/NfcPermissionPrompt";
import { LanguageProvider } from "./i18n/LanguageContext";


export default function App() {
  return (
    <LanguageProvider>
    <div className="app-shell">
      <NfcPermissionPrompt />
      <Header />
      <main className="app-shell__content">
        <div className="app-shell__page">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
    </LanguageProvider>
  );
}
