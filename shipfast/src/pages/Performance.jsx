import React, { useEffect, useState } from "react";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "../styles/performance.css";

export default function Performance() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="admin-root">
      {/* NAVBAR */}
      <header className="admin-navbar">
        <div className="brand" onClick={() => navigate("/admin")}>
          🚚 <span>ShipFast</span>
        </div>

        <nav className="nav-links">
          <button onClick={() => navigate("/admin")}>Overview</button>
          <button onClick={() => navigate("/branches-hubs")}>Branches & Hubs</button>
          <button onClick={() => navigate("/pricing")}>Pricing</button>
          <button onClick={() => navigate("/fleet")}>Fleet</button>
          <button onClick={() => navigate("/staff")}>Staff</button>
          <button className="active">Performance</button>
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
        <div className="page-title">
          <h1>Performance Analytics</h1>
          <p>System-wide delivery performance metrics</p>
        </div>

        {/* METRICS */}
        <div className="bh-stats">
          <div className="bh-stat">
            <span>Delivery Success Rate</span>
            <h3>94.2%</h3>
            <small className="green">+2.1% from last month</small>
          </div>

          <div className="bh-stat">
            <span>Avg. Delivery Time</span>
            <h3>2.3 days</h3>
            <small className="green">-0.3 days improvement</small>
          </div>

          <div className="bh-stat">
            <span>Customer Satisfaction</span>
            <h3>4.6 / 5.0</h3>
            <small className="green">+0.2 from last month</small>
          </div>
        </div>

        {/* PERFORMANCE BY ZONE */}
        <div className="bh-card">
          <h3 className="section-title">Performance by Zone</h3>

          <ZoneRow
            label="Within City"
            shipments="4562 shipments"
            avg="Avg: 1.2 hours"
            percent="96% on-time"
            value={96}
          />
          <ZoneRow
            label="Zone A (Metro)"
            shipments="3421 shipments"
            avg="Avg: 1.5 days"
            percent="94% on-time"
            value={94}
          />
          <ZoneRow
            label="Zone B (State)"
            shipments="2156 shipments"
            avg="Avg: 2.5 days"
            percent="92% on-time"
            value={92}
          />
          <ZoneRow
            label="Zone C (Regional)"
            shipments="1245 shipments"
            avg="Avg: 3.5 days"
            percent="89% on-time"
            value={89}
          />
        </div>
      </main>
    </div>
  );
}

function ZoneRow({ label, shipments, avg, percent, value }) {
  return (
    <div className="zone-row">
      <div className="zone-top">
        <strong>{label}</strong>
        <div className="zone-meta">
          <span>{shipments}</span>
          <span>{avg}</span>
          <span className="green">{percent}</span>
        </div>
      </div>
      <div className="zone-bar">
        <div className="zone-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
