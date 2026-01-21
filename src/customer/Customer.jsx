import React from 'react'
import { Route,BrowserRouter,Routes,NavLink } from 'react-router-dom';
import './Customer.css'
import CusHead from './CusHead'
import Footer from '../home/Footer'
import "bootstrap-icons/font/bootstrap-icons.css";
import Dashboard from './Dashboard';
import NewBooking from './newbooking/NewBooking'
import MyShipments from './MyShipments'
import Support from './Support'
import Payments from './Payment'
import Profile from './Profile'
function Customer() {
  return (
    < div>
    <CusHead/>
      <BrowserRouter > 
        <div className="cont">
          <div className="lcont">
            <nav className='navbar1' id='navibar1'>
              <div className="cc1"><NavLink to='/cusdashboard'  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><i className="bi bi-house-door"></i>Dashboard</NavLink></div>
              <div className="cc1"><NavLink to='newbooking'  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><i className="bi bi-plus-lg"></i>New Booking</NavLink></div>
              <div className="cc1"><NavLink to='myshipments'  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><i className="bi bi-boxes"></i>MyShipments</NavLink></div>
              <div className="cc1"><NavLink to='support' className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><i className="bi bi-telephone-plus"></i>Support</NavLink></div>
              <div className="cc1"><NavLink to='payments' className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><i className="bi bi-credit-card-2-front"></i>Payments</NavLink></div>
              <div className="cc1"><NavLink to='profile' className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><i className="bi bi-person-circle"></i>Profile</NavLink></div>
            </nav>
          </div>
          <div className='rcont'>
            <Routes>
                <Route path='cusdashboard' element={<Dashboard/>}></Route>
                <Route path='newbooking' element={<NewBooking/>} ></Route>
                <Route path='myshipments/*' element={<MyShipments/>}></Route>
                <Route path='support' element={<Support/>}></Route>
                <Route path='payments' element={<Payments/>}></Route>
                <Route path='profile' element={<Profile/>}></Route>
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    <Footer/>
    </div>
  )
}

export default Customer