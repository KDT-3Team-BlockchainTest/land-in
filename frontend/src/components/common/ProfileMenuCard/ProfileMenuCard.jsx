import "./ProfileMenuCard.css";

export default function ProfileMenuCard({ items }) {
  return (
    <section className="profile-menu-card">
      {items.map((item, index) => (
        <div key={item.id}>
          <button type="button" className="profile-menu-card__item">
            <span className="profile-menu-card__emoji" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="profile-menu-card__content">
              <span className="profile-menu-card__label">{item.label}</span>
              <span className="profile-menu-card__description">{item.description}</span>
            </span>
            <span className="profile-menu-card__arrow" aria-hidden="true">
              →
            </span>
          </button>
          {index < items.length - 1 && <div className="profile-menu-card__divider" />}
        </div>
      ))}
    </section>
  );
}
