import "./ProgressBar.css";

export default function ProgressBar({
  value,
  max,
  className = "",
  fillClassName = "",
  trackClassName = "",
}) {
  const safeMax = max > 0 ? max : 1;
  const progressPercent = Math.min(Math.max(Math.round((value / safeMax) * 100), 0), 100);

  return (
    <div
      className={["progress-bar", trackClassName, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <div
        className={["progress-bar__fill", fillClassName].filter(Boolean).join(" ")}
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  );
}
