import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

const USERS = {
  customer: {
    email: "customer@shipfast.com",
    password: "customer123",
    redirect: "/customer",
  },
  agent: {
    email: "agent@shipfast.com",
    password: "agent123",
    redirect: "/agent",
  },
  admin: {
    email: "admin@shipfast.com",
    password: "admin123",
    redirect: "/admin",
  },
};

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");
    const user = Object.values(USERS).find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      setError("Invalid email or password");
      return;
    }

    navigate(user.redirect);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>
          Welcome to the Future of Logistics
        </h1>

        <p className="subtitle">
          Sign in to access your personalized dashboard with real-time tracking,
          instant quotes, and seamless delivery management.
        </p>
        <div className="feature-card blue">
          <div className="icon">📦</div>
          <div>
            <h4>Real-time Tracking</h4>
            <p>
              Track your shipments with live GPS updates and detailed timeline
              views
            </p>
          </div>
        </div>
        <div className="feature-card purple">
          <div className="icon">🔐</div>
          <div>
            <h4>Secure Authentication</h4>
            <p>
              JWT-based security with role-based access control for your data
              safety
            </p>
          </div>
        </div>

        <div className="feature-card orange">
          <div className="icon">⚡</div>
          <div>
            <h4>Lightning Fast</h4>
            <p>Express delivery within 24–48 hours to anywhere in India</p>
          </div>
        </div>
      </div>
      <div className="login-right">
        
        <div className="login-card">
          <span className="badge">SECURE LOGIN</span>

          <h2>Sign In to Your Account</h2>
          <p className="desc">
            Your credentials will automatically determine your access level
          </p>

          <label>Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p style={{ color: "#ef4444", marginTop: "8px" }}>{error}</p>
          )}

          <div className="options">
            <label className="remember" >
              <input className="ip" type="checkbox" /> Remember me</label>
            
            <a>Forgot Password?</a>
          </div>

          <button className="signin-btn" onClick={handleLogin}>
            Sign In →
          </button>

          <div className="divider">New to ShipFast?</div>

          <button className="outline-btn" onClick={()=> navigate("/create-account")}>Create New Account</button>

          <div className="demo">
            <h4>Demo Credentials:</h4>
            <p>👤 Customer: customer@shipfast.com / customer123</p>
            <p>🧑‍💼 Agent: agent@shipfast.com / agent123</p>
            <p>🛠 Admin: admin@shipfast.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
