import React, { useState } from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import ShipmentCard from "./ShipmentCard";
import "./MyShipments.css";

export default function MyShipments() {
  const [activeTab, setActiveTab] = useState("");
  const [shipments] = useState([
    // ACTIVE (10)
    ...Array.from({ length: 3 }, (_, i) => ({
      shiplogo:<i class="bi bi-clock"></i>,
      shipId: `SF-ACT-${i + 1}`,
      status: "active",
      statusLabel: "In Transit",
      from: "Warehouse A",
      to: `City ${i + 1}`,
      price: 200 + i * 10,
      weight: "2 kg",
      booked: "2025-01-03 10:30 AM",
      expected: "2025-01-06",
    })),

    ...Array.from({ length: 2 }, (_, i) => ({
      shiplogo:<i class="bi bi-fire"></i>,
      shipId: `SF-DEL-${i + 1}`,
      status: "delivered",
      statusLabel: "Delivered",
      from: "Warehouse B",
      to: `Town ${i + 1}`,
      price: 150 + i * 12,
      weight: "1.5 kg",
      booked: "2025-01-01",
      expected: "2025-01-03",
    })),

    ...Array.from({ length: 1 }, (_, i) => ({
      shiplogo:<i class="bi bi-hourglass-split"></i>,
      shipId: `SF-DLY-${i + 1}`,
      status: "delayed",
      statusLabel: "Needs Attention",
      from: "Warehouse C",
      to: `Zone ${i + 1}`,
      price: 300 + i * 15,
      weight: "3 kg",
      booked: "2025-01-02",
      expected: "2025-01-05",
    })),

    ...Array.from({ length: 1 }, (_, i) => ({
      shiplogo:<i class="bi bi-ban"></i>,
      shipId: `SF-CAN-${i + 1}`,
      status: "cancelled",
      statusLabel: "Refunded",
      from: "Warehouse D",
      to: `Area ${i + 1}`,
      price: 180 + i * 8,
      weight: "2 kg",
      booked: "2024-12-28",
      expected: "-",
    })),
  ]);

  return (
    <div className="myshipments">
      <div className="ms-header">
        <div>
          <h1>Shipment History</h1>
          <p>Track and manage all your shipments</p>
        </div>
        <button className="export-btn">⬇ Export All</button>
      </div>

      <div className="ms-search">
        <input placeholder="Search by tracking number, receiver name, or city..." />
        <button>Filters</button>
      </div>
      <div className="ms-tabs">
      <button className={`tab-btn active-tab ${activeTab === "" ? "active-all" : "hov-blue"}`} onClick={() => setActiveTab("")}>All Shipments</button>
      <button className={`tab-btn active-tab ${activeTab === "active" ? "active-blue" : "hov-blue"}`} onClick={() => setActiveTab("active")}>Active</button>
      <button className={`tab-btn active-tab ${activeTab === "delayed" ? "active-orenge" : "hov-orenge"}`} onClick={() => setActiveTab("delayed")}>Delayed</button>
      <button className={`tab-btn active-tab ${activeTab === "delivered" ? "active-green" : "hov-green"}`} onClick={() => setActiveTab("delivered")}>Delivered</button>
      <button className={`tab-btn active-tab ${activeTab === "cancelled" ? "active-red" : "hov-red"}`} onClick={() => setActiveTab("cancelled")}>Cancelled</button>
      </div>
      {activeTab === "" && <ShipmentCard data={shipments} />}
      {activeTab === "active" && <ShipmentCard data={shipments.filter(s => s.status === "active")} />}
      {activeTab === "delivered" && <ShipmentCard data={shipments.filter(s => s.status === "delivered")}/>}
      {activeTab === "delayed" && <ShipmentCard data={shipments.filter(s => s.status === "delayed")} />}
      {activeTab === "cancelled" && <ShipmentCard data={shipments.filter(s => s.status === "cancelled")} />}
    </div>
  );
}
