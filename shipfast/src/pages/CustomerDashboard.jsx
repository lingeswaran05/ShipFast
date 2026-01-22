import "../styles/customerDashboard.css";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
    const navigate = useNavigate();

  return (
    <div className="dashboard">
      <header className="dashboard-navbar">
        <div className="logo">Welcome back, Customer User! 👋

        </div>

       <nav className="nav-links">
 <button
    className="active"
    onClick={() => navigate("/customer")}
  >
    Overview
  </button>

  <button
    onClick={() => navigate("/customer/new-booking")}
  >
    New Booking
  </button>
</nav>
        <div className="user-info">
          <img
            src="https://i.pravatar.cc/40"
            alt="Customer profile"
            className="avatar"
          />
          <div>
            <strong>Customer User</strong>


            <small>Logged in as Customer</small>
          </div>
        </div>
      </header>
      <main className="dashboard-content">
        <div className="top-cards">
          <div className="card book">
            <h3>Book a New Shipment</h3>
            <p>
              Create a new shipment in seconds and get an instant delivery quote.
            </p>
          </div>

          <div className="card track">
            <h3>Track Your Package</h3>
            <input placeholder="Enter your tracking number" />
            <button>Track Shipment</button>
          </div>
        </div>
        <div className="stats">
          <div className="stat blue">
            <h2>12</h2>
            <p>Active Shipments</p>
          </div>
          <div className="stat purple">
            <h2>48</h2>
            <p>Successfully Delivered</p>
          </div>
          <div className="stat orange">
            <h2>5</h2>
            <p>Express Deliveries</p>
          </div>
          <div className="stat green">
            <h2>34</h2>
            <p>Standard Deliveries</p>
          </div>
        </div>
        <section className="recent">
          <div className="recent-header">
            <h3>Recent Shipments</h3>
            <span className="link">View all shipments</span>
          </div>

          <div className="shipment">
            <strong>SF123456789</strong>
            <span>Destination: Mumbai</span>
            <span className="status transit">In Transit</span>
          </div>

          <div className="shipment">
            <strong>SF123456788</strong>
            <span>Destination: Delhi</span>
            <span className="status out">Out for Delivery</span>
          </div>

          <div className="shipment">
            <strong>SF123456787</strong>
            <span>Destination: Bangalore</span>
            <span className="status delivered">Delivered</span>
          </div>
        </section>
      </main>
    </div>
  );
}
