import { useNavigate } from "react-router-dom";
import "../styles/finalCTA.css";

export default function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="final-cta">
      <h2>Ready to Transform Your Shipping?</h2>
      <p>
        Join 50,000+ customers who trust ShipFast for their delivery needs.
      </p>

      <div className="cta-buttons">
        <button className="primary" onClick={()=> navigate("/create-account")}>Create Free Account →</button>
        <button className="secondary" onClick={()=> navigate("/shipment")}>Track Shipment</button>
      </div>
    </section>
  );
}
