import "./EventTagBadge.css";

const tagConfig = {
  featured: {
    label: "추천",
    icon: "★",
    className: "event-tag-badge--featured",
  },
  hot: {
    label: "인기",
    icon: "●",
    className: "event-tag-badge--hot",
  },
  new: {
    label: "NEW",
    icon: "＋",
    className: "event-tag-badge--new",
  },
  ongoing: {
    label: "진행 중",
    icon: "●",
    className: "event-tag-badge--ongoing",
  },
  completed: {
    label: "완성",
    icon: "✓",
    className: "event-tag-badge--completed",
  },
  ended: {
    label: "종료",
    icon: "○",
    className: "event-tag-badge--ended",
  },
};

export default function EventTagBadge({ tag }) {
  const config = tagConfig[tag];

  if (!config) {
    return null;
  }

  return (
    <span className={`event-tag-badge ${config.className}`}>
      <span aria-hidden="true">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
