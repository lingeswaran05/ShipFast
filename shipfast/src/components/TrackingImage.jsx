import "./trackingImage.css";

export default function TrackingImage() {
  return (
    <div className="image-wrapper">
      <img
        src="/delivery-person.jpg"
        alt="Delivery tracking"
        className="bg-image"
      />
      <div className="tracking-card">
        <div className="tracking-text">
          <span>Tracking Number</span>
          <strong>SF-123456789</strong>
        </div>

        <div className="tracking-icon">
          📦
        </div>
      </div>
      <div className="express-badge">
        <span>Express Delivery</span>
        <strong>24 Hours</strong>
      </div>
    </div>
  );
}
