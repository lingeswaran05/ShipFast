import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function CreateAccount() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div className="login-left">

        <h1>
          Create Your  ShipFast <br /> Account
        </h1>

        <p className="subtitle">
          Get started with fast, reliable shipping and real-time tracking.
        </p>

        <div className="feature-card blue">
          <div className="icon">👤</div>
          <div>
            <h4>Customer Account</h4>
            <p>Manage shipments, track orders, and book deliveries easily</p>
          </div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          <span className="badge">CREATE ACCOUNT</span>

          <h2>Create New Account</h2>
          <p className="desc">
            Please fill in the details below to continue
          </p>

          <label>Username</label>
          <input type="text" placeholder="Enter your name" />

          <label>Email Address</label>
          <input type="email" placeholder="customer@shipfast.com" />

          <label>Password</label>
          <input type="password" placeholder="Create a strong password" />
          
          <label>Confirm Password</label>
          <input type="password" placeholder="Create a strong password" />
            <br /><br />
          <button className="signin-btn">
            Create Account →
          </button>

          <div className="divider"><button className="outline-btn" onClick={() => navigate("/login")}>Already have an account?</button></div>
        </div>
      </div>
    </div>
  );
}
