import "./BottomNav.css";
import { useLocation, useNavigate } from "react-router-dom";
import IconImage from "../../common/IconImage/IconImage";
import { FiMap } from "react-icons/fi";
import bookGrayIcon from "../../../assets/icon/icon_book_g.png";
import bookPrimaryIcon from "../../../assets/icon/icon_book_p.png";
import giftGrayIcon from "../../../assets/icon/icon_gift_g.png";
import giftPrimaryIcon from "../../../assets/icon/icon_gift_p.png";
import homeGrayIcon from "../../../assets/icon/icon_home_g.png";
import homePrimaryIcon from "../../../assets/icon/icon_home_p.png";
import userGrayIcon from "../../../assets/icon/icon_user_g.png";
import userPrimaryIcon from "../../../assets/icon/icon_user_p.png";
import { useLanguage } from "../../../contexts/useLanguage";

const navItems = [
  { key: "home", labelKey: "nav.home", path: "/", activeIcon: homePrimaryIcon, inactiveIcon: homeGrayIcon },
  {
    key: "collection",
    labelKey: "nav.collection",
    path: "/collection",
    activeIcon: bookPrimaryIcon,
    inactiveIcon: bookGrayIcon,
  },
  { key: "tag", labelKey: "nav.tag", path: "/tag", icon: "/icon_logo_test_w.png", primary: true },
  {
    key: "reward",
    labelKey: "nav.reward",
    path: "/reward",
    activeIcon: giftPrimaryIcon,
    inactiveIcon: giftGrayIcon,
  },
  {
    key: "mypage",
    labelKey: "nav.mypage",
    path: "/mypage",
    activeIcon: userPrimaryIcon,
    inactiveIcon: userGrayIcon,
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav" aria-label={t("nav.bottomNav")}>
      <div className="bottom-nav__inner">
        <button
          type="button"
          className="bottom-nav__map-button"
          onClick={() => navigate("/my-progress")}
          aria-label={t("nav.progress")}
        >
          <FiMap size={20} />
        </button>

        {navItems.map((item) => {
          const active = isActive(item.path);
          const iconSrc = item.primary ? item.icon : active ? item.activeIcon : item.inactiveIcon;
          const label = t(item.labelKey);

          return (
            <button
              key={item.key}
              type="button"
              className={[
                "bottom-nav__item",
                active ? "is-active" : "",
                item.primary ? "is-primary" : "",
              ]
                .join(" ")
                .trim()}
              onClick={() => navigate(item.path)}
              aria-label={label}
              aria-current={active ? "page" : undefined}
            >
              <span className="bottom-nav__icon">
                <IconImage src={iconSrc} size={item.primary ? 24 : 20} />
              </span>
              <span className="bottom-nav__label">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
