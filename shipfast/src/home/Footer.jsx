import React from 'react'
import "./Footer.css";
import logo from '../home/logs1.png';
export default function Footer() {
  return (
    <>
    <hr />
      <div className="cont">
        <div className="fleft">
          <div className="flogo"><img src={logo} alt="flogo"/></div>
          <div className="ftitle"><h3>ShipFast</h3></div>
        </div>
        <div className="fright">
          <p className="c1">© 2025 ShipFast. All rights reserved.</p>
          <p className="c2">Privacy Policy</p>
          <p className="c3">Terms of Service</p>
          <p className="c4">Contact Us</p>
        </div>
      </div>
    </>
  )
}
