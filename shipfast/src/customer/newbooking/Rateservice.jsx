import { useState } from 'react'
import './NewBooking.css'

export default function Rateservice({ onBack, onNext }) {
    const [selectedPlan, setSelectedPlan] = useState('standard');
    const rates = {
      standard: { title: "Standard Delivery", price: 150, time: "3-5 business days", desc: "Economical option for non-urgent shipments",icon:<i className="bi bi-truck"></i> },
      express: { title: "Express Delivery", price: 250, time: "1-2 business days", desc: "Fast delivery for urgent shipments",icon:<i className="bi bi-truck"></i> }
    };

    const current = rates[selectedPlan];
    const fuelSurcharge = (current.price * 0.08).toFixed(2);
    const gst = (current.price * 0.18).toFixed(2);
    const total = (parseFloat(current.price) + parseFloat(fuelSurcharge) + parseFloat(gst)).toFixed(2);

  return (
    <div className="booking-card animate-fade-in">
        <div className="section-heading">
          <span className="section-heading-span">Select Service Type</span>
        </div>
       <div className="rate-grid">
       {Object.entries(rates).map(([key, plan]) => (
          <div 
            key={key}
            className={`rate-card ${selectedPlan === key ? 'selected' : ''}`}
            onClick={() => setSelectedPlan(key)}
          >
            <div className="rate-header">
              <h4>{plan.title}</h4>
              <span className="rate-icon">{plan.icon}</span>
            </div>
            <p className="rate-price">₹{plan.price}.00</p>
            <p className="rate-time">{plan.time}</p>
            <p className="rate-desc">{plan.desc}</p>
          </div>
        ))}
      </div>

      <div className="summary-box">
        <div className="section-heading">
          <span className="section-heading-span">Rate Summary</span>
        </div>
        <div className="summary-row"><span>Base Rate</span> <span>₹{current.price}.00</span></div>
        <div className="summary-row"><span>Fuel Surcharge (8%)</span> <span>₹{fuelSurcharge}</span></div>
        <div className="summary-row"><span>GST (18%)</span> <span>₹{gst}</span></div>
        <hr />
        <div className="summary-row total"><span>Total Amount</span> <span>₹{total}</span></div>
      </div>

      <div className="btn-group">
        <button className="back-btn" onClick={onBack}>Back</button>
        <button className="submit-btn" onClick={() => onNext({ total })}>Pay</button>
      </div>
    </div>
  )
}