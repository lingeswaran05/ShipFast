import "../styles/agentDashboard.css";

export default function AgentDashboard() {
  return (
    <div className="agent-dashboard">
      <header className="agent-navbar">
        <div className="logo">
          🚚 <span>ShipFast</span>
        </div>

        <nav className="agent-nav">
          <button className="active">Overview</button>
          <button>Quick Book</button>
          <button>Scan Parcels</button>
          <button>Run Sheets</button>
          <button>Cash Collection</button>
        </nav>

        <div className="agent-user">
          <img src="https://i.pravatar.cc/40" alt="agent" />
          <div>
            <strong>Agent User</strong>
            <small>Branch Agent</small>
          </div>
        </div>
      </header>
      <main className="agent-content">
        <h2>Agent Dashboard</h2>
        <p className="subtitle">Mumbai Central Branch</p>
        <div className="agent-stats">
          <div className="stat-card">
            <h4>Today's Bookings</h4>
            <h3>24</h3>
            <span>+3 from yesterday</span>
          </div>

          <div className="stat-card">
            <h4>Parcels Scanned</h4>
            <h3>156</h3>
            <span>Last 24 hours</span>
          </div>

          <div className="stat-card">
            <h4>Cash Collected</h4>
            <h3>₹12,450</h3>
            <span>Today</span>
          </div>

          <div className="stat-card">
            <h4>Pending Delivery</h4>
            <h3>18</h3>
            <span>Assigned to you</span>
          </div>
        </div>

        <div className="agent-actions">
          <div className="action blue">
            <h3>Quick Booking</h3>
            <p>Book walk-in customer shipments</p>
          </div>

          <div className="action orange">
            <h3>Scan Parcels</h3>
            <p>Update parcel status and location</p>
          </div>

          <div className="action dark">
            <h3>Delivery Runs</h3>
            <p>Generate and print run sheets</p>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <section className="activity">
          <h3>Recent Activity</h3>

          <div className="activity-item">
            <span>SF123456789</span>
            <p>Received at Hub</p>
            <small>10 mins ago</small>
          </div>

          <div className="activity-item">
            <span>SF123456788</span>
            <p>New Booking</p>
            <small>25 mins ago</small>
          </div>

          <div className="activity-item">
            <span>SF123456787</span>
            <p>Delivery Complete</p>
            <small>1 hour ago</small>
          </div>

          <div className="activity-item">
            <span>SF123456786</span>
            <p>Out for Delivery</p>
            <small>2 hours ago</small>
          </div>
        </section>
      </main>
    </div>
  );
}
