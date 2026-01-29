import React from 'react'
import logo from '../home/logs1.png';
import sun from '../home/image.png';
import './home.css'
import { BrowserRouter,Route,Router,NavLink,Link, Routes } from 'react-router-dom';
function Head() {
  return (
    <>
    <div className="cont">
        <div className="left">
            <div className="logoimg">
                <img className='logoimg' src={logo} alt="ShipFast Logo" />
            </div>
            <div className="logoname"><h3>𝑺𝒉𝒊𝒑𝑭𝒂𝒔𝒕</h3></div>
        </div>

        <div className="right">
            <img className='light' src={sun} alt="sun" />
            <button>Track Shipment</button>
            <button>Sign in</button> 
        </div>
    </div>
    <hr />
    </>
  )
}

export default Head;
