import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/quickbook.css"; // Reuse the layout CSS
import "../styles/agentDashboard.css";
import { useState, useEffect } from "react";
import {
  IoLocationOutline,
  IoSunnyOutline,
  IoMoonOutline,
} from "react-icons/io5";
export default function QuickBook() {
  const navigate = useNavigate();
   const [theme, setTheme] = useState("dark");
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
          <button onClick={() => {navigate('/agent');}}>Overview</button>
          <button className="active">Quick Book</button>
          <button onClick={() => {navigate('/scan-parcels');}}>Scan Parcels</button>
          <button onClick={() => navigate('/run-sheets')}>Run Sheets</button>
          <button onClick={() => navigate("/cash-collection")}>Cash Collection</button>
        </nav>
         <div className="nav-actions">
                {/* THEME TOGGLE */}
                <button className="theme-toggle" onClick={toggleTheme}>
                  {theme === "dark" ? <IoSunnyOutline /> : <IoMoonOutline />}
                </button>
        </div>
        <div className="agent-user">
          <img src="https://i.pravatar.cc/40" alt="agent" />
          <div><strong>Branch Owner</strong><small>Branch Agent</small></div>
        </div>
      </header>

      <main className="form-container">
        <h2 className="form-title">Quick Booking</h2>
        <p className="subtitle">Book walk-in customer shipments</p>

        <div className="booking-card">
          {/* Section 1 */}
          <div className="form-section">
            <div className="section-label"><span className="step s1">1</span> Sender Details</div>
            <div className="grid-2">
              <div className="input-field"><label>Sender Name *</label><input type="text" placeholder="Full name" /></div>
              <div className="input-field"><label>Phone Number *</label><input type="text" placeholder="+91 98765 43210" /></div>
              <div className="input-field full"><label>Pickup Address *</label><textarea placeholder="Complete address with landmark"></textarea></div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="form-section">
            <div className="section-label"><span className="step s2">2</span> Receiver Details</div>
            <div className="grid-2">
              <div className="input-field"><label>Receiver Name *</label><input type="text" placeholder="Full name" /></div>
              <div className="input-field"><label>Phone Number *</label><input type="text" placeholder="+91 98765 43210" /></div>
              <div className="input-field full"><label>Delivery Address *</label><textarea placeholder="Complete address with landmark"></textarea></div>
            </div>
          </div>
     <div className="form-section">
            <div className="section-label"><span className="step s3">3</span> Shipment Details</div>
            <div className="grid-3">
              <div className="input-field"><label>Weight (kg) *</label><input type="text" placeholder="1.5" /></div>
              <div className="input-field"><label>Service Type *</label><input type="text" placeholder="+91 98765 43210" /></div>
              <div className="input-field full"><label>Item Description *</label><textarea placeholder="e.g., Documents, Electronics, Clothing"></textarea></div>
            </div>
          </div>
          {/* Pricing Row */}
          <div className="price-box">
             <div><small>Estimated Shipping Cost</small><h3>₹250.00</h3></div>
             <div className="track"><small>Tracking Number</small><h3>SF402808440</h3></div>
          </div>

          <div className="btn-group">
            <button className="btn-reset">Reset Form</button>
            <button className="btn-submit">Create Booking</button>
            <button className="btn-print">Print Label</button>
          </div>
        </div>
      </main>
    </div>
  );
}