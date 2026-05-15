import "./EventTagBadge.css";
import { useLanguage } from "../../../contexts/useLanguage";

const tagConfig = {
  featured: { labelKey: "tags.featured", icon: "★", className: "event-tag-badge--featured" },
  hot: { labelKey: "tags.hot", icon: "●", className: "event-tag-badge--hot" },
  new: { labelKey: null, icon: "＋", className: "event-tag-badge--new", literalLabel: "NEW" },
  ongoing: { labelKey: "tags.ongoing", icon: "●", className: "event-tag-badge--ongoing" },
  completed: { labelKey: "tags.completed", icon: "✓", className: "event-tag-badge--completed" },
  ended: { labelKey: "tags.ended", icon: "○", className: "event-tag-badge--ended" },
};

export default function EventTagBadge({ tag }) {
  const { t } = useLanguage();
  const config = tagConfig[tag];

  if (!config) {
    return null;
  }

  const label = config.labelKey ? t(config.labelKey) : config.literalLabel;

  return (
    <span className={`event-tag-badge ${config.className}`}>
      <span aria-hidden="true">{config.icon}</span>
      <span>{label}</span>
    </span>
  );
}
