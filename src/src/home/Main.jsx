import React from 'react'
import './Main.css'
import deliver from './delivery.jpg'

function Main() {
  return (
    <div>
        <div className="cont1">
          <div className="conleft1">
            <div className="con-text">
                <h4 className="tag">India's Fastest Growing Courier Service</h4>
                <h2 className=''>Ship Smarter,
                  Deliver Faster</h2>
                <p>Experience next-level logistics with real-time tracking, instant quotes, and seamless delivery operations. Your parcels, our priority.</p>
            </div>
            <div className="contlbut">
              <button> get start free</button>
              <button>Track Package</button>
            </div>
            <div className="rates">
              <div className="rev-count">50k+ happy customer</div>
              <div className="star-cnt">4.9/5</div>
            </div>
          </div>
          <div className="conright1">
            <img src={deliver} alt="" />
          </div>
        </div>
        <div className="cont2">
          <div className="con1">
            <h3>everything you need</h3>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi, porro.</p>
          </div>
          <div className="features1">
              {/* use map function to show lst of features by json */}
          </div>
          <div className="features2">
              <div className="f21"><h3 className="cnt">10k+</h3><h5 className="desc">Daily Deliveries</h5></div>
              <div className="f22"><h3 className="cnt">50+</h3><h5 className="desc">Service Hubs</h5></div>
              <div className="f23"><h3 className="cnt">98%</h3><h5 className="desc">On-Time Rate</h5></div>
              <div className="f24"><h3 className="cnt">24/7</h3><h5 className="desc">Support</h5></div>
          </div>
          <div className="features3">
              <div className="icon">icon</div>
              <div className="raedy"><h3>Ready to Transform Your Shipping?</h3></div>
              <div className="desc">Join 50,000+ satisfied customers who trust ShipFast for their delivery needs. Get started in minutes and experience the future of logistics.</div>
              <div className="buttons">
                  <div className="signupbut"><button>create free account</button></div>
                  <div className="track"><button>Track Shipment</button></div>
              </div>
          </div>
        </div>
    </div>
  )
}

export default Main