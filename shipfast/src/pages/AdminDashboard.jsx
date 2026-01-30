import React, { useEffect, useState } from "react";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import "../styles/admindashboard.css";
import { useNavigate } from 'react-router-dom';
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="admin-root">
      {/* NAVBAR */}
      <header className="admin-navbar">
        <div className="brand">
          🚚 <span>ShipFast</span>
        </div>

        <nav className="nav-links">
          <button className="active" onClick={() => navigate('/agent')}>Overview</button>
          <button onClick={() => navigate('/branches-hubs')}>Branches & Hubs</button>
          <button onClick={() => navigate('/pricing')}>Pricing</button>
          <button onClick={() => navigate('/fleet')}>Fleet</button>
          <button onClick={() => navigate('/staff')}>Staff</button>
          <button onClick={() => navigate('/performance')}>Performance</button>
        </nav>

        <div className="nav-right">
          <button
            className="theme-btn"
            onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? <IoSunnyOutline /> : <IoMoonOutline />}
          </button>

          <div className="user-box">
            <img src="https://i.pravatar.cc/40" alt="admin" />
            <div>
              <strong>Admin User</strong>
              <small>Administrator</small>
            </div>
          </div>
        </div>
      </header>

      {/* PAGE */}
      <main className="admin-page">
        <div >
          <h1>Network Overview</h1>
          <p>System-wide performance and operations</p>
        </div>

        {/* TOP METRICS */}
        <div className="metric-row">
          <div className="metric blue">
            <h4>Active Shipments</h4>
            <h2>12,456</h2>
            <span>+8.2% from last week</span>
          </div>

          <div className="metric green">
            <h4>Revenue Today</h4>
            <h2>₹8,45,200</h2>
            <span>Target: ₹10,00,000</span>
          </div>

          <div className="metric orange">
            <h4>Active Branches</h4>
            <h2>45</h2>
            <span>Across 12 states</span>
          </div>

          <div className="metric purple">
            <h4>Fleet Vehicles</h4>
            <h2>128</h2>
            <span>98% operational</span>
          </div>
        </div>

        {/* INFO CARDS */}
        <div className="info-row">
          <div className="info-card">
            <h3>Delivery Performance</h3>
            <div className="info-line"><span>On-Time Delivery</span><b>94.2%</b></div>
            <div className="info-line"><span>Average Transit Time</span><b>2.3 days</b></div>
            <div className="info-line"><span>Customer Satisfaction</span><b>4.6/5</b></div>
          </div>

          <div className="info-card">
            <h3>Staff Overview</h3>
            <div className="info-line"><span>Total Staff</span><b>342</b></div>
            <div className="info-line"><span>Active Agents</span><b>156</b></div>
            <div className="info-line"><span>Drivers</span><b>98</b></div>
          </div>

          <div className="info-card">
            <h3>Revenue Breakdown</h3>
            <div className="info-line"><span>Express</span><b>₹5.2L</b></div>
            <div className="info-line"><span>Standard</span><b>₹3.2L</b></div>
            <div className="info-line"><span>Other Services</span><b>₹0.45L</b></div>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-card">
          <h3>Top Performing Branches</h3>

          <div className="branch-row">
            <div>
              <strong>Mumbai Central</strong>
              <p>2456 shipments</p>
            </div>
            <div className="profit">₹2.4L <span>+12%</span></div>
          </div>

          <div className="branch-row">
            <div>
              <strong>Delhi Hub</strong>
              <p>2134 shipments</p>
            </div>
            <div className="profit">₹2.1L <span>+8%</span></div>
          </div>

          <div className="branch-row">
            <div>
              <strong>Bangalore Tech Park</strong>
              <p>1876 shipments</p>
            </div>
            <div className="profit">₹1.9L <span>+15%</span></div>
          </div>
        </div>
      </main>
    </div>
  );
}
