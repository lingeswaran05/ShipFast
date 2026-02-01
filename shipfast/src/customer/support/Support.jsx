import React from 'react'
import './Support.css'
function Support() {
  const arr=[
    {
      ticketid:"TKT001",
      supportStatus:"In Progress",
      risk:"High",
      message:"Package not delivered - SF123456789",
      messagecount:2,
      deliveryTime:"2025-01-02 11:15 AM",
      shipmentid:"SF123456789"
    },
    {
      ticketid:"TKT002",
      supportStatus:"open",
      risk:"High",
      message:"Damaged parcel received - SF987654321",
      messagecount:1,
      deliveryTime:"Package not delivered - SF987654321",
      shipmentid:"SF987654321"
    }
  ];
  return (
    <>
      <div className="support-header">
        <div className="title">
        <h1 className="main-text">Support tickets</h1>
        <p className="sub-text">Manage your support requests</p>
        </div>
        <div className="create-ticket-btn">
          <button className="create-tkt"><i className='bi bi-chat'></i> Create Ticket</button>
        </div>
      </div>
      <div className="ticket-list-container">
        {arr.map((tkt)=>(
            <div key={tkt.ticketid} className="tkt-card">
              <div className="first-row">
                <div className="left">
                  <p className="ticketid">{tkt.ticketid}</p>
                  <p className={tkt.supportStatus === 'In Progress' ? 'supportStatus-InProgress' : 'supportStatus-open'} >{tkt.supportStatus}</p>
                  <p className="risk">{tkt.risk}</p>
                </div>
                <div className="right risk">{tkt.messagecount} messages</div>
              </div>
              <div className="second-row">
                <h3 className="message">{tkt.message}</h3>
              </div>
              <div className="third-row">
                  <p className="delivery-time"> <i className='bi bi-clock'></i> {tkt.deliveryTime}</p>
                  <p className="shipmentid">{tkt.shipmentid}</p>
              </div>
            </div>
        ))}
      </div>
    </>
  )
}

export default Support;