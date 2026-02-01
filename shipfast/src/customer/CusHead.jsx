import React from "react";
import "./CusHead.css";
import logo from "../home/logs1.png";
import avatar from './avatar.png'; 

function CusHead() {
  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <img src={logo} alt="ShipFast" className="header-logo" />
            <span className="header-title">ShipFast</span>
          </div>
          <div className="header-right">
            <div className="header-icons">
              <i className="bi bi-moon"></i>
              <i className="bi bi-bell">
                <span className="notify-dot"></span>
              </i>
            </div>
            <div className="profile-chip">
              <img src={avatar} alt="User" />
              <div className="profile-text">
                <span className="username">Lingesw0561</span>
                <span className="role">Customer</span>
              </div>
            </div>
            <i className="bi bi-box-arrow-right logout-icon"></i>
          </div>
        </div>
      </header>
    </>
  );
}

export default CusHead;
