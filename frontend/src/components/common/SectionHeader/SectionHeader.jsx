import "./SectionHeader.css";
import rightArrowIcon from "../../../assets/icon/icon_right_arrow_p.png";
import IconImage from "../IconImage/IconImage";

export default function SectionHeader({ title, description, actionLabel }) {
  return (
    <div className="section-header">
      <div className="section-header__content">
        <h2 className="section-header__title">{title}</h2>
        {description && <p className="section-header__description">{description}</p>}
      </div>

      {actionLabel && (
        <button type="button" className="section-header__action">
          <span>{actionLabel}</span>
          <IconImage src={rightArrowIcon} size={14} />
        </button>
      )}
    </div>
  );
}
