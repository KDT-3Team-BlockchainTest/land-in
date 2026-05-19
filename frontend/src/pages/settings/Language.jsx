import "./Settings.shared.css";
import "./Language.css";

import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";

const languages = [
  { id: "ko", label: "한국어 Korean", defaultLang: true },
  { id: "en", label: "영어 English" },
  { id: "ja", label: "일본어 日本語" },
  { id: "zh", label: "중국어 中文" },
];

export default function Language() {
  const navigate = useNavigate();
  const { lang, changeLanguage, t } = useLanguage();

  return (
    <div className="page-layout">
      <main className="page-layout__content">
        <button type="button" className="settings-back" onClick={() => navigate(-1)}>
          {t("language.title")}
        </button>

        <section className="language-card">
          {languages.map((item, index) => {
            const isSelected = lang === item.id;
            return (
              <div key={item.id}>
                <button
                  type="button"
                  className={`language-item ${isSelected ? "is-selected" : ""}`}
                  onClick={() => changeLanguage(item.id)}
                >
                  <span className="language-item__label">
                    {item.label}{item.defaultLang ? t("language.default_suffix") : ""}
                  </span>
                  {isSelected && <span className="language-item__check">✓</span>}
                </button>
                {index < languages.length - 1 && <div className="language-divider" />}
              </div>
            );
          })}
        </section>

        <button type="button" className="settings-fab-back" onClick={() => navigate(-1)} aria-label="뒤로가기">
          ←
        </button>
      </main>
    </div>
  );
}