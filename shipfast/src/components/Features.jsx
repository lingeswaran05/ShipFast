import "../styles/features.css";

export default function Features() {
  return (
    <section className="features">
      <span className="pill">WHY PEOPLE CHOOSE SHIPFAST</span>

      <h2>Everything You Need, Nothing You Don’t</h2>

      <p>
        Shipping shouldn’t be complicated. We built ShipFast to keep things
        simple, fast, and stress-free — whether you’re sending one parcel or a
        thousand.
      </p>
      <div className="cards">
        <div className="card">
          <div className="icon orange">🌍</div>
          <h3>Pan-India Network</h3>
          <p>
            From big cities to small towns, we deliver across 20,000+ pin codes
            so your package reaches wherever it needs to go.
          </p>
        </div>

        <div className="card">
          <div className="icon yellow">⚡</div>
          <h3>Express Delivery</h3>
          <p>
            Running late? No worries. Choose express delivery and get your
            shipment delivered within 24–48 hours, nationwide.
          </p>
        </div>

        <div className="card">
          <div className="icon purple">🎧</div>
          <h3>24/7 Human Support</h3>
          <p>
            Questions at midnight? Issues on a Sunday? Our support team is
            always available to help you — no bots, no waiting.
          </p>
        </div>

        <div className="card">
          <div className="icon blue">📦</div>
          <h3>Easy Doorstep Pickup</h3>
          <p>
            Book a pickup in seconds and we’ll collect the package right from
            your home or office. Simple, convenient, and reliable.
          </p>
        </div>

        <div className="card">
          <div className="icon green">🔒</div>
          <h3>Safe & Insured Shipments</h3>
          <p>
            Every parcel is handled with care and fully insured, so you can
            ship with confidence every single time.
          </p>
        </div>

        <div className="card">
          <div className="icon pink">📊</div>
          <h3>Smart Control Dashboard</h3>
          <p>
            Track orders, view delivery status, and manage everything from one
            clean, easy-to-use dashboard.
          </p>
        </div>
      </div>
    </section>
  );
}
