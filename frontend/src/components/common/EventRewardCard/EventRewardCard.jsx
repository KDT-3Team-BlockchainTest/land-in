import "./EventRewardCard.css";
import giftIcon from "../../../assets/icon/icon_gift_y.png";
import IconImage from "../IconImage/IconImage";

export default function EventRewardCard({ title, description }) {
  return (
    <section className="event-reward-card">
      <div className="event-reward-card__header">
        <span className="event-reward-card__badge">🏆</span>
        <h2 className="event-reward-card__title">{title}</h2>
      </div>

      <div className="event-reward-card__body">
        <IconImage src={giftIcon} size={18} />
        <p className="event-reward-card__description">{description}</p>
      </div>
    </section>
  );
}
