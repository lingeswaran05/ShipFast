import React, { useEffect, useState } from "react";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "../styles/pricing.css";

export default function Pricing() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="admin-root">
      {/* NAVBAR */}
      <header className="admin-navbar">
        <div className="brand" onClick={() => navigate("/")}>
          🚚 <span>ShipFast</span>
        </div>

        <nav className="nav-links">
          <button onClick={() => navigate("/admin")}>Overview</button>
          <button onClick={() => navigate("/branches-hubs")}>Branches & Hubs</button>
          <button className="active">Pricing</button>
          <button onClick={() => navigate("/fleet")}>Fleet</button>
          <button onClick={() => navigate("/staff")}>Staff</button>
          <button onClick={() => navigate("/performance")}>Performance</button>
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
      <main className="pricing-page">
        <div className="pricing-header">
          <div>
            <h1>Pricing & Zones Configuration</h1>
            <p>Manage shipping rates and pricing tables</p>
          </div>
          <button className="add-zone-btn">Add New Zone</button>
        </div>

        {/* BASE RATES */}
        <div className="pricing-card">
          <h2>Base Rates by Service Type</h2>

          <div className="rates-grid">
            <div>
              <h3>Express Delivery</h3>
              <RateRow label="0-1 kg" value="₹100" />
              <RateRow label="1-5 kg" value="₹250" />
              <RateRow label="5-10 kg" value="₹450" />
              <RateRow label="10+ kg" value="₹600 + ₹40/kg" />
            </div>

            <div>
              <h3>Standard Delivery</h3>
              <RateRow label="0-1 kg" value="₹60" />
              <RateRow label="1-5 kg" value="₹150" />
              <RateRow label="5-10 kg" value="₹280" />
              <RateRow label="10+ kg" value="₹380 + ₹25/kg" />
            </div>
          </div>
        </div>

        {/* ZONE MULTIPLIERS */}
        <div className="pricing-card">
          <h3 className="zone-title">Zone Multipliers</h3>

          <ZoneRow title="Within City" desc="Same city delivery" value="1.0x" />
          <ZoneRow title="Zone A (Metro)" desc="Major metro cities" value="1.2x" />
          <ZoneRow title="Zone B (State)" desc="Within state delivery" value="1.5x" />
          <ZoneRow title="Zone C (Regional)" desc="Regional inter-state" value="2.0x" />
          <ZoneRow title="Zone D (Remote)" desc="Remote & hill stations" value="2.5x" />
        </div>
      </main>
    </div>
  );
}

function RateRow({ label, value }) {
  return (
    <div className="rate-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ZoneRow({ title, desc, value }) {
  return (
    <div className="zone-row">
      <div>
        <strong>{title}</strong>
        <p>{desc}</p>
      </div>
      <div className="zone-right">
        <span>{value}</span>
        <button>Edit</button>
      </div>
    </div>
  );
}
