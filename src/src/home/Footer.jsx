import React from "react";
import "./Footer.css";
import logo from "../home/logs1.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="fleft">
          <img src={logo} alt="ShipFast logo" />
          <h3>ShipFast</h3>
        </div>

        <div className="fright">
          <span>© 2025 ShipFast. All rights reserved.</span>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}
