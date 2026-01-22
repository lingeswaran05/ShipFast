import { useNavigate } from "react-router-dom";
export default function NewBooking() {
    const navigate = useNavigate();
  return (
    <div className="new-booking-page">
        <header className="dashboard-navbar">
        <div className="logo">Shipment Details 👋

        </div>
      <nav className="nav-links">
  <button onClick={() => navigate("/customer")}>
    Overview
  </button>

  <button className="active">
    New Booking
  </button>
</nav>
</header>
 
<div className="form-card">
        <h3 className="section-title">Shipment Details</h3>
        <div className="section-title">👤 Sender Information</div>

        <div className="form-grid">
          <div>
            <label>Full Name</label>
            <input placeholder="Enter sender’s full name" />
          </div>

          <div>
            <label>Phone Number</label>
            <input placeholder="Enter contact number" />
          </div>
        </div>

        <div className="form-grid full">
          <div>
            <label>Email Address</label>
            <input placeholder="sender@email.com" />
          </div>
        </div>

        <div className="form-grid full">
          <div>
            <label>Pickup Address</label>
            <textarea placeholder="House no, street, city, pincode" />
          </div>
        </div>
        <div className="section-title">📍 Receiver Information</div>

        <div className="form-grid">
          <div>
            <label>Full Name</label>
            <input placeholder="Enter receiver’s full name" />
          </div>

          <div>
            <label>Phone Number</label>
            <input placeholder="Enter contact number" />
          </div>
        </div>

        <div className="form-grid full">
          <div>
            <label>Email Address</label>
            <input placeholder="receiver@email.com" />
          </div>
        </div>

        <div className="form-grid full">
          <div>
            <label>Delivery Address</label>
            <textarea placeholder="House no, street, city, pincode" />
          </div>
        </div>
        <div className="section-title">📦 Package Information</div>

        <div className="package-grid">
          <div>
            <label>Weight (kg)</label>
            <input placeholder="e.g. 2.5" />
          </div>

          <div>
            <label>Length (cm)</label>
            <input placeholder="e.g. 30" />
          </div>

          <div>
            <label>Width (cm)</label>
            <input placeholder="e.g. 20" />
          </div>

          <div>
            <label>Height (cm)</label>
            <input placeholder="e.g. 15" />
          </div>
        </div>

        <div className="form-grid full">
          <div>
            <label>Package Contents</label>
            <input placeholder="Clothes, documents, electronics, etc." />
          </div>
        </div>
      </div>
      </div>
    
  );
}
