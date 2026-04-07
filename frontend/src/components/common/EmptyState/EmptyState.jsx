import "./EmptyState.css";

export default function EmptyState({ icon, title, description, children }) {
  return (
    <section className="empty-state">
      {icon && (
        <div className="empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <h2 className="empty-state__title">{title}</h2>
      {description && <p className="empty-state__description">{description}</p>}
      {children}
    </section>
  );
}
