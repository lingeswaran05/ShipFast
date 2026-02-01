import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoLocationOutline,
  IoSunnyOutline,
  IoMoonOutline,
} from "react-icons/io5";
import { useState, useEffect } from "react";
import "../styles/agentDashboard.css";
export default function AgentDashboard() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark"); // default = dark
  
    // Apply theme globally
    useEffect(() => {
      document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);
  
    const toggleTheme = () => {
      setTheme(prev => (prev === "dark" ? "light" : "dark"));
    };

  return (
    <div className="agent-dashboard">
      <header className="agent-navbar">
        <div className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          🚚 <span>ShipFast</span>
        </div>
        

        <nav className="agent-nav">
          <button className="active" onClick={() => navigate('/agent')}>Overview</button>
          {/* NAVIGATION TRIGGER 1 */}
          <button onClick={() => navigate('/quick-book')}>Quick Book</button>
          <button onClick={() => navigate('/scan-parcels')}>Scan Parcels</button>
          <button onClick={() => navigate('/run-sheets')}>Run Sheets</button>
          <button onClick={() => navigate('/cash-collection')}>Cash Collection</button>
        </nav>
        <div className="nav-actions">
        {/* THEME TOGGLE */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? <IoSunnyOutline /> : <IoMoonOutline />}
        </button>
</div>
        <div className="agent-user">
          <img src="https://i.pravatar.cc/40" alt="agent" />
          <div>
            <strong>Branch Owner</strong>
            <small>Branch Agent</small>
          </div>
        </div>
      </header>

      <main className="agent-content">
        <h2>Agent Dashboard</h2>
        <p className="subtitle">Mumbai Central Branch</p>
        
        <div className="agent-stats">
          <div className="state-cards">
            <div className="stat-header">
               <h4>Today's Bookings</h4>
               <span className="icon">📦</span>
            </div>
            <h3>24</h3>
            <span className="trend">+3 from yesterday</span>
          </div>

          <div className="state-cards">
            <div className="stat-header">
               <h4>Parcels Scanned</h4>
               <span className="icon">🔍</span>
            </div>
            <h3>156</h3>
            <span>Last 24 hours</span>
          </div>

          <div className="state-cards">
            <div className="stat-header">
               <h4>Cash Collected</h4>
               <span className="icon">💰</span>
            </div>
            <h3>₹12,450</h3>
            <span>Today</span>
          </div>

          <div className="state-cards">
            <div className="stat-header">
               <h4>Pending Delivery</h4>
               <span className="icon">📄</span>
            </div>
            <h3>18</h3>
            <span>Assigned to you</span>
          </div>
        </div>

        <div className="agent-actions">
          {/* NAVIGATION TRIGGER 2 */}
          <div className="action blue" onClick={() => navigate('/quick-book')}>
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

        <section className="activity">
          <h3 className="activity-title">Recent Activity</h3>
          {[
            { id: "SF123456789", status: "Received at Hub", time: "10 mins ago" },
            { id: "SF123456788", status: "New Booking", time: "25 mins ago" },
            { id: "SF123456787", status: "Delivery Complete", time: "1 hour ago" }
          ].map((item, i) => (
            <div key={i} className="activity-item">
              <span className="activity-id">{item.id}</span>
              <p className="activity-status">{item.status}</p>
              <small className="activity-time">{item.time}</small>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}