import "../styles/navbar.css";
import { useNavigate } from "react-router-dom";
import {
  IoLocationOutline,
  IoSunnyOutline,
  IoMoonOutline,
} from "react-icons/io5";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <nav className="navbar">
      {/* LOGO */}
      <div className="logo" onClick={() => navigate("/")}>
        <span className="logo-icon">🚚</span>
        <span
          className="logo-text"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          ShipFast
        </span>
      </div>

      <div className="nav-actions">
        {/* THEME TOGGLE */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? <IoSunnyOutline /> : <IoMoonOutline />}
        </button>

        <button
          className="track-btn-1"
          onClick={() => navigate("/shipment")}
        >
          <IoLocationOutline className="track-icon" />
          Track <div>Shipment</div>
        </button>

        <button
          className="signin-btn"
          onClick={() => navigate("/login")}
        >
          Sign In →
        </button>
      </div>
    </nav>
  );
}
