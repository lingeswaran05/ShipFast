import "../styles/hero.css";
import { LuTruck } from "react-icons/lu";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { IoLocationOutline} from "react-icons/io5";
export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      {/* LEFT */}
      <div className="hero-left">
        <span className="badge">
          🚀 India’s Fastest Growing Courier Service
        </span>

        <h1>
          <span>Ship Smarter,</span><br />
          <span>Deliver Faster</span>
        </h1>

        <p>
          Experience next-level logistics with real-time tracking,
          instant quotes, and seamless delivery operations. Your parcels,
          our priority.
        </p>

        <div className="buttons">
          <button className="primary">
            Get Started Free <AiOutlineThunderbolt />
          </button>

          <button
            className="secondary"
            onClick={() => navigate("/shipment")}
          >
            <IoLocationOutline className="track-icon" /> Track Package
          </button>
        </div>

        <div className="social-proof">
          <div className="avatars">
            <span className="avatar"></span>
            <span className="avatar"></span>
            <span className="avatar"></span>
            <span className="avatar"></span>
          </div>

          <span className="customers">
            <strong>50K+</strong> Happy Customers
          </span>

          <span className="rating">
            ⭐⭐⭐⭐⭐ <span>4.9/5</span>
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="hero-right">
        <div className="stat-card">
         <LuTruck /> <p>On-Time Delivery</p>
          <h2>98%</h2>
        </div>

        <img
          src="src/home/delivery.jpg"
          alt="Courier"
        />

        <div className="track-card">
          <p>Tracking Number</p>
          <h3>SF-123456789</h3>
        </div>

        <div className="express-card">
          Express Delivery
          <strong>24 Hours</strong>
        </div>
      </div>
    </section>
  );
}
