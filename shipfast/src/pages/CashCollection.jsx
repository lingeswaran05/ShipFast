import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import "../styles/cashcollection.css";
import "../styles/agentDashboard.css";

export default function CashCollection() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

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
          <button onClick={() => navigate("/scan-parcels")}>Scan Parcels</button>
          <button onClick={() => navigate("/run-sheets")}>Run Sheets</button>
          <button className="active">Cash Collection</button>
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
          <img src="https://i.pravatar.cc/40" alt="agent" />
          <div>
            <strong>Branch Owner</strong>
            <small>Branch Agent</small>
          </div>
        </div>
      </header>

      {/* PAGE */}
      <main className="cash-container">
        <div className="cash-header">
          <div>
            <h2>Cash Collection Management</h2>
            <p>Track and manage cash on delivery collections</p>
          </div>
        </div>

        {/* STATS */}
        <div className="cash-stats">
          <div className="cash-stat">
            <span>Today's Collection</span>
            <h3>₹12,450</h3>
            <small>18 transactions</small>
          </div>

          <div className="cash-stat">
            <span>Pending COD</span>
            <h3>₹8,200</h3>
            <small>12 deliveries</small>
          </div>

          <div className="cash-stat">
            <span>This Month</span>
            <h3>₹3,24,500</h3>
            <small>245 transactions</small>
          </div>
        </div>

        {/* RECENT COLLECTIONS */}
        <div className="cash-card">
          <div className="cash-card-header">
            <h3>Recent Collections</h3>
            <button className="record-btn">Record Collection</button>
          </div>

          {[
            { id: "SF123456789", name: "Rajesh Kumar", amt: "₹850", time: "15 mins ago" },
            { id: "SF123456788", name: "Priya Sharma", amt: "₹1200", time: "1 hour ago" },
            { id: "SF123456787", name: "Amit Singh", amt: "₹650", time: "2 hours ago" },
            { id: "SF123456786", name: "Neha Patel", amt: "₹2100", time: "3 hours ago" }
          ].map((item, i) => (
            <div key={i} className="cash-row">
              <div className="cash-left">
                <div className="cash-icon">₹</div>
                <div>
                  <strong>{item.id}</strong>
                  <p>{item.name}</p>
                </div>
              </div>
              <div className="cash-right">
                <strong>{item.amt}</strong>
                <small>{item.time}</small>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
