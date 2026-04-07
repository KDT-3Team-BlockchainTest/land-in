import "./Header.css";
import { useNavigate } from "react-router-dom";
import IconImage from "../../common/IconImage/IconImage";
import globeIcon from "../../../assets/icon/icon_globe.png";

export default function Header() {
  const navigate = useNavigate();

  return (
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
          >
            <IconImage src={globeIcon} size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
