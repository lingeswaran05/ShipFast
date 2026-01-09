import React, { useState } from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import ShipmentCard from "./ShipmentCard";
import "./MyShipments.css";

export default function MyShipments() {

  // 🔹 STATE (DB READY)
  const [shipments] = useState([
    // ACTIVE (10)
    ...Array.from({ length: 10 }, (_, i) => ({
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

    // DELIVERED (10)
    ...Array.from({ length: 10 }, (_, i) => ({
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

    // DELAYED (5)
    ...Array.from({ length: 5 }, (_, i) => ({
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

    // CANCELLED (5)
    ...Array.from({ length: 5 }, (_, i) => ({
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

      {/* HEADER */}
      <div className="ms-header">
        <div>
          <h1>Shipment History</h1>
          <p>Track and manage all your shipments</p>
        </div>
        <button className="export-btn">⬇ Export All</button>
      </div>

      {/* SEARCH (UI ONLY FOR NOW) */}
      <div className="ms-search">
        <input placeholder="Search by tracking number, receiver name, or city..." />
        <button>Filters</button>
      </div>

      {/* TABS */}
      <nav className="ms-tabs">
        <NavLink end to="">All Shipments</NavLink>
        <NavLink to="active">Active</NavLink>
        <NavLink to="delivered">Delivered</NavLink>
        <NavLink to="delayed">Delayed</NavLink>
        <NavLink to="cancelled">Cancelled</NavLink>
      </nav>

      {/* CONTENT (NO LAYOUT CHANGE) */}
      <Routes>
        <Route index element={<ShipmentCard data={shipments} />} />
        <Route
          path="active"
          element={<ShipmentCard data={shipments.filter(s => s.status === "active")} />}
        />
        <Route
          path="delivered"
          element={<ShipmentCard data={shipments.filter(s => s.status === "delivered")} />}
        />
        <Route
          path="delayed"
          element={<ShipmentCard data={shipments.filter(s => s.status === "delayed")} />}
        />
        <Route
          path="cancelled"
          element={<ShipmentCard data={shipments.filter(s => s.status === "cancelled")} />}
        />
      </Routes>

    </div>
  );
}
