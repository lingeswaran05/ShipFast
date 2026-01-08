import React from 'react'

export default function MyShipments() {
  return (
    <div>MyShipments
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
    </div>
    
  )
}
