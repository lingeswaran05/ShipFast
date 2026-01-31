import { useState } from 'react';
import { Package, Truck, Calendar, MapPin, CreditCard, ChevronRight, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Wallet, Banknote, Printer } from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';

export function BookingForm({ onViewInvoice }) {
  const { addShipment } = useShipment();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sender: { name: '', phone: '', address: '', pincode: '', city: 'Mumbai' },
    receiver: { name: '', phone: '', address: '', pincode: '', city: 'Delhi' },
    package: { weight: '', length: '', width: '', height: '', type: 'Standard', declaredValue: '' },
    service: '',
    paymentMode: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState('');

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

  const calculateRate = () => {
     const weight = parseFloat(formData.package.weight) || 1;
     const servicePrice = formData.service === 'express' ? 100 : 50;
     const total = (weight * 50) + servicePrice;
     return total;
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const newShipment = addShipment({
         sender: formData.sender,
         receiver: formData.receiver,
         weight: formData.package.weight,
         cost: calculateRate(),
         type: formData.service === 'express' ? 'Express' : 'Standard'
      });

      setIsProcessing(false);
      setTrackingId(newShipment.id);
      setBookingSuccess(true);
    }, 2000);
  };

  const services = [
    { id: 'standard', name: 'Standard Delivery', time: '3-5 Days', price: `₹${calculateRate(formData)}`, icon: Truck },
    { id: 'express', name: 'Express Priority', time: '1-2 Days', price: `₹${calculateRate(formData) + 200}`, icon: Package },
    { id: 'sameday', name: 'Same Day Delivery', time: 'Today', price: `₹${calculateRate(formData) + 500}`, icon: Calendar },
  ];

  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in-up py-10">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600 animate-bounce-subtle" />
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
          <p className="text-slate-500 text-lg">Your shipment has been successfully scheduled.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md mx-auto relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-600"></div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Tracking ID</p>
          <div className="text-4xl font-mono font-bold text-slate-900 tracking-widest mb-2 selection:bg-purple-100">{trackingId}</div>
          <p className="text-xs text-slate-400">Save this ID for future reference</p>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
             <div className="text-left">
                <p className="text-xs text-slate-400 font-semibold uppercase">Estimated Delivery</p>
                <p className="font-bold text-slate-800">
                   {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
             </div>
             <div className="text-right">
                <p className="text-xs text-slate-400 font-semibold uppercase">Amount Paid</p>
                <p className="font-bold text-slate-800">₹{calculateRate()}</p>
             </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button 
             onClick={() => window.print()}
             className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print Label
          </button>
          <button 
             onClick={() => { setBookingSuccess(false); setStep(1); }} 
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
              <h3 className="text-xl font-bold text-slate-800">Processing Payment...</h3>
              <p className="text-slate-500">Please do not close this window</p>
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
                            <span className="font-semibold text-slate-900">Standard Delivery</span>
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
                            <span className="font-medium text-slate-900">₹{calculateRate() - 50}.00</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500">Tax & Fees</span>
                            <span className="font-medium text-slate-900">₹50.00</span>
                         </div>
                         <div className="border-t border-slate-100 pt-3 flex justify-between text-lg font-bold">
                            <span className="text-slate-900">Total</span>
                            <span className="text-purple-600">₹{calculateRate()}.00</span>
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
               <>Confirm & Pay <CreditCard className="w-5 h-5" /></>
            ) : (
               <>Continue <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
