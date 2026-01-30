import React from "react";
import "../styles/brancheshubs.css";

export default function BranchesHubs() {
  return (
    <div className="admin-page">

      {/* HEADER */}
      <div className="bh-header">
        <div>
          <h1>Branch & Hub Management</h1>
          <p>Manage branch locations and hub hierarchy</p>
        </div>
        <button className="primary-btn">Add New Branch</button>
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
