import React, { useEffect, useState } from "react";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "../styles/brancheshubs.css";

export default function BranchesHubs() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="admin-root">
      {/* NAVBAR */}
      <header className="admin-navbar">
        <div className="brand" onClick={() => navigate("/admin")} style={{ cursor: "pointer" }}>
          🚚 <span>ShipFast</span>
        </div>

        <nav className="nav-links">
          <button onClick={() => navigate("/admin")}>Overview</button>
          <button className="active">Branches & Hubs</button>
          <button onClick={() => navigate("/pricing")}>Pricing</button>
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
      <main className="admin-page">
        <div className="page-title">
            <div>
                <h1>Branch & Hub Management</h1>
                <p>Manage branch locations and hub hierarchy</p>
            </div>
            <div className="bh-action">
             <button className="button">Add Vehicle</button>
            </div>
        </div>

        {/* STATS */}
        <div className="bh-stats">
          <div className="bh-stat">
            <span>Total Branches</span>
            <h3>45</h3>
          </div>

          <div className="bh-stat">
            <span>Regional Hubs</span>
            <h3>8</h3>
          </div>

          <div className="bh-stat">
            <span>Coverage Cities</span>
            <h3>120+</h3>
          </div>
        </div>
        
        {/* LIST CARD */}
        <div className="bh-card">
          {/* FILTER */}
          <div className="bh-filter">
            <input placeholder="Search branches..." />
            <select>
              <option>All States</option>
            </select>
          </div>

          {/* ROWS */}
          <BranchRow
            title="Mumbai Central Hub"
            meta="Maharashtra • 45 staff members"
            type="Hub"
          />

          <BranchRow
            title="Mumbai Andheri Branch"
            meta="Maharashtra • 12 staff members"
            type="Branch"
          />

          <BranchRow
            title="Delhi NCR Hub"
            meta="Delhi • 38 staff members"
            type="Hub"
          />

          <BranchRow
            title="Bangalore Tech Park"
            meta="Karnataka • 18 staff members"
            type="Branch"
          />
        </div>
      </main>
    </div>
  );
}

function BranchRow({ title, meta, type }) {
  return (
    <div className="bh-row">
      <div className="bh-left">
        <div className="bh-icon">🏢</div>
        <div>
          <strong>{title}</strong>
          <p>{meta}</p>
        </div>
      </div>

      <div className="bh-right">
        <span className={`tag ${type.toLowerCase()}`}>{type}</span>
        <button className="manage-btn">Manage</button>
      </div>
    </div>
  );
}
