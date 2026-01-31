import { useState, useMemo } from 'react';
import { LayoutDashboard, Package, Scan, FileText, DollarSign, CheckCircle, MapPin, Phone, Truck, Clock, AlertTriangle, ChevronRight, Filter, Search, Calendar } from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';

export function AgentDashboard({ view }) {
  const { shipments, updateShipmentStatus, currentUser } = useShipment();
  const [scanId, setScanId] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [activeTab, setActiveTab] = useState('deliveries'); 
  const [statusUpdate, setStatusUpdate] = useState({ id: '', status: '', note: '' });

  const todaysDeliveries = useMemo(() => {
    return shipments.filter(s => 
       ['In Transit', 'Out for Delivery', 'Received at Hub'].includes(s.status)
    );
  }, [shipments]);

  const history = useMemo(() => {
     return shipments.filter(s => ['Delivered', 'Cancelled', 'Failed'].includes(s.status));
  }, [shipments]);

  const handleQuickStatusUpdate = (id, newStatus) => {
      updateShipmentStatus(id, newStatus);
  };
  
 const handleScan = (e) => {
    e.preventDefault();
    if (!scanId) return;

    updateShipmentStatus(scanId, 'Received at Hub');
    setScanResult({
        id: scanId,
        status: 'Received at Hub',
        timestamp: new Date().toLocaleString()
    });
    setScanId('');
    setTimeout(() => setScanResult(null), 3000);
  };

  const calculateCashCollected = () => {
      return history
        .filter(s => s.status === 'Delivered' && s.paymentMode === 'Cash')
        .reduce((acc, s) => acc + (parseFloat(s.cost) || 0), 0);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="text-slate-500 text-xs font-semibold uppercase mb-1">To Deliver</div>
            <div className="text-2xl font-bold text-slate-800">{todaysDeliveries.length}</div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Completed</div>
            <div className="text-2xl font-bold text-slate-800">{history.length}</div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Cash in Hand</div>
            <div className="text-2xl font-bold text-emerald-600">₹{calculateCashCollected()}</div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
             <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Shift Timer</div>
             <div className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
                04:32 <span className="text-xs font-normal text-slate-400">Hrs</span>
             </div>
         </div>
      </div>

      {view === 'overview' && (
        <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['deliveries', 'pickups', 'history'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-full font-bold text-sm capitalize whitespace-nowrap transition-all ${
                            activeTab === tab 
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'deliveries' && (
                <div className="space-y-4">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-indigo-600" />
                        Today's Route ({todaysDeliveries.length})
                    </h2>
                    
                    {todaysDeliveries.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-xl border border-slate-200 border-dashed">
                             <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                             <p className="text-slate-500">No deliveries assigned for today yet.</p>
                             <button className="mt-4 text-indigo-600 font-bold hover:underline">Refresh List</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {todaysDeliveries.map(shipment => (
                                <div key={shipment.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-lg text-slate-900">{shipment.id}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                    shipment.paymentMode === 'Cash' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {shipment.paymentMode}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-500 font-medium">{shipment.type} Shipment • {shipment.weight}kg</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-xl text-slate-900">₹{shipment.cost}</div>
                                            <div className="text-xs text-slate-400">Amount to Collect</div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">{shipment.receiver.name}</div>
                                                <div className="text-sm text-slate-600 leading-snug">{shipment.receiver.city} (Full address mock)</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                            <a href={`tel:${shipment.receiver.phone}`} className="text-sm font-bold text-emerald-600 hover:underline">{shipment.receiver.phone}</a>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => handleQuickStatusUpdate(shipment.id, 'Delivered')}
                                            className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Delivered
                                        </button>
                                        <button 
                                            onClick={() => handleQuickStatusUpdate(shipment.id, 'Failed')}
                                            className="py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                                        >
                                            <AlertTriangle className="w-4 h-4" /> Failed attempt
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                 <div className="space-y-4">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        Work History
                    </h2>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="divide-y divide-slate-100">
                             {history.map(s => (
                                 <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                     <div>
                                         <div className="font-bold text-slate-900">{s.id}</div>
                                         <div className="text-xs text-slate-500">{s.receiver.city} • ₹{s.cost}</div>
                                     </div>
                                     <span className={`px-2 py-1 rounded text-xs font-bold ${
                                         s.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                     }`}>
                                         {s.status}
                                     </span>
                                 </div>
                             ))}
                             {history.length === 0 && (
                                 <div className="p-8 text-center text-slate-500 text-sm">No history available</div>
                             )}
                        </div>
                    </div>
                 </div>
            )}
        </div>
      )}

      {view === 'scan' && (
          <div className="max-w-xl mx-auto space-y-8">
            <div className="text-center">
               <h2 className="text-2xl font-bold text-slate-900">Scan Parcels</h2>
               <p className="text-slate-500">Update status of incoming/outgoing packages</p>
            </div>

            <form onSubmit={handleScan} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                <div className="mb-6 text-center">
                   <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Scan className="w-10 h-10 text-indigo-600" />
                   </div>
                   <p className="text-sm font-medium text-indigo-600">Ready to Scan</p>
                </div>
                
                <div className="space-y-4">
                   <input 
                     type="text" 
                     value={scanId}
                     onChange={(e) => setScanId(e.target.value)}
                     placeholder="Scan Barcode or Enter ID"
                     className="w-full text-center text-lg font-mono py-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                     autoFocus
                   />
                   <div className="grid grid-cols-2 gap-3">
                      <button type="submit" className="bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 transform hover:-translate-y-0.5">
                         Received at Branch
                      </button>
                      <button type="button" onClick={() => handleQuickStatusUpdate(scanId, 'Out for Delivery')} className="bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5">
                         Out for Delivery
                      </button>
                   </div>
                </div>
            </form>

            {scanResult && (
               <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4 animate-fade-in-up">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                     <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                     <div className="font-bold text-green-800">Status Updated Successfully</div>
                     <div className="text-green-700 text-sm">{scanResult.id} marked as {scanResult.status}</div>
                  </div>
               </div>
            )}
         </div>
      )}
      {view === 'quick-book' && (
         <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
               <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Quick Walk-in Booking
               </h2>
            </div>
            <QuickBookingForm />
         </div>
      )}

      {view === 'runsheets' && (
         <RunSheetView todaysDeliveries={todaysDeliveries} />
      )}

      {view === 'cash' && (
         <CashCollectionView history={history} />
      )}
    </div>
  );
}

function QuickBookingForm() {
    const { addShipment } = useShipment();
    const [formData, setFormData] = useState({
        sender: { name: '', phone: '', city: '' },
        receiver: { name: '', phone: '', city: '' },
        weight: '',
        type: 'Standard'
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        addShipment({
            ...formData,
            cost: formData.weight * 50 + (formData.type === 'Express' ? 200 : 0),
            paymentMode: 'Cash'
        });
        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({ sender: { name: '', phone: '', city: '' }, receiver: { name: '', phone: '', city: '' }, weight: '', type: 'Standard' });
        }, 3000);
    };

    if (isSubmitted) {
        return (
            <div className="p-12 text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
                <p className="text-slate-500">Label generated and sent to printer.</p>
                <button onClick={() => setIsSubmitted(false)} className="mt-6 text-indigo-600 font-bold hover:underline">Book Another</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Sender Details</h3>
                    <input required placeholder="Sender Name" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.sender.name} onChange={e => setFormData({...formData, sender: {...formData.sender, name: e.target.value}})} />
                    <input required placeholder="Mobile Number" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.sender.phone} onChange={e => setFormData({...formData, sender: {...formData.sender, phone: e.target.value}})} />
                    <input required placeholder="City" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.sender.city} onChange={e => setFormData({...formData, sender: {...formData.sender, city: e.target.value}})} />
                </div>
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Receiver Details</h3>
                    <input required placeholder="Receiver Name" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.receiver.name} onChange={e => setFormData({...formData, receiver: {...formData.receiver, name: e.target.value}})} />
                    <input required placeholder="Mobile Number" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.receiver.phone} onChange={e => setFormData({...formData, receiver: {...formData.receiver, phone: e.target.value}})} />
                    <input required placeholder="Destination City" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.receiver.city} onChange={e => setFormData({...formData, receiver: {...formData.receiver, city: e.target.value}})} />
                </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
                <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-slate-700">Weight (kg)</label>
                        <input required type="number" placeholder="0.5" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-slate-700">Service Type</label>
                        <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                            <option>Standard</option>
                            <option>Express</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <div className="text-right mb-1 text-sm text-slate-500">Estimated Cost</div>
                        <div className="text-2xl font-bold text-slate-900 text-right">₹{formData.weight * 50 + (formData.type === 'Express' ? 200 : 0)}</div>
                    </div>
                </div>
            </div>

            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                Confirm Booking & Print Label
            </button>
        </form>
    );
}

function RunSheetView({ todaysDeliveries }) {
    return (
         <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Run Sheet Generation</h1>
                <p className="text-slate-600">Assign pending deliveries to drivers</p>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Generate Sheet
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Pending for Delivery (Today)</span>
                  <span className="text-sm bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">{todaysDeliveries.length} Shipments</span>
               </div>
               <div className="divide-y divide-slate-100">
                  {todaysDeliveries.length > 0 ? todaysDeliveries.map(s => (
                     <div key={s.id} className="p-4 hover:bg-slate-50 flex items-center gap-4">
                        <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" defaultChecked />
                        <div className="flex-1">
                           <div className="font-medium text-slate-900">{s.id}</div>
                           <div className="text-sm text-slate-500">{s.receiver.city} • <span className="text-indigo-600">{s.type}</span></div>
                        </div>
                        <div className="text-right text-sm">
                           <div className="font-medium text-slate-900">COD: ₹{s.cost}</div>
                           <div className="text-slate-500">{s.weight} kg</div>
                        </div>
                     </div>
                  )) : (
                      <div className="p-8 text-center text-slate-500">No shipments pending for run sheet</div>
                  )}
               </div>
            </div>
         </div>
    );
}

function CashCollectionView({ history }) {
    const totalCash = history
        .filter(s => s.status === 'Delivered' && s.paymentMode === 'Cash')
        .reduce((acc, s) => acc + (parseFloat(s.cost) || 0), 0);

    return (
         <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Cash Collection & Reconciliation</h1>
            
            <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4">Submit Collected Cash</h3>
                  <div className="space-y-4">
                     <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Run Sheet ID</label>
                         <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                             <option>RS-2025-10-24-A (Morning)</option>
                             <option>RS-2025-10-24-B (Afternoon)</option>
                         </select>
                     </div>
                     <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Total COD Amount</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                           <input type="number"  className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg" placeholder="Enter amount" />
                        </div>
                     </div>
                     <button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
                        Verify & Submit
                     </button>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                     <div className="text-slate-400 text-sm font-medium mb-1">Total Cash in Hand</div>
                     <div className="text-4xl font-bold">₹{totalCash}</div>
                     <div className="mt-4 flex gap-2">
                        <button className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">Deposit to Bank</button>
                        <button className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">View History</button>
                     </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Recent Transactions</h3>
                     <div className="space-y-3">
                         <p className="text-slate-400 text-sm italic">No recent deposits</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
    );
}
