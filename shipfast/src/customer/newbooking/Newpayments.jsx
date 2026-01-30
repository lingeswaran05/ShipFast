import { useState } from "react";
import "./NewBooking.css";
const Paypal = ({ totalpaypal }) => {
  return (
    <div className="paypal-content">
      <h1>
        <i className="paypal-logo active bi bi-paypal"></i>
      </h1>
      <h3>PayPal Checkout</h3>
      <h3 className="desc">
        You will be redirected to PayPal to complete your payment securely
      </h3>
      <h3>Amount: ₹{totalpaypal?.total}</h3>
    </div>
  );
};


const Card = ({ totalpaypal }) => {
  const [cardData, setCardData] = useState({
    cardNumber: "",
    ExpiryDate: "",
    CVV: "",
    CardHolderName: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardData({ ...cardData, [name]: value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("From card payment :" + totalpaypal);
    console.log("Card Data State:"+cardData);
  };

  return (
    <div className="Card-content">
      <h1 className="card-payment-name">
        <i class="bi bi-credit-card"></i> Debit/Credit Card Payment
      </h1>

      <form action="submit" onSubmit={handleSubmit}>
        <div className="card-payment-grid">
          <div className="number-field fields">
            <label>Card Number</label>
            <input
            type="text"
              name="cardNumber"
              value={cardData.cardNumber}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
            />
          </div>
          <div className="expiry-field fields">
            <label>Expiry Date</label>
            <input
            type="text"
              name="ExpiryDate"
              value={cardData.ExpiryDate}
              onChange={handleChange}
              placeholder="MM/YY"
            />
          </div>
          <div className="cvv-field fields">
            <label>CVV</label>
            <input
            type="password"
              name="CVV"
              value={cardData.CVV}
              onChange={handleChange}
              placeholder="123"
              maxLength="3"
            />
          </div>
          <div className="holder-name-field fields">
            <label>Card Holder Name</label>
            <input
              type="text"
              name="CardHolderName"
              value={cardData.CardHolderName}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
const UPI = ({ totalpaypal }) => {
  const [upiData, setUpiData] = useState({
    upiId: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpiData({ ...upiData, [name]: value });
      console.log("From UPI payment :" + totalpaypal);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(upiData);
  };
  return (
    <div className="Card-content">
      <h1 className="upi-payment-name">
        <i class="bi bi-phone"></i> UPI ID Payment
      </h1>
      <form action="submit" onClick={handleSubmit}>
        <div className="card-payment-grid">
          <div className="upiId-field fields">
            <label>UPI ID</label>
            <input
            type="text"
              name="upiId"
              value={upiData.upiId}
              onChange={handleChange}
              placeholder="username@upi-id"
            />
          </div>
        </div>
        <div className="upi-message-section">
          <p className="msg">
            A payment request will be sent to your UPI app. Please approve it to
            complete the  transaction.
          </p>
        </div>
      </form>
    </div>
  );
};


const NetBanking = ({ totalpaypal }) => {
  const [netBankingData, setNetBankingData] = useState({
    bankName: "", 
  });

  const banks = [
    "State Bank of India",
    "Indian Overseas Bank",
    "Union Bank of India",
    "Karur Vaisya Bank",
    "Canara Bank Of India",
    "HDFC Bank",
    "ICICI Bank"
  ];

  const handleChange = (e) => {
    const { value } = e.target;
    setNetBankingData({ bankName: value });
    console.log("Selected Bank:", value);
    console.log("totalpaypal in banking", totalpaypal);
  };

  return (
    <div className="Card-content">
      <h1 className="banking-payment-name">
        <i className="bi bi-bank"></i> Net Banking Payment
      </h1>
      
      <div className="card-payment-grid">
        <div className="netbanking-field fields">
          <label>Select Your Bank</label>
          <div className="select-wrapper">
            <select 
              name="bankName"
              value={netBankingData.bankName}
              onChange={handleChange}
              className="bank-select"
            >
              <option value="" disabled>Choose your bank</option>
              {banks.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {netBankingData.bankName && (
        <div className="banking-message-section" >
          <p className="msg">
            You selected <strong>{netBankingData.bankName}</strong>. 
            You will be redirected to their secure login page.
          </p>
        </div>
      )}
    </div>
  );
};
export default function Newpayments({ selectedRate, onNext }) {
  const [method, setMethod] = useState("unselect");

  return (
    <>
      <div className="payment-header">
        <h3 className="section-heading">Payment Method</h3>
      </div>
      <div className="payment-layout animate-fade-in">
        <div className="booking-card-pmt">
          <div className="method-grid">
            <div
              className={`method-item status-card1 ${method === "PayPal" ? "active" : ""}`}
              onClick={() => setMethod("PayPal")}
            >
              <div className="card-cont">
                <i class="logoimg bi bi-paypal"></i>
                <div className="name">PayPal</div>
                <div className="status">Fast & Secure</div>
              </div>
            </div>

            <div
              className={`method-item status-card2 ${method === "Card" ? "active" : ""}`}
              onClick={() => setMethod("Card")}
            >
              <div className="card-cont">
                <i class="logoimg bi bi-credit-card"></i>
                <div className="name">Credit/Debit Card</div>
                <div className="status">Visa, Mastercard,etc.</div>
              </div>
            </div>

            <div
              className={`method-item status-card3 ${method === "UPI" ? "active" : ""}`}
              onClick={() => setMethod("UPI")}
            >
              <div className="card-cont">
                <i class="logoimg bi bi-phone"></i>
                <div className="name">UPI </div>
                <div className="status">Google Pay,PhonePe</div>
              </div>
            </div>

            <div
              className={`method-item status-card4 ${method === "NETBANKING" ? "active" : ""}`}
              onClick={() => setMethod("NETBANKING")}
            >
              <div className="card-cont">
                <i class="logoimg bi bi-bank"></i>
                <div className="name">Net Banking </div>
                <div className="status">All major banks</div>
              </div>
            </div>
          </div>
          <div className="checkout-payment">
            <div>
              {method == "UPI" ? (
                <div className="Upi-checkout">
                  {<UPI totalpaypal={selectedRate} />}
                </div>
              ) : method == "Card" ? (
                <div className="card-checkout">
                  {<Card totalpaypal={selectedRate} />}
                </div>
              ) : method == "PayPal" ? (
                <div className="card-checkout">
                  {<Paypal totalpaypal={selectedRate} />}
                </div>
              ) : method == "NETBANKING" ? (
                <div className="NetBanking-checkout">
                  {<NetBanking totalpaypal={selectedRate} />}
                </div>
              ) : (
                <div className="PAYPAL-checkout">
                  <h3>Click any Payent Method to pay</h3>
                </div>
              )}
            </div>
          </div>
          <button className="submit-btn wide"  onClick={onNext}>
            Pay ₹{selectedRate?.total}
          </button>
        </div>

        <div className="order-summary-sidebar">
          <div className="summary-card">
            <h4 className="section-heading">Order Summary</h4>
            <div className="summary-lists">
              <div className="service">
                <p className="service-name">Service</p>
                <div className="values">₹148.00</div>
              </div>
              <div className="service">
                <p className="service-type">Type</p>
                <div className="values">₹11.84</div>
              </div><div className="service">
                <p className="service-base-rate">Base Rate</p>
                <div className="values">₹148.00</div>
              </div>
              <div className="service">
                <p className="service-fuel">Fuel Charge(8%)</p>
                <div className="values">₹11.84</div>
              </div>
              <div className="service">
                <p className="service-gst">GST(18%)</p>
                <div className="values">₹26.64</div>
              </div>
              <div><hr /></div>
              <div className="service">
                <p className="service-total">Total Amount</p>
                <div className="values">₹191.16</div>
              </div>
            </div>
            <div className="secure-badge">
              <p><i className="bi bi-shield-check"></i> Secure Payment</p>
              <div className="secue-message">Your payment information is encrypted and secure</div>
            </div>
            <hr />
            <div className="security-detail">
              <p className="bit"><i class="bi bi-check-circle-fill"></i>  256-bit SSL Encryption</p>
              <p className="pci-dss"><i class="bi bi-check-circle-fill"></i>  PCI DSS Compliant</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
