import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import "../styles/scanParcels.css";

export default function ScanParcels() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="agent-dashboard">
      {/* NAVBAR */}
      <header className="agent-navbar">
        <div className="logo" onClick={() => navigate("/")}>
          🚚 <span>ShipFast</span>
        </div>

        <nav className="agent-nav">
          <button onClick={() => navigate("/agent")}>Overview</button>
          <button onClick={() => navigate("/quick-book")}>Quick Book</button>
          <button className="active">Scan Parcels</button>
          <button onClick={() => navigate('/run-sheets')}>Run Sheets</button>
          <button onClick={() => navigate("/cash-collection")}>Cash Collection</button>
        </nav>

        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? <IoSunnyOutline /> : <IoMoonOutline />}
        </button>

        <div className="agent-user">
          <img src="https://i.pravatar.cc/40" alt="user" />
          <div>
            <strong>Branch Owner</strong>
            <small>Branch Agent</small>
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="scan-container">
        <h2 className="page-title">Scan Parcels</h2>
        <p className="page-subtitle">
          Update parcel status by scanning tracking number
        </p>

        {/* SCAN CARD */}
        <div className="scan-card">
          <div className="scan-header">
            <div className="scan-icon">⌗</div>
            <h4>Scan Barcode or Enter Manually</h4>
            <p>
              Position the barcode within the frame or type the tracking number
            </p>
          </div>

          <div className="field">
            <label>Tracking Number</label>
            <input placeholder="SF123456789" />
          </div>

          <div className="field">
            <label>Update Status</label>
            <select defaultValue="Received at Hub">
              <option>Received at Hub</option>
              <option>Out for Delivery</option>
              <option>Delivered</option>
            </select>
          </div>

          <div className="field">
            <label>Location</label>
            <input defaultValue="Mumbai Central Branch" />
          </div>

          <div className="field">
            <label>Notes (Optional)</label>
            <textarea placeholder="Add any additional notes..." />
          </div>

          <button className="primary-btn">Update Status</button>
        </div>

        {/* RECENT SCANS */}
        <div className="recent-scans">
          <h3>Recent Scans</h3>

          <div className="recent-item">
            <div>
              <strong>SF123456789</strong>
              <p>Received at Hub</p>
            </div>
            <span>2 mins ago</span>
          </div>

          <div className="recent-item">
            <div>
              <strong>SF123456788</strong>
              <p>Out for Delivery</p>
            </div>
            <span>5 mins ago</span>
          </div>

          <div className="recent-item">
            <div>
              <strong>SF123456787</strong>
              <p>Delivered</p>
            </div>
            <span>15 mins ago</span>
          </div>
        </div>
      </main>
    </div>
  );
}
