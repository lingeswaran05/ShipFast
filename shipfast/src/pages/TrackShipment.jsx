import "./TrackShipment.css";

export default function TrackShipment() {
  return (
    <section className="track-page">
      <h1>Track Your Shipment</h1>
      <p>Enter your tracking number to see real-time updates</p>

      <div className="track-box">
        <input
          type="text"
          placeholder="Enter tracking number (e.g. SF123456789)"
        />
        <button className="track-btn">Track</button>
      </div>
    </section>
  );
}
