
import { useState } from 'react'
import './NewBooking.css'
import Shipmentdetails from './Shipmentdetails'
import Rateservice from './Rateservice'
import Newpayments from './Newpayments2'
import Labels from './Labels'

export default function NewBooking() {
  const [step, setStep] = useState(1);
  const [rateData, setRateData] = useState(null);

  return (
    <div className="shipfast-newbooking-scope">
      <div className="booking-container">
        <div className="NB-tabs">
          <button className={step === 1 ? 'tab-btns hover-blue' : 'tab-btns act-all'} onClick={() => setStep(1)}>
            <span className="noofst">1</span>Shipment Details
          </button>
          <button className={step === 2 ? 'tab-btns hover-blue' : 'tab-btns act-all'} onClick={() => setStep(2)}>
            <span className="noofst">2</span>Rate & Service
          </button>
          <button className={step === 3 ? 'tab-btns hover-blue' : 'tab-btns act-all'} onClick={() => setStep(3)}>
            <span className="noofst">3</span>Payment
          </button>
          <button className={step === 4 ? 'tab-btns hover-blue' : 'tab-btns act-all'} onClick={() => setStep(4)}>
            <span className="noofst">4</span>Label
          </button>
        </div>
        {step === 1 && <Shipmentdetails onNext={() => setStep(2)} />}
        {step === 2 && <Rateservice onBack={() => setStep(1)} onNext={(data) => { setRateData(data); setStep(3) }} />}
        {step === 3 && <Newpayments selectedRate={rateData} onNext={() => setStep(4)} />}
        {step === 4 && <Labels setstep={setStep} />}
      </div>
    </div>
  )
}