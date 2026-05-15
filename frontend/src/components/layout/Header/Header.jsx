import "./Header.css";
import { useNavigate } from "react-router-dom";
import IconImage from "../../common/IconImage/IconImage";
import globeIcon from "../../../assets/icon/icon_globe.png";
import { useLanguage } from "../../../contexts/useLanguage";

export default function Header() {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();

  const nextLanguageLabel = language === "ko" ? "EN" : "KO";

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <button
          type="button"
          className="app-header__brand"
          onClick={() => navigate("/")}
          aria-label={t("header.home")}
        >
          <span className="app-header__brand-mark">
            <img src="/icon_logo_test.png" alt="" aria-hidden="true" />
          </span>
          <span className="app-header__brand-text">land-in</span>
        </button>

        <div className="app-header__actions">
          <button
            type="button"
            className="app-header__icon-button app-header__icon-button--globe"
            aria-label={t("header.languageSelect")}
            onClick={toggleLanguage}
            title={t("header.languageSelect")}
          >
            <IconImage src={globeIcon} size={20} />
            <span className="app-header__language-tag" aria-hidden="true">
              {nextLanguageLabel}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
