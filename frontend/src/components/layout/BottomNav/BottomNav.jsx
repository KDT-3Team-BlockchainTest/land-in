import "./BottomNav.css";
import { useLocation, useNavigate } from "react-router-dom";
import IconImage from "../../common/IconImage/IconImage";
import { FiMap } from "react-icons/fi"; // 지도 아이콘 변경
import bookGrayIcon from "../../../assets/icon/icon_book_g.png";
import bookPrimaryIcon from "../../../assets/icon/icon_book_p.png";
import giftGrayIcon from "../../../assets/icon/icon_gift_g.png";
import giftPrimaryIcon from "../../../assets/icon/icon_gift_p.png";
// import globeIcon from "../../../assets/icon/icon_globe.png";
import homeGrayIcon from "../../../assets/icon/icon_home_g.png";
import homePrimaryIcon from "../../../assets/icon/icon_home_p.png";
import userGrayIcon from "../../../assets/icon/icon_user_g.png";
import userPrimaryIcon from "../../../assets/icon/icon_user_p.png";

const navItems = [
  { key: "home", label: "홈", path: "/", activeIcon: homePrimaryIcon, inactiveIcon: homeGrayIcon },
  {
    key: "collection",
    label: "컬렉션",
    path: "/collection",
    activeIcon: bookPrimaryIcon,
    inactiveIcon: bookGrayIcon,
  },
  { key: "tag", label: "태그", path: "/tag", icon: "/icon_logo_test_w.png", primary: true },
  {
    key: "reward",
    label: "리워드",
    path: "/reward",
    activeIcon: giftPrimaryIcon,
    inactiveIcon: giftGrayIcon,
  },
  {
    key: "mypage",
    label: "마이페이지",
    path: "/mypage",
    activeIcon: userPrimaryIcon,
    inactiveIcon: userGrayIcon,
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav" aria-label="하단 내비게이션">
      <div className="bottom-nav__inner">
        <button
          type="button"
          className="bottom-nav__map-button"
          onClick={() => navigate("/my-progress")}
          aria-label="내 진행 현황 보기"
        >
          <FiMap size={20} /> {/* 지도 아이콘 변경 */}
        </button>

        {navItems.map((item) => {
          const active = isActive(item.path);
          const iconSrc = item.primary ? item.icon : active ? item.activeIcon : item.inactiveIcon;

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
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <span className="bottom-nav__icon">
                <IconImage src={iconSrc} size={item.primary ? 24 : 20} />
              </span>
              <span className="bottom-nav__label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
