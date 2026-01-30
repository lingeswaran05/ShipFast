import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import "../styles/runSheets.css";

export default function RunSheets() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="agent-dashboard">
      {/* NAVBAR */}
      <header className="agent-navbar">
        <div className="logo">🚚 <span>ShipFast</span></div>

        <nav className="agent-nav">
          <button onClick={() => navigate("/agent")}>Overview</button>
          <button onClick={() => navigate("/quick-book")}>Quick Book</button>
          <button onClick={() => navigate("/scan-parcels")}>Scan Parcels</button>
          <button className="active">Run Sheets</button>
          <button onClick={() => navigate("/cash-collection")}>Cash Collection</button>
        </nav>

        <button
          className="theme-toggle"
          onClick={() =>
            setTheme(prev => (prev === "dark" ? "light" : "dark"))
          }
        >
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

      {/* PAGE */}
      <main className="runs-container">
        <div className="runs-header">
          <div>
            <h2>Delivery Run Sheets</h2>
            <p>Manage and print delivery run sheets</p>
          </div>

          <button className="create-btn">Create New Run Sheet</button>
        </div>

        {/* STATS */}
        <div className="run-stats">
          <div className="state-card">
            <span>Active Runs</span>
            <h3>5</h3>
          </div>
          <div className="state-card">
            <span>Parcels on Route</span>
            <h3>42</h3>
          </div>
          <div className="state-card">
            <span>Completed Today</span>
            <h3>128</h3>
          </div>
        </div>

        {/* LIST */}
        <div className="runs-card">
          <h3>Today's Run Sheets</h3>

          <div className="run-item">
            <div className="run-info">
              <div className="run-icon">📄</div>
              <div>
                <strong>RS-001</strong>
                <p>Driver: Rajesh Kumar</p>
                <small>15 parcels • Started 08:30 AM</small>
              </div>
            </div>
            <div className="run-actions">
              <span className="status inprogress">In Progress</span>
              <span className="print">🖨️</span>
            </div>
          </div>

          <div className="run-item">
            <div className="run-info">
              <div className="run-icon">📄</div>
              <div>
                <strong>RS-002</strong>
                <p>Driver: Amit Singh</p>
                <small>12 parcels • Started 09:00 AM</small>
              </div>
            </div>
            <div className="run-actions">
              <span className="status inprogress">In Progress</span>
              <span className="print">🖨️</span>
            </div>
          </div>

          <div className="run-item">
            <div className="run-info">
              <div className="run-icon">📄</div>
              <div>
                <strong>RS-003</strong>
                <p>Driver: Priya Sharma</p>
                <small>18 parcels • Started 07:00 AM</small>
              </div>
            </div>
            <div className="run-actions">
              <span className="status completed">Completed</span>
              <span className="print">🖨️</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
