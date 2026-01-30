import React, { useEffect, useState } from "react";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "../styles/staff.css";

export default function Staff() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="admin-root">
      {/* NAVBAR */}
      <header className="admin-navbar">
        <div
          className="brand"
          onClick={() => navigate("/admin")}
          style={{ cursor: "pointer" }}
        >
          🚚 <span>ShipFast</span>
        </div>

        <nav className="nav-links">
          <button onClick={() => navigate("/admin")}>Overview</button>
          <button onClick={() => navigate("/branches-hubs")}>Branches & Hubs</button>
          <button onClick={() => navigate("/pricing")}>Pricing</button>
          <button onClick={() => navigate("/fleet")}>Fleet</button>
          <button className="active">Staff</button>
          <button onClick={() => navigate("/performance")}>Performance</button>
        </nav>

        <div className="nav-right">
          <button
            className="theme-btn"
            onClick={() =>
              setTheme((t) => (t === "dark" ? "light" : "dark"))
            }
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
        {/* PAGE TITLE */}
        <div className="page-title">
          <div>
            <h1>Staff Management</h1>
            <p>Manage team members and access control</p>
          </div>

          <div className="bh-action">
            <button className="button">Add Staff Member</button>
          </div>
        </div>

        {/* STATS */}
        <div className="bh-stats">
          <div className="bh-stat">
            <span>Total Staff</span>
            <h3>342</h3>
          </div>

          <div className="bh-stat">
            <span>Agents</span>
            <h3>156</h3>
          </div>

          <div className="bh-stat">
            <span>Drivers</span>
            <h3>98</h3>
          </div>

          <div className="bh-stat">
            <span>Admins</span>
            <h3>12</h3>
          </div>
        </div>

        {/* LIST CARD */}
        <div className="bh-card">
          {/* FILTER */}
          <div className="bh-filter">
            <input placeholder="Search staff..." />
            <select>
              <option>All Roles</option>
              <option>Agents</option>
              <option>Drivers</option>
              <option>Admins</option>
            </select>
          </div>

          {/* ROWS */}
          <StaffRow
            name="Rajesh Kumar"
            meta="Agent • Mumbai Central"
            status="Active"
          />
          <StaffRow
            name="Priya Sharma"
            meta="Driver • Delhi Hub"
            status="Active"
          />
          <StaffRow
            name="Amit Singh"
            meta="Agent • Bangalore"
            status="Active"
          />
        </div>
      </main>
    </div>
  );
}

function StaffRow({ name, meta, status }) {
  return (
    <div className="bh-row">
      <div className="bh-left">
        <div className="bh-icon">👤</div>
        <div>
          <strong>{name}</strong>
          <p>{meta}</p>
        </div>
      </div>

      <div className="bh-right">
        <span className="status active">{status}</span>
        <button className="manage-btn">Manage</button>
      </div>
    </div>
  );
}
