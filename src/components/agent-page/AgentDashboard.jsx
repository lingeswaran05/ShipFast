import { useState, useMemo, useEffect } from 'react';
import { LayoutDashboard, Package, Scan, FileText, DollarSign, CheckCircle, MapPin, Phone, Truck, Clock, AlertTriangle, ChevronRight, Filter, Search, Calendar, User, Printer, Download, History, CreditCard } from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';
import { toast } from 'sonner';
import { SectionDownloader } from '../shared/SectionDownloader';

export function AgentDashboard({ view }) {
  const { shipments, updateShipmentStatus, currentUser } = useShipment();
  const [scanId, setScanId] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanStatusMode, setScanStatusMode] = useState('Received at Hub'); // Default scan mode
  const [activeTab, setActiveTab] = useState('deliveries'); 
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCity, setFilterCity] = useState('');
  
  // Shift Timer Logic
  const [shiftDuration, setShiftDuration] = useState('00:00');
  useEffect(() => {
    // Mock shift start: 4 hours and 30 minutes ago
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 4);
    startTime.setMinutes(startTime.getMinutes() - 32);

    const timer = setInterval(() => {
        const now = new Date();
        const diff = now - startTime;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        setShiftDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Derived state for stats
  const stats = useMemo(() => {
     return {
         toDeliver: shipments.filter(s => ['In Transit', 'Out for Delivery', 'Received at Hub', 'Booked'].includes(s.status)).length,
         completed: shipments.filter(s => ['Delivered', 'Cancelled', 'Failed'].includes(s.status)).length,
         cashCollected: shipments
            .filter(s => s.status === 'Delivered' && s.paymentMode === 'Cash')
            .reduce((acc, s) => acc + (parseFloat(s.cost) || 0), 0)
     };
  }, [shipments]);

  // Dynamic Shipment List based on Tab & Filters
  const shipmentList = useMemo(() => {
    let list = [];
    const normalize = (s) => s?.toUpperCase().replace(/_/g, ' ') || '';
    
    if (activeTab === 'deliveries') {
        list = shipments.filter(s => {
            const status = normalize(s.status);
            return ['IN TRANSIT', 'OUT FOR DELIVERY', 'RECEIVED AT HUB', 'BOOKED'].includes(status);
        });
    } else if (activeTab === 'history') {
        list = shipments.filter(s => {
            const status = normalize(s.status);
            return ['DELIVERED', 'CANCELLED', 'FAILED'].includes(status);
        });
    } else if (activeTab === 'pickups') {
         list = shipments.filter(s => normalize(s.status) === 'BOOKED');
    }

    if (filterStatus !== 'All') {
        list = list.filter(s => normalize(s.status) === normalize(filterStatus));
    }
    
    if (filterCity) {
        const term = filterCity.toLowerCase();
        list = list.filter(s => {
            // Context-aware filtering
            if (activeTab === 'pickups') {
                return s.sender?.city?.toLowerCase().includes(term) || s.origin?.toLowerCase().includes(term);
            } else if (activeTab === 'deliveries') {
                return s.receiver?.city?.toLowerCase().includes(term) || s.destination?.toLowerCase().includes(term);
            } else {
                // For history, check both
                return (s.sender?.city?.toLowerCase().includes(term) || s.origin?.toLowerCase().includes(term)) || 
                       (s.receiver?.city?.toLowerCase().includes(term) || s.destination?.toLowerCase().includes(term));
            }
        });
    }
    return list;
  }, [shipments, activeTab, filterStatus, filterCity]);

  const handleQuickStatusUpdate = (id, newStatus) => {
      updateShipmentStatus(id, newStatus, 'Agent Update');
      toast.success(`Shipment updated to ${newStatus}`);
  };
  
  const handleScan = (e) => {
    e.preventDefault();
    if (!scanId) return;

    // Check if shipment exists
    const shipment = shipments.find(s => s.id === scanId);
    if (shipment) {
        if (shipment.status === scanStatusMode) {
            setScanResult({
                id: scanId,
                status: `Already ${scanStatusMode}`,
                timestamp: new Date().toLocaleString(),
                success: false // Or true, but visually distinct? Requirement asks to prevent duplicates.
                // Let's treat it as a non-op or info. But maybe the user just wants to see success if it's already done?
                // Requirement: "Prevent duplicate updates". 
                // Let's show a toast info and not update.
            });
            toast.info(`Shipment is already ${scanStatusMode}`);
        } else {
            updateShipmentStatus(scanId, scanStatusMode);
            setScanResult({
                id: scanId,
                status: scanStatusMode,
                timestamp: new Date().toLocaleString(),
                success: true
            });
            toast.success("Status Updated Successfully");
        }
    } else {
        setScanResult({
            id: scanId,
            status: 'Not Found',
            timestamp: new Date().toLocaleString(),
            success: false
        });
        toast.error('Shipment ID not found');
    }
    setScanId('');
    setTimeout(() => setScanResult(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Active Shipments</div>
            <div className="text-2xl font-bold text-slate-800">{stats.toDeliver}</div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Completed</div>
            <div className="text-2xl font-bold text-slate-800">{stats.completed}</div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Cash in Hand</div>
            <div className="text-2xl font-bold text-emerald-600">₹{stats.cashCollected}</div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
             <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Shift Timer</div>
             <div className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
                {shiftDuration} <span className="text-xs font-normal text-slate-400">Hrs</span>
             </div>
         </div>
      </div>

      {view === 'overview' && (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto">
                    {['deliveries', 'pickups', 'history', 'profile'].map(tab => (
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
                
                {activeTab !== 'profile' && (
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                             <input 
                                type="text" 
                                placeholder="Filter city..." 
                                className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                                value={filterCity}
                                onChange={(e) => setFilterCity(e.target.value)}
                             />
                        </div>
                        <select 
                            className="pl-3 pr-8 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Booked">Booked</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                        </select>
                    </div>
                )}
            </div>

            {activeTab === 'profile' && (
                <AgentProfileView currentUser={currentUser} />
            )}

            {activeTab !== 'profile' && (
                <div className="space-y-4">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                        {activeTab === 'deliveries' && <Truck className="w-5 h-5 text-indigo-600" />}
                        {activeTab === 'pickups' && <Package className="w-5 h-5 text-indigo-600" />}
                        {activeTab === 'history' && <Clock className="w-5 h-5 text-slate-600" />}
                        
                        <span className="capitalize">{activeTab}</span> 
                        <span className="text-slate-400 font-normal text-sm ml-2">({shipmentList.length})</span>
                    </h2>
                    
                    {shipmentList.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-xl border border-slate-200 border-dashed animate-fade-in">
                             <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                             <p className="text-slate-500">No {activeTab} found matching your filters.</p>
                             <button onClick={() => {setFilterStatus('All'); setFilterCity('');}} className="mt-4 text-indigo-600 font-bold hover:underline">Clear Filters</button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {shipmentList.map(shipment => (
                                <div key={shipment.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-lg text-slate-900">{shipment.id}</span>
                                            </div>
                                            <div className="flex gap-2 mb-2">
                                                 <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                    shipment.paymentMode === 'Cash' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {shipment.paymentMode}
                                                </span>
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">
                                                    {shipment.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-xl text-slate-900">₹{shipment.cost}</div>
                                            <div className="text-xs text-slate-400">Value</div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">
                                                    {activeTab === 'pickups' ? shipment.sender.name : shipment.receiver.name}
                                                </div>
                                                <div className="text-sm text-slate-600 leading-snug">
                                                    {activeTab === 'pickups' ? shipment.sender.city : shipment.receiver.city}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {activeTab === 'deliveries' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => handleQuickStatusUpdate(shipment.id, 'Delivered')}
                                                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Delivered
                                            </button>
                                            <button 
                                                onClick={() => handleQuickStatusUpdate(shipment.id, 'Failed Attempt')}
                                                className="py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                                            >
                                                <AlertTriangle className="w-4 h-4" /> Failed
                                            </button>
                                        </div>
                                    )}
                                    {activeTab === 'pickups' && (
                                        <button 
                                            onClick={() => handleQuickStatusUpdate(shipment.id, 'Received at Hub')}
                                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                                        >
                                            <Package className="w-4 h-4" /> Confirm Pickup
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
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
                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Scan Action</label>
                    <select 
                        value={scanStatusMode}
                        onChange={(e) => setScanStatusMode(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium"
                    >
                        <option value="Booked">Booked</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Received at Hub">Arrived at Hub</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Failed Attempt">Failed Attempt</option>
                    </select>
                </div>

                <div className="mb-6 text-center">
                   <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Scan className="w-10 h-10 text-indigo-600" />
                   </div>
                   <p className="text-sm font-medium text-indigo-600">Ready to Scan ({scanStatusMode})</p>
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
                   <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 transform hover:-translate-y-0.5">
                      Process Scan
                   </button>
                </div>
            </form>

            {scanResult && (
               <div className={`border rounded-xl p-4 flex items-center gap-4 animate-fade-in-up ${scanResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${scanResult.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                     {scanResult.success ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                  </div>
                  <div>
                     <div className={`font-bold ${scanResult.success ? 'text-green-800' : 'text-red-800'}`}>
                        {scanResult.success ? 'Status Updated Successfully' : 'Shipment Not Found'}
                     </div>
                     <div className={`text-sm ${scanResult.success ? 'text-green-700' : 'text-red-700'}`}>
                        {scanResult.id} : {scanResult.status}
                     </div>
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
         <RunSheetView todaysDeliveries={shipments.filter(s => ['Received at Hub', 'Booked', 'Out for Delivery'].includes(s.status))} />
      )}

      {view === 'cash' && (
         <CashCollectionView shipments={shipments} />
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
    const [selectedIds, setSelectedIds] = useState([]);
    const [generatedSheet, setGeneratedSheet] = useState(null);

    const toggleSelection = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleAssign = () => {
        if (selectedIds.length === 0) return toast.error("Select shipments to assign");
        
        const sheet = {
            id: `RS-${Date.now()}`,
            date: new Date().toLocaleDateString(),
            items: todaysDeliveries.filter(s => selectedIds.includes(s.id)),
            agent: 'Current Agent' // In real app, get from context
        };
        setGeneratedSheet(sheet);
        toast.success(`Run Sheet ${sheet.id} Generated`);
    };
    
    // Filtering for logic demo
    const eligibleForRunSheet = todaysDeliveries.filter(s => ['Received at Hub', 'Booked', 'Out for Delivery'].includes(s.status));

    return (
         <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Run Sheet Generation</h1>
                <p className="text-slate-600">Assign pending deliveries to drivers</p>
              </div>
              <div className="flex gap-2">
                  {generatedSheet && (
                      <SectionDownloader 
                        title="Download Sheet"
                        className="inline-block"
                      >
                           <div className="p-8 bg-white" id="run-sheet-content">
                               <div className="flex justify-between items-center mb-6 border-b pb-4">
                                   <div>
                                       <h1 className="text-2xl font-bold text-slate-900">Delivery Run Sheet</h1>
                                       <p className="text-slate-500">ID: {generatedSheet.id}</p>
                                   </div>
                                   <div className="text-right">
                                       <p className="font-bold">{generatedSheet.date}</p>
                                       <p className="text-sm text-slate-500">Items: {generatedSheet.items.length}</p>
                                   </div>
                               </div>
                               <table className="w-full text-left text-sm border-collapse">
                                   <thead>
                                       <tr className="bg-slate-100">
                                           <th className="p-3 border text-slate-700">Tracking ID</th>
                                           <th className="p-3 border text-slate-700">Receiver / Address</th>
                                           <th className="p-3 border text-slate-700">Type</th>
                                           <th className="p-3 border text-slate-700 text-right">COD Amount</th>
                                           <th className="p-3 border text-slate-700">Signature</th>
                                       </tr>
                                   </thead>
                                   <tbody>
                                       {generatedSheet.items.map(s => (
                                           <tr key={s.id}>
                                               <td className="p-3 border font-mono">{s.id}</td>
                                               <td className="p-3 border">
                                                   <div className="font-bold">{s.receiver.name}</div>
                                                   <div className="text-slate-500">{s.receiver.address}, {s.receiver.city}</div>
                                                   <div className="text-xs text-slate-400">Ph: {s.receiver.phone}</div>
                                               </td>
                                               <td className="p-3 border">{s.type}</td>
                                               <td className="p-3 border text-right font-mono">
                                                   {s.paymentMode === 'Cash' ? `₹${s.cost}` : '-'}
                                               </td>
                                               <td className="p-3 border"></td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                               <div className="mt-8 pt-4 border-t flex justify-between text-sm text-slate-500">
                                   <div>Generated by System</div>
                                   <div>Authorized Signature _________________</div>
                               </div>
                           </div>
                      </SectionDownloader>
                  )}

                  <button 
                    onClick={handleAssign}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2 h-10"
                  >
                    <FileText className="w-4 h-4" />
                    Generate Sheet ({selectedIds.length})
                  </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Pending for Delivery (Today)</span>
                  <span className="text-sm bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">{eligibleForRunSheet.length} Shipments</span>
               </div>
               <div className="divide-y divide-slate-100">
                  {eligibleForRunSheet.length > 0 ? eligibleForRunSheet.map(s => (
                     <div key={s.id} className="p-4 hover:bg-slate-50 flex items-center gap-4 cursor-pointer" onClick={() => toggleSelection(s.id)}>
                        <div className="relative flex items-center justify-center p-2">
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                                checked={selectedIds.includes(s.id)}
                                onChange={() => {}} 
                            />
                        </div>
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

function CashCollectionView({ shipments }) {
    const [historyInfo, setHistoryInfo] = useState(false);
    const [submittedTransactions, setSubmittedTransactions] = useState([]);
    const [verifyAmount, setVerifyAmount] = useState('');
    
    // Categorization Logic
    const breakdown = shipments
        .filter(s => s.status === 'Delivered')
        .reduce((acc, s) => {
            const mode = s.paymentMode || 'Cash';
            acc[mode] = (acc[mode] || 0) + (parseFloat(s.cost) || 0);
            return acc;
        }, {});

    const totalCollected = Object.values(breakdown).reduce((a, b) => a + b, 0);

    const handleDeposit = () => {
        toast.success(`Deposit initiated for ₹${totalCollected.toLocaleString()}`);
        // Mock deposit logic - ideally would clear the stats or mark as 'Deposited'
        // For now, we simulate adding to history
        const newTxn = {
            id: `DEP-${Date.now()}`,
            date: new Date().toLocaleString(),
            amount: totalCollected,
            type: 'Deposit',
            status: 'Processing'
        };
        setSubmittedTransactions([newTxn, ...submittedTransactions]);
    };

    const handleSubmitCash = () => {
        if (!verifyAmount || parseFloat(verifyAmount) <= 0) return toast.error("Enter valid amount");
        
        const amount = parseFloat(verifyAmount);
        toast.success(`Cash verification submitted for ₹${amount}`);
        const newTxn = {
             id: `CSH-${Date.now()}`,
             date: new Date().toLocaleString(),
             amount: amount,
             type: 'Cash Submission',
             status: 'Verified'
        };
        setSubmittedTransactions([newTxn, ...submittedTransactions]);
        setVerifyAmount('');
    };

    return (
         <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Cash Collection & Reconciliation</h1>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                     <div className="text-slate-400 text-sm font-medium mb-1">Total Verified Revenue</div>
                     <div className="text-4xl font-bold">₹{totalCollected.toLocaleString()}</div>
                     <div className="mt-4 flex gap-2">
                        <button 
                            onClick={handleDeposit}
                            className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <CreditCard className="w-4 h-4" /> Deposit All
                        </button>
                        <button 
                            onClick={() => setHistoryInfo(!historyInfo)}
                            className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <History className="w-4 h-4" /> {historyInfo ? 'Hide History' : 'View History'}
                        </button>
                     </div>
                  </div>
                  
                  {historyInfo && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                          <h3 className="font-bold text-slate-900 mb-2 text-sm">Recent Transactions</h3>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                              {submittedTransactions.length > 0 ? submittedTransactions.map(txn => (
                                  <div key={txn.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                                      <div>
                                          <div className="font-medium text-slate-800">{txn.type}</div>
                                          <div className="text-xs text-slate-500">{txn.date}</div>
                                      </div>
                                      <div className="text-right">
                                          <div className="font-bold text-indigo-600">₹{txn.amount}</div>
                                          <div className="text-xs text-green-600">{txn.status}</div>
                                      </div>
                                  </div>
                              )) : (
                                  <p className="text-slate-400 text-xs italic">No recent deposits.</p>
                              )}
                          </div>
                      </div>
                  )}
                  
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Breakdown by Method</h3>
                     <div className="space-y-3">
                         {Object.entries(breakdown).map(([method, amount]) => (
                             <div key={method} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                 <span className="font-medium text-slate-700">{method}</span>
                                 <span className="font-bold text-slate-900">₹{amount.toLocaleString()}</span>
                             </div>
                         ))}
                         {Object.keys(breakdown).length === 0 && <p className="text-slate-400 text-sm italic">No collected payments yet</p>}
                     </div>
                  </div>
               </div>

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
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Total COD Amount (Cash Only)</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                           <input 
                                type="number" 
                                className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg" 
                                placeholder="Enter amount"
                                value={verifyAmount}
                                onChange={(e) => setVerifyAmount(e.target.value)}
                           />
                        </div>
                     </div>
                     <button 
                        onClick={handleSubmitCash}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                     >
                        Verify & Submit
                     </button>
                  </div>
               </div>
            </div>
         </div>
    );
}

function AgentProfileView({ currentUser }) {
    const { staff } = useShipment();
    // Fallback logic
    const agentDetails = staff.find(s => s.email === currentUser?.email) || staff.find(s => s.role === 'Agent') || {};

    return (
         <div className="animate-fade-in-up space-y-6">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                My Profile & Performance
            </h2>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600 border-2 border-indigo-100 shadow-sm">
                        {agentDetails.name?.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{agentDetails.name}</h3>
                        <div className="text-slate-500">{agentDetails.role} • {agentDetails.branch}</div>
                        <div className="flex items-center gap-2 mt-1">
                             <span className={`px-2 py-0.5 rounded text-xs font-bold ${agentDetails.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                 {agentDetails.status}
                             </span>
                             <span className="text-xs text-slate-400">ID: {agentDetails.id}</span>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider border-b border-slate-100 pb-2">Personal Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-slate-500 mb-1">Email</div>
                                <div className="font-medium">{agentDetails.email}</div>
                            </div>
                            <div>
                                <div className="text-slate-500 mb-1">Phone</div>
                                <div className="font-medium">{agentDetails.phone}</div>
                            </div>
                             <div>
                                <div className="text-slate-500 mb-1">Date of Birth</div>
                                <div className="font-medium">{agentDetails.personalDetails?.dob || 'N/A'}</div>
                            </div>
                             <div>
                                <div className="text-slate-500 mb-1">Blood Group</div>
                                <div className="font-medium">{agentDetails.personalDetails?.bloodGroup || 'N/A'}</div>
                            </div>
                             <div className="col-span-2">
                                <div className="text-slate-500 mb-1">Address</div>
                                <div className="font-medium">{agentDetails.personalDetails?.address || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider border-b border-slate-100 pb-2">Work & Performance</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                             <div>
                                <div className="text-slate-500 mb-1">Shift Timing</div>
                                <div className="font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">
                                    {agentDetails.performance?.shift || 'Flexible'}
                                </div>
                            </div>
                             <div>
                                <div className="text-slate-500 mb-1">Joining Date</div>
                                <div className="font-medium">{agentDetails.personalDetails?.joiningDate || 'N/A'}</div>
                            </div>
                             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="text-slate-500 mb-1">Success Rating</div>
                                <div className="font-bold text-lg text-emerald-600 flex items-center gap-1">
                                    {agentDetails.performance?.rating || '0.0'} / 5.0
                                    <span className="text-xs font-normal text-slate-400">(Top 10%)</span>
                                </div>
                            </div>
                             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="text-slate-500 mb-1">Total Deliveries</div>
                                <div className="font-bold text-lg text-slate-900">
                                    {agentDetails.performance?.deliveries || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200">
                     <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-4">Uploaded Documents</h4>
                     <div className="flex gap-4">
                         {['Aadhar', 'License', 'PAN'].map(doc => {
                             const key = doc.toLowerCase();
                             const hasDoc = agentDetails.documents?.[key];
                             return (
                                 <div key={doc} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${hasDoc ? 'bg-white border-green-200 text-green-700' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                                     <FileText className="w-4 h-4" />
                                     <span className="text-sm font-medium">{doc}</span>
                                     {hasDoc && <CheckCircle className="w-3 h-3 ml-1" />}
                                 </div>
                             )
                         })}
                     </div>
                </div>
            </div>
         </div>
    );
}
