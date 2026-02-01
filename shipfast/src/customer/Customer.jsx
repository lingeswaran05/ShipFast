
import { useState } from 'react'
import './Customer.css'
import CusHead from './CusHead'
import Footer from '../home/Footer'
import Dashboard from './Dashboard'
import NewBooking from './newbooking/NewBooking'
import MyShipments from './MyShipments'
import Support from './support/Support'
import Payments from './Payment'
import Profile from './Profile'

export default function Customer() {
  const [active, setActive] = useState('dashboard')

  return (
    <div>
      <div className="shipfast-customer-scope">
        <div className="cont">
          <div className="lcont">
            <nav className="navbar1" id="navibar1">

              <div className="cc1" onClick={() => setActive('dashboard')}>
                <div className={active === 'dashboard' ? 'nav-link active' : 'nav-link'}>
                  <i className="bi bi-house-door"></i> Dashboard
                </div>
              </div>

              <div className="cc1" onClick={() => setActive('newbooking')}>
                <div className={active === 'newbooking' ? 'nav-link active' : 'nav-link'}>
                  <i className="bi bi-plus-lg"></i> New Booking
                </div>
              </div>

              <div className="cc1" onClick={() => setActive('myshipments')}>
                <div className={active === 'myshipments' ? 'nav-link active' : 'nav-link'}>
                  <i className="bi bi-boxes"></i> My Shipments
                </div>
              </div>

              <div className="cc1" onClick={() => setActive('support')}>
                <div className={active === 'support' ? 'nav-link active' : 'nav-link'}>
                  <i className="bi bi-telephone-plus"></i> Support
                </div>
              </div>

              <div className="cc1" onClick={() => setActive('payments')}>
                <div className={active === 'payments' ? 'nav-link active' : 'nav-link'}>
                  <i className="bi bi-credit-card-2-front"></i> Payments
                </div>
              </div>

              <div className="cc1" onClick={() => setActive('profile')}>
                <div className={active === 'profile' ? 'nav-link active' : 'nav-link'}>
                  <i className="bi bi-person-circle"></i> Profile
                </div>
              </div>

            </nav>
          </div>

          <div className="rcont">
            {active === 'dashboard' && <Dashboard />}
            {active === 'newbooking' && <NewBooking />}
            {active === 'myshipments' && <MyShipments />}
            {active === 'support' && <Support />}
            {active === 'payments' && <Payments />}
            {active === 'profile' && <Profile />}
          </div>
        </div>
      </div>
    </div>
  )
}