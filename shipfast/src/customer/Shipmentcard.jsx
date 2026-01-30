import React from "react";

export default function ShipmentCard({ data }) {
  return (
    <div className="shipment-list">
      {data.map((s) => (
        <div className="shipment-card" key={s.shipId}>
          <div className="sc-left">
            <div className={`sc-icon ${s.status}`}><h2>{s.shiplogo}</h2></div>
            <div>
              <strong>{s.shipId}</strong>
              <span className={`badge ${s.status}`}>{s.statusLabel}</span>
              <p><b>From:</b> {s.from}</p>
              <p><b>To:</b> {s.to}</p>
            </div>
          </div>
          <div className="sc-right">
            <div className="price">₹{s.price}</div>
            <div className="weight">{s.weight}</div>
            <p>Booked: {s.booked}</p>
            <p>Expected: {s.expected}</p>
            <button className="view-btn">View Details</button>
          </div>
        </div>
      ))}
    </div>
  );
}
