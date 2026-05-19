import "./Header.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import IconImage from "../../common/IconImage/IconImage";
import globeIcon from "../../../assets/icon/icon_globe.png";
import { useLanguage } from "../../../i18n/LanguageContext";

const languages = [
  { id: "ko", label: "한국어 Korean", isDefault: true },
  { id: "en", label: "영어 English" },
  { id: "ja", label: "일본어 日本語" },
  { id: "zh", label: "중국어 中文" },
];

export default function Header() {
  const navigate = useNavigate();
  const { lang, changeLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <button
            type="button"
            className="app-header__brand"
            onClick={() => navigate("/")}
            aria-label="홈으로 이동"
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
              aria-label="언어 선택"
              onClick={() => setOpen(true)}
            >
              <IconImage src={globeIcon} size={20} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <>
          <div className="lang-popup__backdrop" onClick={() => setOpen(false)} />
          <div className="lang-popup" role="dialog" aria-label="언어 선택">
            {languages.map((item, index) => {
              const isSelected = lang === item.id;
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    className={`lang-popup__item ${isSelected ? "is-selected" : ""}`}
                    onClick={() => { changeLanguage(item.id); setOpen(false); }}
                  >
                    <span className="lang-popup__item-label">
                      {item.label}{item.isDefault ? t("language.default_suffix") : ""}
                    </span>
                    {isSelected && <span className="lang-popup__item-check">✓</span>}
                  </button>
                  {index < languages.length - 1 && <div className="lang-popup__divider" />}
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
