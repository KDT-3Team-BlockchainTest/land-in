import "./ProgressBanner.css";
import rightArrowIcon from "../../../assets/icon/icon_right_arrow_p.png";
import sparklesIcon from "../../../assets/icon/icon_sparkles_w.png";
import IconImage from "../IconImage/IconImage";

export default function ProgressBanner({ title, description, onClick }) {
  return (
    <button type="button" className="progress-banner" onClick={onClick}>
      <span className="progress-banner__icon">
        <IconImage src={sparklesIcon} size={20} />
      </span>

      <span className="progress-banner__content">
        <span className="progress-banner__title">{title}</span>
        <span className="progress-banner__description">{description}</span>
      </span>

      <span className="progress-banner__arrow">
        <IconImage src={rightArrowIcon} size={16} />
      </span>
    </button>
  );
}
