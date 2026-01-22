import "../styles/adminDashboard.css";

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <header className="admin-navbar">
        <div className="logo">
          🚚 <span>ShipFast</span>
        </div>
        <nav className="admin-nav">
          <button className="active">Overview</button>
          <button>Branches&Hubs</button>
          <button>Pricing</button>
          <button>Fleet</button>
          <button>Staff</button>
          <button>Performance</button>
        </nav>
        <div className="admin-user">
          <img src="https://i.pravatar.cc/40" alt="agent" />
          <div>
            <strong>Admin User</strong>
            <small>Administrator</small>
          </div>
        </div>
      </header>
      <main className="admin-content">
        <h2>Network Overview</h2>
        <p className="subtitle">
          System-wide performance and operations
        </p>
        <div className="admin-stats">
          <div className="stat blue">
            <h4>Active Shipments</h4>
            <h3>12,456</h3>
            <span>+8.2% from last week</span>
          </div>
          <div className="stat green">
            <h4>Revenue Today</h4>
            <h3>₹8,45,200</h3>
            <span>Target: ₹10,00,000</span>
          </div>
          <div className="stat orange">
            <h4>Active Branches</h4>
            <h3>45</h3>
            <span>Across 12 States</span>
          </div>
          <div className="stat purple">
            <h4>Fleet Vehicles</h4>
            <h3>128</h3>
            <span>98% Operational</span>
          </div>
          </div>
          <div className="admin-cards">
            <div className="card">
              <h4>Delivery Performance</h4>
              <p>On-Time Delivery</p><span>94.2%</span>
              <p>Average Transit Time</p><span>2.3 Days</span>
              <p>Customer Satisfaction</p><span>4.6/5</span>
              </div>
            <div className="card">
              <h4>Staff Overview</h4>
              <p>Total Staff</p><span>342</span>
              <p>Active Agents</p><span>156</span>
              <p>Drivers</p><span>98</span>
              </div>
            <div className="card">
              <h4>Revenue Breakdown</h4>
              <p>Express</p><span>₹5.2L</span>
              <p>Standard</p><span>₹3.2L</span>
              <p>Other Service</p><span>₹0.45L</span>
              </div>
         
          </div>
           <section className="branches">
            <h3>Top Performing Branches</h3>
            <div className="branch">
              <div>
                <strong>Mumbai Centeral</strong>
                <small>2456 shipments</small>
              </div>
              <span className="positive">₹2.4L (+12%)</span>
            </div>
            <div className="branch">
            <div>
              <strong>Delhi Hub</strong>
              <small>2134 shipments</small>
            </div>
            <span className="positive">₹2.1L (+8%)</span>
          </div>
          <div className="branch">
            <div>
              <strong>Bangalore Tech Park</strong>
              <small>1876 shipments</small>
            </div>
            <span className="positive">₹1.9L (+15%)</span>
          </div>
          </section>
      </main>
      </div>
  );
}
