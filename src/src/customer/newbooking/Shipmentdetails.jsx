import {React ,useState }from 'react'
import './Shipmentdetails.css'

export default function NewBookingForm() {
  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    senderEmail: "",
    pickupAddress: "",

    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
    deliveryAddress: "",

    weight: "",
    length: "",
    width: "",
    height: "",
    contents: "",
    image: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Booking Data:", formData);
    // NEXT STEPS:
    // 1. Save to localStorage
    // 2. Call rate API
    // 3. Navigate to review page
  };

  return (
    <form className="booking-card" onSubmit={handleSubmit}>
      <h2 className="section-title">Shipment Details</h2>

      {/* Sender */}
      <div className="section">
        <h3 className="section-heading">Sender Information</h3>

        <div className="grid-2">
          <div className="field">
            <label>Full Name</label>
            <input
              name="senderName"
              value={formData.senderName}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>

          <div className="field">
            <label>Phone Number</label>
            <input
              name="senderPhone"
              value={formData.senderPhone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div className="field">
          <label>Email</label>
          <input
            name="senderEmail"
            value={formData.senderEmail}
            onChange={handleChange}
            placeholder="john@example.com"
          />
        </div>

        <div className="field">
          <label>Pickup Address</label>
          <textarea
            name="pickupAddress"
            value={formData.pickupAddress}
            onChange={handleChange}
            placeholder="Street address, City, State, PIN"
          />
        </div>
      </div>

      {/* Receiver */}
      <div className="section">
        <h3 className="section-heading">Receiver Information</h3>

        <div className="grid-2">
          <div className="field">
            <label>Full Name</label>
            <input
              name="receiverName"
              value={formData.receiverName}
              onChange={handleChange}
              placeholder="Jane Smith"
            />
          </div>

          <div className="field">
            <label>Phone Number</label>
            <input
              name="receiverPhone"
              value={formData.receiverPhone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div className="field">
          <label>Email</label>
          <input
            name="receiverEmail"
            value={formData.receiverEmail}
            onChange={handleChange}
            placeholder="jane@example.com"
          />
        </div>

        <div className="field">
          <label>Delivery Address</label>
          <textarea
            name="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={handleChange}
            placeholder="Street address, City, State, PIN"
          />
        </div>
      </div>

      {/* Package */}
      <div className="section">
        <h3 className="section-heading">Package Information</h3>

        <div className="grid-4">
          <input name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight (kg)" />
          <input name="length" value={formData.length} onChange={handleChange} placeholder="Length (cm)" />
          <input name="width" value={formData.width} onChange={handleChange} placeholder="Width (cm)" />
          <input name="height" value={formData.height} onChange={handleChange} placeholder="Height (cm)" />
        </div>

        <div className="field">
          <label>Package Contents</label>
          <input
            name="contents"
            value={formData.contents}
            onChange={handleChange}
            placeholder="Electronics, Documents, etc."
          />
        </div>

        <div className="upload-box">
          <p>Click to upload item image</p>
          <span>PNG, JPG up to 10MB</span>
          <input type="file" name="image" onChange={handleChange} />
        </div>
      </div>

      <button type="submit" className="submit-btn">
        Calculate Rate & Continue
      </button>
    </form>
  );
}
