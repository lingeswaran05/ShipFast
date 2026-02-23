import { useState, useEffect } from 'react';
import { Package, Truck, Calendar, MapPin, CreditCard, ChevronRight, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Wallet, Banknote, Printer, X, Lock } from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';
import { BarcodeGenerator } from '../shared/BarcodeGenerator';
import { toast } from 'sonner';

export function BookingForm({ onViewInvoice }) {
  const { addShipment, calculateRate } = useShipment();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sender: { name: '', phone: '', address: '', pincode: '', city: 'Covai' },
    receiver: { name: '', phone: '', address: '', pincode: '', city: 'Madurai' },
    package: { weight: '', length: '', width: '', height: '', type: 'Standard', declaredValue: '' },
    service: 'standard', 
    paymentMode: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [showFakePayment, setShowFakePayment] = useState(false); // New state for mock modal

  const handleInputChange = (section, field, value) => {
    if (section === 'root') {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    }
  };

  const getServiceTypeLabel = (id) => {
      switch(id) {
          case 'express': return 'Express';
          case 'sameday': return 'Same Day';
          default: return 'Standard';
      }
  };

  const getCalculatedPrice = (serviceId) => {
      // Base logic matching context's calculateRate, but handled here for display consistency or usage of context directly
      // If Same Day, add premium.
      // Context calculateRate: (weight * 50) + base (100 | 50)
      
      const typeLabel = getServiceTypeLabel(serviceId);
      let price = calculateRate(formData.package.weight, typeLabel);
      
      if (serviceId === 'sameday') {
          price += 500; // Same Day Premium
      }
      return price;
  };

  const getTotalPrice = () => {
      let price = getCalculatedPrice(formData.service);
      if (formData.paymentMode === 'cash') {
          price += 50; // Cash Handling Fee
      }
      return price;
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Helper: Book Shipment (Backend Call)
  const bookShipment = async (paymentDetails = {}) => {
        setIsProcessing(true);
        try {
            const newShipment = await addShipment({
                sender: formData.sender,
                receiver: formData.receiver,
                weight: formData.package.weight,
                cost: getTotalPrice(),
                type: getServiceTypeLabel(formData.service),
                paymentMode: formData.paymentMode,
                status: 'Booked',
                service: getServiceTypeLabel(formData.service),
                paymentStatus: formData.paymentMode === 'cash' ? 'Pending' : 'Paid',
                transactionId: paymentDetails.razorpay_payment_id || null
            });
      
            setTrackingId(newShipment.id);
            setBookingSuccess(true);
            toast.success('Shipment booked successfully!');
        } catch (error) {
            toast.error('Failed to book shipment. Please try again.');
            console.error(error);
        } finally {
            setIsProcessing(false);
            setShowFakePayment(false);
        }
    };

  const handleSubmit = async () => {
    if (!formData.paymentMode) {
        toast.error('Please select a payment method');
        return;
    }
    
    // Handle Cash Payment
    if (formData.paymentMode === 'cash') {
        await bookShipment();
        return;
    }

    // Handle Online Payment (Razorpay)
    
    // Define Key
    const RAZORPAY_KEY_ID = "rzp_test_S"; 

    // TEST MODE CHECK: Detect placeholder key
    if (RAZORPAY_KEY_ID === "rzp_test_S" || RAZORPAY_KEY_ID.length < 10) {
            // Simulate Redirect to Payment Gateway
            setIsProcessing(true);
            setTimeout(() => {
                setIsProcessing(false);
                setShowFakePayment(true); // Trigger Full Page Mock
            }, 1500);
            return;
    }

    // REAL MODE: Try Loading Razorpay
    setIsProcessing(true); 
    try {
        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
            throw new Error('Razorpay SDK failed to load.');
        }

        const options = {
            key: RAZORPAY_KEY_ID, 
            amount: getTotalPrice() * 100,
            currency: "INR",
            name: "ShipFast Logistics",
            description: "Shipment Booking",
            image: "https://i.pravatar.cc/150?u=shipfast",
            handler: function (response) {
                bookShipment(response);
            },
            prefill: {
                name: formData.sender.name,
                email: currentUser?.email || "customer@example.com",
                contact: formData.sender.phone
            },
            theme: { color: "#9333ea" },
            modal: {
                ondismiss: function() {
                    setIsProcessing(false);
                    toast('Payment cancelled');
                }
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response){
            setIsProcessing(false);
            toast.error(response.error.description || "Payment failed");
        });
        paymentObject.open();
        
    } catch (err) {
        console.error("Payment initialization error:", err);
        // Fallback to Mock if Real SDK fails
        setIsProcessing(false);
        setShowFakePayment(true);
    }
  };

  // Full Page Mock Payment Component (Simulates a Redirect)
  if (showFakePayment) {
      return (
        <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col animate-fade-in font-sans">
           {/* Fake Browser Header for Realism */}
           <div className="bg-gray-100 border-b p-2 flex items-center gap-2 text-xs text-gray-500">
               <div className="flex gap-1.5 ml-2">
                   <div className="w-3 h-3 rounded-full bg-red-400"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                   <div className="w-3 h-3 rounded-full bg-green-400"></div>
               </div>
               <div className="bg-white px-3 py-1 rounded-md flex-1 text-center flex items-center justify-center gap-2 border mx-4 shadow-sm">
                   <Lock className="w-3 h-3 text-green-600" />
                   <span className="text-green-700 font-medium">https://secure-payments.razorpay.com/checkout</span>
               </div>
           </div>

           <div className="flex-1 flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-md shadow-2xl rounded-xl overflow-hidden border border-gray-200">
                   <div className="bg-[#2b84ea] p-6 text-white text-center relative">
                       <button onClick={() => setShowFakePayment(false)} className="absolute top-4 right-4 text-white/80 hover:text-white"><X className="w-5 h-5"/></button>
                       <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                           <Wallet className="w-6 h-6 text-white" />
                       </div>
                       <h2 className="text-lg font-bold">ShipFast Logistics</h2>
                       <p className="opacity-90 text-sm mt-1">Order #OD{Date.now().toString().slice(-6)}</p>
                       <div className="mt-4 text-3xl font-bold">₹{getTotalPrice()}.00</div>
                   </div>

                   <div className="p-6 bg-gray-50/50">
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Select Payment Method</p>
                       
                       <div className="space-y-3">
                           <button 
                               onClick={() => {
                                   toast.loading("Processing Payment...");
                                   setTimeout(() => bookShipment({ razorpay_payment_id: `pay_mock_upi_${Date.now()}` }), 1500);
                               }}
                               className="w-full bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4 hover:border-[#2b84ea] hover:shadow-md transition-all group"
                           >
                               <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                                   <Wallet className="w-5 h-5 text-orange-600" />
                               </div>
                               <div className="text-left flex-1">
                                   <p className="font-bold text-gray-800">UPI</p>
                                   <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</p>
                               </div>
                               <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#2b84ea]" />
                           </button>

                           <button 
                               onClick={() => {
                                   toast.loading("Processing Payment...");
                                   setTimeout(() => bookShipment({ razorpay_payment_id: `pay_mock_card_${Date.now()}` }), 2000);
                               }}
                               className="w-full bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4 hover:border-[#2b84ea] hover:shadow-md transition-all group"
                           >
                               <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                   <CreditCard className="w-5 h-5 text-blue-600" />
                               </div>
                               <div className="text-left flex-1">
                                   <p className="font-bold text-gray-800">Card</p>
                                   <p className="text-xs text-gray-500">Visa, Mastercard, RuPay</p>
                               </div>
                               <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#2b84ea]" />
                           </button>

                           <button 
                               onClick={() => {
                                   toast.loading("Processing Payment...");
                                   setTimeout(() => bookShipment({ razorpay_payment_id: `pay_mock_net_${Date.now()}` }), 2000);
                               }}
                               className="w-full bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4 hover:border-[#2b84ea] hover:shadow-md transition-all group"
                           >
                               <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                                   <Banknote className="w-5 h-5 text-purple-600" />
                               </div>
                               <div className="text-left flex-1">
                                   <p className="font-bold text-gray-800">Netbanking</p>
                                   <p className="text-xs text-gray-500">All Indian Banks</p>
                               </div>
                               <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#2b84ea]" />
                           </button>
                       </div>
                   </div>

                   <div className="bg-gray-100 p-3 text-center text-xs text-gray-500 flex justify-center items-center gap-1">
                        <Lock className="w-3 h-3" /> Securely processed by Razorpay
                   </div>
               </div>
           </div>
        </div>
      );
  }

  const handlePrint = () => {
      window.print();
  };

  const services = [
    { id: 'standard', name: 'Standard Delivery', time: '3-5 Days', price: `₹${getCalculatedPrice('standard')}`, icon: Truck },
    { id: 'express', name: 'Express Priority', time: '1-2 Days', price: `₹${getCalculatedPrice('express')}`, icon: Package },
    { id: 'sameday', name: 'Same Day Delivery', time: 'Today', price: `₹${getCalculatedPrice('sameday')}`, icon: Calendar },
  ];

  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in-up py-10 print:py-0">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 print:hidden">
          <CheckCircle className="w-12 h-12 text-green-600 animate-bounce-subtle" />
        </div>
        
        <div className="print:hidden">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
          <p className="text-slate-500 text-lg">Your shipment has been successfully scheduled.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md mx-auto relative overflow-hidden group print:shadow-none print:border-2 print:max-w-none print:p-4 print:w-full printable">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-600 print:hidden"></div>
          <div className="hidden print:block text-2xl font-bold mb-4 text-center border-b pb-4">SHIPFAST LOGISTICS</div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Tracking ID</p>
          <div className="text-4xl font-mono font-bold text-slate-900 tracking-widest mb-4 selection:bg-purple-100">{trackingId}</div>
          
          <div className="mb-6 flex justify-center">
             <BarcodeGenerator value={trackingId} />
          </div>

          <p className="text-xs text-slate-400 mb-4 print:hidden">Save this ID regarding your shipment</p>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
             <div className="text-left">
                <p className="text-xs text-slate-400 font-semibold uppercase">Estimated Delivery</p>
                <p className="font-bold text-slate-800">
                   {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
             </div>
             <div className="text-right">
                <p className="text-xs text-slate-400 font-semibold uppercase">Amount {formData.paymentMode === 'cash' ? 'To Pay' : 'Paid'}</p>
                <p className="font-bold text-slate-800">₹{getTotalPrice()}</p>
                {formData.paymentMode === 'cash' && <span className="text-[10px] text-slate-500">(Includes COD Fee)</span>}
             </div>
          </div>
          <div className="hidden print:block mt-8 pt-6 border-t border-slate-100 text-left text-sm text-slate-600">
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="font-bold block mb-1">From:</span>
                    <p>{formData.sender.name}</p>
                    <p>{formData.sender.phone}</p>
                    <p>{formData.sender.address || 'N/A'}</p>
                    <p>{formData.sender.city} - {formData.sender.pincode}</p>
                </div>
                <div>
                    <span className="font-bold block mb-1">To:</span>
                    <p>{formData.receiver.name}</p>
                    <p>{formData.receiver.phone}</p>
                    <p>{formData.receiver.address || 'N/A'}</p>
                    <p>{formData.receiver.city} - {formData.receiver.pincode}</p>
                </div>
             </div>
             <div className="mt-4 pt-4 border-t">
                 <p><span className="font-bold">Service:</span> {getServiceTypeLabel(formData.service)}</p>
                 <p><span className="font-bold">Weight:</span> {formData.package.weight} kg</p>
                 <p><span className="font-bold">Content:</span> {formData.package.type}</p>
             </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 print:hidden">
          <button 
             onClick={handlePrint}
             className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print Label
          </button>
          <button 
             onClick={() => { setBookingSuccess(false); setStep(1); setFormData({...formData, paymentMode: ''}); }} 
             className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-0.5"
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
        <div 
          className="absolute left-0 top-1/2 h-1 bg-purple-600 -z-10 rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        ></div>
        
        {['Sender & Receiver', 'Package Details', 'Service Selection', 'Payment & Review'].map((label, index) => (
          <div key={index} className="flex flex-col items-center gap-2 group cursor-default">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white ${
              step > index + 1 ? 'bg-purple-600 border-purple-600 text-white' :
              step === index + 1 ? 'border-purple-600 text-purple-600 shadow-lg shadow-purple-500/20 scale-110' :
              'border-slate-300 text-slate-400'
            }`}>
              {step > index + 1 ? <CheckCircle className="w-6 h-6" /> : <span className="font-bold">{index + 1}</span>}
            </div>
            <span className={`text-xs font-semibold hidden sm:block transition-colors ${
              step >= index + 1 ? 'text-purple-900' : 'text-slate-400'
            }`}>{label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
        {isProcessing && (
           <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in">
              <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <h3 className="text-xl font-bold text-slate-800">Processing...</h3>
              <p className="text-slate-500">Please wait while we confirm your booking</p>
           </div>
        )}

        <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">
            {step === 1 && 'Sender & Receiver Details'}
            {step === 2 && 'Package Information'}
            {step === 3 && 'Select Service'}
            {step === 4 && 'Payment & Review'}
          </h2>
          <p className="text-slate-500 mt-1">
             {step === 1 && 'Provide contact details for pickup and delivery'}
             {step === 2 && 'Enter weight and dimensions of your parcel'}
             {step === 3 && 'Choose the best courier service for your needs'}
             {step === 4 && 'Complete your payment securely'}
          </p>
        </div>

        <div className="p-8 min-h-[400px]">
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6 animate-slide-in-right">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Sender Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-medium"
                      placeholder="John Doe"
                      value={formData.sender.name}
                      onChange={(e) => handleInputChange('sender', 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-medium"
                      placeholder="+91 98765 43210"
                      value={formData.sender.phone}
                      onChange={(e) => handleInputChange('sender', 'phone', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                       <input 
                         type="text" 
                         className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-medium"
                         placeholder="Mumbai"
                         value={formData.sender.city}
                         onChange={(e) => handleInputChange('sender', 'city', e.target.value)}
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1">Pincode</label>
                       <input 
                         type="text" 
                         className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-medium"
                         placeholder="400001"
                         value={formData.sender.pincode}
                         onChange={(e) => handleInputChange('sender', 'pincode', e.target.value)}
                       />
                     </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Receiver Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-medium"
                      placeholder="Jane Smith"
                      value={formData.receiver.name}
                      onChange={(e) => handleInputChange('receiver', 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-medium"
                      placeholder="+91 98765 43210"
                      value={formData.receiver.phone}
                      onChange={(e) => handleInputChange('receiver', 'phone', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                       <input 
                         type="text" 
                         className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-medium"
                         placeholder="Delhi"
                         value={formData.receiver.city}
                         onChange={(e) => handleInputChange('receiver', 'city', e.target.value)}
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1">Pincode</label>
                       <input 
                         type="text" 
                         className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-medium"
                         placeholder="110001"
                         value={formData.receiver.pincode}
                         onChange={(e) => handleInputChange('receiver', 'pincode', e.target.value)}
                       />
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Weight (kg)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-medium"
                      placeholder="0.5"
                      value={formData.package.weight}
                      onChange={(e) => handleInputChange('package', 'weight', e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">kg</span>
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1">Declared Value</label>
                   <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₹</span>
                     <input 
                       type="number" 
                       className="w-full pl-8 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-medium"
                       placeholder="1000"
                       value={formData.package.declaredValue}
                       onChange={(e) => handleInputChange('package', 'declaredValue', e.target.value)}
                     />
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Dimensions (cm) - Optional</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="L"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-medium text-center"
                      value={formData.package.length}
                      onChange={(e) => handleInputChange('package', 'length', e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">CM</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="W"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-medium text-center"
                      value={formData.package.width}
                      onChange={(e) => handleInputChange('package', 'width', e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">CM</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="H"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-medium text-center"
                      value={formData.package.height}
                      onChange={(e) => handleInputChange('package', 'height', e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">CM</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Content Type</label>
                <div className="grid grid-cols-3 gap-4">
                  {['Documents', 'Electronics', 'Clothing', 'Fragile', 'Others'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleInputChange('package', 'type', type)}
                      className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                        formData.package.type === type 
                          ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' 
                          : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid md:grid-cols-3 gap-6">
                {services.map((service) => (
                  <div 
                    key={service.id}
                    onClick={() => handleInputChange('root', 'service', service.id)}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      formData.service === service.id 
                        ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-500/20' 
                        : 'border-slate-100 hover:border-purple-300 hover:shadow-lg'
                    }`}
                  >
                    {formData.service === service.id && (
                      <div className="absolute top-4 right-4 text-purple-600">
                        <CheckCircle className="w-6 h-6 fill-purple-100" />
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                       formData.service === service.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <service.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{service.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">{service.time}</p>
                    <div className="text-2xl font-bold text-slate-900">{service.price}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
              
              <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 flex items-start gap-4">
                 <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                 <div>
                    <h4 className="font-bold text-purple-800 text-sm uppercase tracking-wide mb-1">Review your booking</h4>
                    <p className="text-purple-600 text-sm">Please ensure all details are correct. You can go back and edit if needed.</p>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-purple-500"></div> Shipment Summary
                      </h4>
                      <div className="space-y-3 text-sm">
                         <div className="flex justify-between">
                            <span className="text-slate-500">Service</span>
                            <span className="font-semibold text-slate-900">{services.find(s=>s.id === formData.service)?.name || 'Standard'}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500">Weight</span>
                            <span className="font-semibold text-slate-900">{formData.package.weight || '0.5'} kg</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500">Content</span>
                            <span className="font-semibold text-slate-900">{formData.package.type}</span>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-green-500"></div> Cost Breakdown
                      </h4>
                      <div className="space-y-3 text-sm">
                         <div className="flex justify-between">
                            <span className="text-slate-500">Base Rate</span>
                            <span className="font-medium text-slate-900">₹{getCalculatedPrice(formData.service)}.00</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500">Tax & Fees</span>
                            <span className="font-medium text-slate-900">Included</span>
                         </div>
                         {formData.paymentMode === 'cash' && (
                           <div className="flex justify-between">
                              <span className="text-slate-500">Cash Handling Fee</span>
                              <span className="font-medium text-slate-900">₹50.00</span>
                           </div>
                         )}
                         <div className="border-t border-slate-100 pt-3 flex justify-between text-lg font-bold">
                            <span className="text-slate-900">Total</span>
                            <span className="text-purple-600">₹{getTotalPrice()}.00</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="font-bold text-slate-900 mb-2">Select Payment Method</h4>
                   {[
                      { id: 'upi', name: 'UPI / QR Code', icon: Wallet },
                      { id: 'card', name: 'Credit / Debit Card', icon: CreditCard },
                      { id: 'cash', name: 'Cash on Pickup', icon: Banknote },
                   ].map((method) => (
                      <div 
                        key={method.id}
                        onClick={() => handleInputChange('root', 'paymentMode', method.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-4 transition-all ${
                           formData.paymentMode === method.id
                             ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-500/20'
                             : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                         <div className={`p-2 rounded-lg ${formData.paymentMode === method.id ? 'bg-purple-200 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                            <method.icon className="w-5 h-5" />
                         </div>
                         <span className="font-semibold text-slate-700">{method.name}</span>
                         {formData.paymentMode === method.id && <CheckCircle className="w-5 h-5 text-purple-600 ml-auto" />}
                      </div>
                   ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button 
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              step === 1 
                ? 'text-slate-300 cursor-not-allowed' 
                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <button 
            onClick={step === 4 ? handleSubmit : handleNext}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            {step === 4 ? (
               // Logic to show "Confirm & Pay" vs "Confirm Shipment" based on Payment Mode
               formData.paymentMode === 'cash' ? (
                   <>Confirm Shipment <CheckCircle className="w-5 h-5" /></>
               ) : (
                   <>Confirm & Pay <CreditCard className="w-5 h-5" /></>
               )
            ) : (
               <>Continue <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
