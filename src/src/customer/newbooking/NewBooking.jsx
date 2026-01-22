import {useState,React} from 'react'
import { NavLink,Route,Routes} from 'react-router-dom';
import './NewBooking.css'
import Shipmentdetails from './Shipmentdetails'
import Rateservice from './Rateservice'
import Newpayments from './Newpayments'
import Labels from './Labels'
function NewBooking() {
    const [activeTab, setActiveTab] = useState("shipmentdetails");
  
  return (
    <div>
      <div className="newbooknav">

      <div className="NB-tabs">
        <button className={`tab-btns ${activeTab !== "shipmentdetails" ? "act-all" : "hover-blue"}`} onClick={() => setActiveTab("shipmentdetails")}><span className='noofst'>1</span>Shipment Details</button>
        <button className={`tab-btns ${activeTab !== "rateservice" ? "act-all" : "hover-blue"}`} onClick={() => setActiveTab("rateservice")}><span className='noofst'>2</span>Rate & service</button>
        <button className={`tab-btns ${activeTab !== "payments" ? "act-all" : "hover-blue"}`} onClick={() => setActiveTab("payments")}><span className='noofst'>3</span>Payments</button>
        <button className={`tab-btns ${activeTab !== "labels" ? "act-all" : "hover-blue"}`} onClick={() => setActiveTab("labels")}><span className='noofst'>4</span>Labels</button>
      </div>
      <div className="NB-cont">
        <div className="nb-cont2">{activeTab === "shipmentdetails" && <Shipmentdetails />}</div>
        <div className="nb-cont2"> {activeTab === "rateservice" && <Rateservice/>}</div>
        <div className="nb-cont2">{activeTab === "payments" && <Newpayments/>}</div>
        <div className="nb-cont2">{activeTab === "labels" && <Labels />}</div>
      </div>
      </div>
    </div>
  )
}

export default NewBooking;