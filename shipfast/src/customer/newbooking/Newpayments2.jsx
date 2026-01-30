import { useState } from "react";
import "./NewBooking.css";
const Paypal = ({ selectedRate }) => {

  return (
    <div className="paypal-content">
      <h1>
        <i className="paypal-logo active bi bi-paypal"></i>
      </h1>
      <h3>PayPal Checkout</h3>
      <h3 className="desc">
        You will be redirected to PayPal to complete your payment securely
      </h3>
      <h3>Amount: ₹{selectedRate?.total|| "189.00"}</h3>
    </div>
  );
};

const Card = ({ data, onchange }) => {
  return (
    <div className="Card-content">
      <h1 className="card-payment-name">
        <i class="bi bi-credit-card"></i> Debit/Credit Card Payment
      </h1>

      <form action="submit">
        <div className="card-payment-grid">
          <div className="number-field fields">
            <label>Card Number</label>
            <input
              type="text"
              name="cardNumber"
              value={data.cardNumber}
              onChange={onchange}
              placeholder="1234 5678 9012 3456"
            />
          </div>
          <div className="expiry-field fields">
            <label>Expiry Date</label>
            <input
              type="text"
              name="ExpiryDate"
              value={data.ExpiryDate}
              onChange={onchange}
              placeholder="MM/YY"
            />
          </div>
          <div className="cvv-field fields">
            <label>CVV</label>
            <input
              type="password"
              name="CVV"
              value={data.CVV}
              onChange={onchange}
              placeholder="123"
              maxLength="3"
            />
          </div>
          <div className="holder-name-field fields">
            <label>Card Holder Name</label>
            <input
              type="text"
              name="CardHolderName"
              value={data.CardHolderName}
              onChange={onchange}
              placeholder="John Doe"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
const UPI = ({ data, onChange }) => {
  return (
    <div className="Card-content">
      <h1 className="upi-payment-name">
        <i class="bi bi-phone"></i> UPI ID Payment
      </h1>
      <form action="submit">
        <div className="card-payment-grid">
          <div className="upiId-field fields">
            <label>UPI ID</label>
            <input
              type="text"
              name="upiId"
              value={data.upiId}
              onChange={onChange}
              placeholder="username@upi-id"
            />
          </div>
        </div>
        <div className="upi-message-section">
          <p className="msg">
            A payment request will be sent to your UPI app. Please approve it to
            complete the transaction.
          </p>
        </div>
      </form>
    </div>
  );
};

const NetBanking = ({data, onChange}) => {
  const banks = [
    "State Bank of India",
    "Indian Overseas Bank",
    "Union Bank of India",
    "Karur Vaisya Bank",
    "Canara Bank Of India",
    "HDFC Bank",
    "ICICI Bank",
  ];
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
              value={data.bankName}
              onChange={onChange}
              className="bank-select"
            >
              <option value="" disabled>
                Choose your bank
              </option>
              {banks.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {data.bankName && (
        <div className="banking-message-section">
          <p className="msg">
            You selected <strong>{data.bankName}</strong>. You will be
            redirected to their secure login page.
          </p>
        </div>
      )}
    </div>
  );
};

export default function Newpayments({ selectedRate, onNext }) {
  const [method, setMethod] = useState("card");
  const [showSuccess, setShowSuccess] = useState(false);
  const [payData, setpayData] = useState({
    cardNumber: "",
    ExpiryDate: "",
    CVV: "",
    CardHolderName: "",
    upiId: "",
    bankName: "",
  });
  const handleDataChange = (e) => {
    const { name, value } = e.target;
    setpayData({ ...payData, [name]: value });
  };

  const handleFinalSubmit = () => {
    console.log(`Submited method:${method} ,payment Data:`);
    console.log("upi id:" + payData.upiId);
    if (method == "UPI") {
      console.log(payData.upiId);
      console.log("hi");
    }
    if (method == "Card") {
      console.log(payData.cardNumber);
      console.log(payData.CVV);
      console.log(payData.CardHolderName);
      console.log(payData.ExpiryDate);
    }
    if (method == "NETBANKING") {
      console.log(payData.bankName);
      console.log("heio");
    }
    setShowSuccess(true);
    setTimeout(() => {
      onNext();
    }, 3000);
  };
  return (
    
    <div className="customer-newbook-payment">
      {showSuccess ? (
         <div className="success-Card-content">
          <h1 className="success-child1">
            <i className="bi bi-check"></i>
          </h1>
          <h2  className="success-child2">Payment Successful !</h2>
          <p  className="success-child3">Your paymert of {selectedRate?.total|| "191.16"} has been processed successfully</p>
          <h4  className="success-child4">transaction ID:TNX0381223-92-09</h4>
          <p  className="success-child5">Redirecting to labeling page...</p>
        </div>
      ) : (
        <>
        <h1>Payment Method</h1>
        <div className="payment-header">
            <h3 className="section-heading"></h3>
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
                    {<UPI data={payData} onchange={handleDataChange} />}
                    </div>
                ) : method == "Card" ? (
                    <div className="card-checkout">
                    {<Card data={payData} onchange={handleDataChange} />}
                    </div>
                ) : method == "PayPal" ? (
                    <div className="card-checkout">
                    {<Paypal data={selectedRate} onchange={handleDataChange}/>}
                    </div>
                ) : method == "NETBANKING" ? (
                    <div className="NetBanking-checkout">
                    {<NetBanking data={payData} onchange={handleDataChange}/>}
                    </div>
                ) : (
                    <div className="checkout">
                    <h3>Click any Payent Method to pay</h3>
                    </div>
                )}
                </div>
            </div>
            <button className="submit-btn wide"  onClick={handleFinalSubmit}>
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
                    <div className="values">₹{selectedRate?.total}</div>
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
       
      )}
  </div>
  );
}
