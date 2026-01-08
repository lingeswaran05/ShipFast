import React from 'react'
import './Customer.css'
function Dashboard() {
  return (
    <div>
       <div className="rcont">
          <div className="rc1">
            <h1 className='welcome'> Welcome back, Lingeswaran👋</h1>
            <h3>Here's what's happening with your shipments</h3>
          </div>
          <div className="rc2">
            <div className="status1">
                <div className="status-card1" >
                  <div className="logoimg"><i class="bi bi-clock"></i></div>
                  <div className="name">Active</div>
                  <div className="count">3</div>
                  <div className="status">In Trasit</div>
                </div>
                <div className="status-card2" >
                  <div className="logoimg"><i class="bi bi-fire"></i></div>
                  <div className="name">Deliveried</div>
                  <div className="count">15</div>
                  <div className="status">Completed</div>
                </div>
                <div className="status-card3" >
                  <div className="logoimg"><i class="bi bi-hourglass-split"></i></div>
                  <div className="name">Delayed</div>
                  <div className="count">1</div>
                  <div className="status">Need Attention</div>
                </div>
                <div className="status-card4" >
                  <div className="logoimg"><i class="bi bi-ban"></i></div>
                  <div className="name">Cancelled</div>
                  <div className="count">2</div>
                  <div className="status">Refunded</div>
                </div>
            </div>
          </div>
          <div className="rc3">
            <div className="card1">
              <h1><i class="bi bi-plus-lg"></i></h1>
              <h3 className="name">Book Shipment</h3>
              <h5 className="desc">Create a new bookmg</h5>
            </div>
            <div className="card2">
              <h1><i class="bi bi-truck"></i></h1>
              <h3 className="name">Track Shipments</h3>
              <h5 className="desc">View all shipments</h5>
            </div>
            <div className="card3">
              <h1><i class="bi bi-chat-right-dots-fill"></i></h1>
              <h3 className="name">Get Support</h3>
              <h5 className="desc">Need help?</h5>
            </div>
          </div>
      </div>
    </div>
  )
}

export default Dashboard