import "./GradientActionButton.css";
import rightArrowIconW from "../../../assets/icon/icon_right_arrow_w.png";
import sparklesIcon from "../../../assets/icon/icon_sparkles_w.png";
import IconImage from "../IconImage/IconImage";

export default function GradientActionButton({ label, onClick }) {
  return (
    <button type="button" className="gradient-action-button" onClick={onClick}>
      <span className="gradient-action-button__content">
        <IconImage src={sparklesIcon} size={18} />
        <span>{label}</span>
      </span>
      <IconImage src={rightArrowIconW} size={16} />
    </button>
  );
}
