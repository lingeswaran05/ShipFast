import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { LayoutDashboard, Package, Scan, FileText, DollarSign, CheckCircle, MapPin, Phone, Truck, Clock, AlertTriangle, ChevronRight, Filter, Search, Calendar, User, Printer, Download, History, CreditCard, Camera, Upload } from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';
import { toast } from 'sonner';
import { SectionDownloader } from '../shared/SectionDownloader';
import { operationsService } from '../../lib/operationsService';
import { BarcodeGenerator } from '../shared/BarcodeGenerator';
import { printElementById } from '../../lib/printUtils';
import Webcam from 'react-webcam';

const normalizeStatus = (value) => String(value || '').toUpperCase().replace(/_/g, ' ');
const isCodPayment = (shipment) => ['cash', 'cod'].includes(String(shipment?.paymentMode || shipment?.paymentMethod || '').toLowerCase());

const getPartyDetails = (shipment, type) => {
    const primary = type === 'sender' ? shipment?.sender : shipment?.receiver;
    const fallback = type === 'sender' ? shipment?.senderAddress : shipment?.receiverAddress;
    const details = primary || fallback || {};

    return {
        name: details.name || details.fullName || 'N/A',
        city: details.city || 'N/A',
        address: details.address || details.addressLine || '',
        phone: details.phone || 'N/A'
    };
};

export function AgentDashboard({ view }) {
    const { shipments, updateShipmentStatus, currentUser, refreshShipments, lastDataSyncAt, getRoleNotifications } = useShipment();
  const [scanId, setScanId] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanStatusMode, setScanStatusMode] = useState('Received at Hub'); // Default scan mode
  const [podImage, setPodImage] = useState('');
  const [showPodCamera, setShowPodCamera] = useState(false);
  const [activeTab, setActiveTab] = useState('deliveries'); 
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCity, setFilterCity] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const agentNotifications = getRoleNotifications('agent');
    const podFileInputRef = useRef(null);
    const podWebcamRef = useRef(null);

    const onboardingStorageKey = `sf_agent_onboarding_${currentUser?.email || currentUser?.id || currentUser?.userId || 'default'}`;
    const legacyOnboardingStorageKey = `agent_onboarding_${currentUser?.email || currentUser?.id || currentUser?.userId || 'default'}`;
    const [agentOnboarding, setAgentOnboarding] = useState({
        agentId: '',
        licenseNumber: '',
        vehicleNumber: '',
        rcBookNumber: '',
        bloodType: '',
        organDonor: false,
        verifiedAt: null,
        profilePhoto: null,
        aadharCopy: null,
        licenseCopy: null,
        rcBookCopy: null
    });
    const [isAgentProfileLoading, setIsAgentProfileLoading] = useState(true);
  
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

    useEffect(() => {
        if (currentUser?.role !== 'agent') return;

        const loadOnboarding = async () => {
            setIsAgentProfileLoading(true);
            let localDocs = {};
            const cached = localStorage.getItem(onboardingStorageKey) || localStorage.getItem(legacyOnboardingStorageKey);
            if (cached) {
                try {
                    localDocs = JSON.parse(cached) || {};
                } catch {
                    localDocs = {};
                }
            }

            const userId = currentUser?.userId || currentUser?.id || currentUser?.email;
            try {
                const profile = await operationsService.getAgentProfile(userId);
                if (profile) {
                    setAgentOnboarding(prev => ({
                        ...prev,
                        agentId: profile.agentId || prev.agentId || '',
                        licenseNumber: profile.licenseNumber || '',
                        vehicleNumber: profile.vehicleNumber || '',
                        rcBookNumber: profile.rcBookNumber || '',
                        bloodType: profile.bloodType || '',
                        organDonor: Boolean(profile.organDonor),
                        verifiedAt: profile.updatedAt || profile.joinDate || new Date().toISOString(),
                        profilePhoto: profile.profileImage || localDocs.profilePhoto || prev.profilePhoto,
                        aadharCopy: localDocs.aadharCopy || prev.aadharCopy,
                        licenseCopy: localDocs.licenseCopy || prev.licenseCopy,
                        rcBookCopy: localDocs.rcBookCopy || prev.rcBookCopy
                    }));
                    setIsAgentProfileLoading(false);
                    return;
                }
            } catch {
                // non-blocking fallback to local cache
            }

            if (Object.keys(localDocs).length > 0) {
                setAgentOnboarding(prev => ({ ...prev, ...localDocs }));
            }
            setIsAgentProfileLoading(false);
        };

        loadOnboarding();
    }, [currentUser?.role, currentUser?.userId, currentUser?.id, currentUser?.email, onboardingStorageKey, legacyOnboardingStorageKey]);

  // Derived state for stats
  const stats = useMemo(() => {
     return {
         toDeliver: shipments.filter(s => ['In Transit', 'Out for Delivery', 'Received at Hub', 'Booked'].includes(s.status)).length,
         completed: shipments.filter(s => ['Delivered', 'Cancelled', 'Failed'].includes(s.status)).length,
         cashCollected: shipments
            .filter(s => normalizeStatus(s.status) === 'DELIVERED' && isCodPayment(s))
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
                return s.sender?.city?.toLowerCase().includes(term) || s.senderAddress?.city?.toLowerCase().includes(term) || s.origin?.toLowerCase().includes(term);
            } else if (activeTab === 'deliveries') {
                return s.receiver?.city?.toLowerCase().includes(term) || s.receiverAddress?.city?.toLowerCase().includes(term) || s.destination?.toLowerCase().includes(term);
            } else {
                // For history, check both
                return (s.sender?.city?.toLowerCase().includes(term) || s.senderAddress?.city?.toLowerCase().includes(term) || s.origin?.toLowerCase().includes(term)) || 
                       (s.receiver?.city?.toLowerCase().includes(term) || s.receiverAddress?.city?.toLowerCase().includes(term) || s.destination?.toLowerCase().includes(term));
            }
        });
    }
    return list;
  }, [shipments, activeTab, filterStatus, filterCity]);

  const handleQuickStatusUpdate = async (id, newStatus) => {
      if (normalizeStatus(newStatus) === 'DELIVERED') {
          toast.info('Use Scan Parcels with Delivered status to upload proof of delivery.');
          return;
      }
      try {
          await updateShipmentStatus(id, newStatus, 'Agent Update');
          toast.success(`Shipment updated to ${newStatus}`);
      } catch (error) {
          toast.error(error.message || 'Failed to update shipment');
      }
  };
  
  const handlePodFile = async (file) => {
    if (!file) return;
    try {
      const base64 = await convertFileToBase64(file);
      setPodImage(base64);
    } catch {
      toast.error('Failed to read proof image');
    }
  };

  const capturePodImage = useCallback(() => {
    const imageSrc = podWebcamRef.current?.getScreenshot?.();
    if (!imageSrc) {
      toast.error('Unable to capture image');
      return;
    }
    setPodImage(imageSrc);
    setShowPodCamera(false);
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanId) return;
    if (normalizeStatus(scanStatusMode) === 'DELIVERED' && !podImage) {
      toast.error('Proof of delivery image is required for Delivered status');
      return;
    }

    const normalizedScan = String(scanId || '').trim().toUpperCase();
    const shipment = shipments.find(s =>
        String(s.id || '').toUpperCase() === normalizedScan ||
        String(s.trackingId || '').toUpperCase() === normalizedScan ||
        String(s.trackingNumber || '').toUpperCase() === normalizedScan
    );

    if (shipment) {
        if (normalizeStatus(shipment.status) === normalizeStatus(scanStatusMode)) {
            setScanResult({
                id: shipment.trackingNumber || shipment.id,
                status: `Already ${scanStatusMode}`,
                timestamp: new Date().toLocaleString(),
                success: false
            });
            toast.info(`Shipment is already ${scanStatusMode}`);
        } else {
            try {
                await updateShipmentStatus(shipment.id, scanStatusMode, {
                    remarks: 'Updated via agent scan',
                    proofOfDeliveryImage: normalizeStatus(scanStatusMode) === 'DELIVERED' ? podImage : null,
                    deliveredBy: currentUser?.name || currentUser?.email || 'Agent',
                    deliveredByAgentId: agentOnboarding.agentId || currentUser?.userId || currentUser?.id || currentUser?.email
                });
                setScanResult({
                    id: shipment.trackingNumber || shipment.id,
                    status: scanStatusMode,
                    timestamp: new Date().toLocaleString(),
                    success: true
                });
                toast.success('Status Updated Successfully');
            } catch (error) {
                toast.error(error.message || 'Failed to update shipment status');
            }
        }
    } else {
        try {
            await updateShipmentStatus(scanId, scanStatusMode, {
                remarks: 'Updated via agent scan',
                proofOfDeliveryImage: normalizeStatus(scanStatusMode) === 'DELIVERED' ? podImage : null,
                deliveredBy: currentUser?.name || currentUser?.email || 'Agent',
                deliveredByAgentId: agentOnboarding.agentId || currentUser?.userId || currentUser?.id || currentUser?.email
            });
            setScanResult({
                id: scanId,
                status: scanStatusMode,
                timestamp: new Date().toLocaleString(),
                success: true
            });
            toast.success('Status Updated Successfully');
            refreshShipments();
        } catch {
            setScanResult({
                id: scanId,
                status: 'Not Found',
                timestamp: new Date().toLocaleString(),
                success: false
            });
            toast.error('Shipment ID not found');
        }
    }
    setScanId('');
    if (normalizeStatus(scanStatusMode) === 'DELIVERED') {
      setPodImage('');
      setShowPodCamera(false);
    }
    setTimeout(() => setScanResult(null), 3000);
  };

    const hasMandatoryProfile = Boolean(
        agentOnboarding.licenseNumber &&
        agentOnboarding.vehicleNumber &&
        agentOnboarding.rcBookNumber &&
        agentOnboarding.bloodType
    );

    const hasLocalDocs = Boolean(
        agentOnboarding.profilePhoto &&
        agentOnboarding.aadharCopy &&
        agentOnboarding.licenseCopy &&
        agentOnboarding.rcBookCopy
    );

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const handleOnboardingFile = async (fieldName, file) => {
        if (!file) return;
        const base64 = await convertFileToBase64(file);
        setAgentOnboarding(prev => ({ ...prev, [fieldName]: base64 }));
    };

    const handleAgentOnboardingSubmit = async (e) => {
        e.preventDefault();
        if (!hasMandatoryProfile) {
            toast.error('Please complete all mandatory agent details');
            return;
        }
        if (!hasLocalDocs) {
            toast.error('Please upload profile photo, Aadhaar, License and RC copy');
            return;
        }

        try {
            const userId = currentUser?.userId || currentUser?.id || currentUser?.email;
            const savedProfile = await operationsService.upsertAgentProfile(userId, {
                licenseNumber: agentOnboarding.licenseNumber,
                vehicleNumber: agentOnboarding.vehicleNumber,
                rcBookNumber: agentOnboarding.rcBookNumber,
                bloodType: agentOnboarding.bloodType,
                organDonor: Boolean(agentOnboarding.organDonor),
                profileImage: agentOnboarding.profilePhoto
            });

            localStorage.setItem(onboardingStorageKey, JSON.stringify({
                profilePhoto: agentOnboarding.profilePhoto,
                aadharCopy: agentOnboarding.aadharCopy,
                licenseCopy: agentOnboarding.licenseCopy,
                rcBookCopy: agentOnboarding.rcBookCopy
            }));
            setAgentOnboarding(prev => ({
                ...prev,
                agentId: savedProfile?.agentId || prev.agentId || '',
                verifiedAt: savedProfile?.updatedAt || new Date().toISOString()
            }));
            toast.success('Agent details saved successfully');
            setActiveTab('deliveries');
        } catch (error) {
            toast.error('Failed to save agent details. ' + error.message);
        }
    };

    const handleRefreshAgentData = async () => {
        setIsRefreshing(true);
        try {
            await refreshShipments();
            toast.success('Live shipments refreshed');
        } catch (error) {
            toast.error(error.message || 'Refresh failed');
        } finally {
            setIsRefreshing(false);
        }
    };

    // Use contextual flag if user is actually onboarded
    const isActuallyOnboarded = Boolean(agentOnboarding.verifiedAt || hasMandatoryProfile);

    if (currentUser?.role === 'agent' && isAgentProfileLoading) {
        return (
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-600">
                Loading agent profile...
            </div>
        );
    }

    if (currentUser?.role === 'agent' && !isActuallyOnboarded) {
        return (
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in-up">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Complete Agent Verification</h2>
                    <p className="text-slate-600">Fill mandatory details before accessing agent operations.</p>
                </div>

                <form onSubmit={handleAgentOnboardingSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">License Number *</label>
                            <input
                                type="text"
                                value={agentOnboarding.licenseNumber}
                                onChange={(e) => setAgentOnboarding(prev => ({ ...prev, licenseNumber: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Vehicle Number *</label>
                            <input
                                type="text"
                                value={agentOnboarding.vehicleNumber}
                                onChange={(e) => setAgentOnboarding(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">RC Book Number *</label>
                            <input
                                type="text"
                                value={agentOnboarding.rcBookNumber}
                                onChange={(e) => setAgentOnboarding(prev => ({ ...prev, rcBookNumber: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Blood Type *</label>
                            <select
                                value={agentOnboarding.bloodType}
                                onChange={(e) => setAgentOnboarding(prev => ({ ...prev, bloodType: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                required
                            >
                                <option value="">Select</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Organ Donor</label>
                            <select
                                value={agentOnboarding.organDonor ? 'yes' : 'no'}
                                onChange={(e) => setAgentOnboarding(prev => ({ ...prev, organDonor: e.target.value === 'yes' }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Profile Photo *</label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                onChange={(e) => handleOnboardingFile('profilePhoto', e.target.files?.[0])}
                                className="w-full text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Aadhaar Copy *</label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => handleOnboardingFile('aadharCopy', e.target.files?.[0])}
                                className="w-full text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">License Copy *</label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => handleOnboardingFile('licenseCopy', e.target.files?.[0])}
                                className="w-full text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">RC Book Copy *</label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => handleOnboardingFile('rcBookCopy', e.target.files?.[0])}
                                className="w-full text-sm"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                    >
                        Save & Continue
                    </button>
                </form>
            </div>
        );
    }

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

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                <div>
                    <div className="font-semibold text-slate-900">Live Operations Feed</div>
                    <div className="text-xs text-slate-500">{lastDataSyncAt ? `Last sync: ${new Date(lastDataSyncAt).toLocaleTimeString()}` : 'No sync yet'}</div>
                </div>
                <button
                    onClick={handleRefreshAgentData}
                    disabled={isRefreshing}
                    className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-70"
                >
                    {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
                </button>
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
                            {shipmentList.map(shipment => {
                                const senderDetails = getPartyDetails(shipment, 'sender');
                                const receiverDetails = getPartyDetails(shipment, 'receiver');
                                return (
                                <div key={shipment.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-lg text-slate-900">{shipment.id}</span>
                                            </div>
                                            <div className="flex gap-2 mb-2">
                                                 <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                    isCodPayment(shipment) ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
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
                                                    {activeTab === 'pickups' ? senderDetails.name : receiverDetails.name}
                                                </div>
                                                <div className="text-sm text-slate-600 leading-snug">
                                                    {activeTab === 'pickups' ? senderDetails.city : receiverDetails.city}
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
                            )})}
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
                   {normalizeStatus(scanStatusMode) === 'DELIVERED' && (
                      <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                         <div className="text-sm font-semibold text-slate-700">Proof of Delivery (required)</div>
                         {podImage ? (
                            <img src={podImage} alt="POD" className="w-full h-44 object-cover rounded-lg border border-slate-200" />
                         ) : (
                            <div className="h-44 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm">
                              Upload or capture delivery image
                            </div>
                         )}
                         <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => podFileInputRef.current?.click()}
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
                            >
                              <Upload className="w-4 h-4" /> Upload
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowPodCamera(true)}
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
                            >
                              <Camera className="w-4 h-4" /> Camera
                            </button>
                         </div>
                         <input
                           ref={podFileInputRef}
                           type="file"
                           accept="image/*"
                           onChange={(e) => handlePodFile(e.target.files?.[0])}
                           className="hidden"
                         />
                      </div>
                   )}
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

            {showPodCamera && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-md">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Capture Proof of Delivery</h3>
                    <button type="button" onClick={() => setShowPodCamera(false)} className="text-slate-500">Close</button>
                  </div>
                  <div className="bg-black">
                    <Webcam
                      audio={false}
                      ref={podWebcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full h-full object-cover"
                      videoConstraints={{ facingMode: 'environment' }}
                    />
                  </div>
                  <div className="p-4 bg-slate-50">
                    <button
                      type="button"
                      onClick={capturePodImage}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                    >
                      Capture
                    </button>
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
        <RunSheetView
            todaysDeliveries={shipments.filter(s => {
                const allowed = ['RECEIVED AT HUB', 'BOOKED', 'OUT FOR DELIVERY'].includes(normalizeStatus(s.status));
                if (!allowed) return false;
                const allowedAgentIds = [
                  agentOnboarding.agentId,
                  currentUser?.userId,
                  currentUser?.id,
                  currentUser?.email
                ].filter(Boolean);
                return !s.assignedAgentId || allowedAgentIds.includes(s.assignedAgentId);
            })}
            currentUser={currentUser}
            agentIdentifier={agentOnboarding.agentId || currentUser?.userId || currentUser?.id || currentUser?.email}
            refreshShipments={refreshShipments}
        />
      )}

      {view === 'cash' && (
         <CashCollectionView shipments={shipments} />
      )}

            {view === 'notifications' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Agent Notifications</h2>
                        <p className="text-sm text-slate-500">Important delivery and operational alerts</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {agentNotifications.length > 0 ? agentNotifications.map((item) => (
                            <div key={item.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-slate-50">
                                <div>
                                    <p className="font-medium text-slate-900">{item.message}</p>
                                    <p className="text-xs text-slate-500 mt-1">{item.timestamp}</p>
                                </div>
                                <span className="text-xs px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-semibold">Alert</span>
                            </div>
                        )) : (
                            <div className="px-6 py-10 text-center text-slate-500">No notifications yet.</div>
                        )}
                    </div>
                </div>
            )}
    </div>
  );
}

function QuickBookingForm() {
    const { addShipment, calculateRate } = useShipment();
    const [formData, setFormData] = useState({
        sender: { name: '', phone: '', city: '' },
        receiver: { name: '', phone: '', city: '' },
        weight: '',
        type: 'Standard'
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [trackingId, setTrackingId] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cost = calculateRate(formData.weight, formData.type);
        const shipment = await addShipment({
            ...formData,
            cost: cost,
            paymentMode: 'COD'
        });
        setTrackingId(shipment?.trackingNumber || shipment?.trackingId || shipment?.id || `SF-${Date.now()}`);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="p-12 text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 print:hidden">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <div className="print:hidden">
                   <h3 className="text-xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
                   <p className="text-slate-500 mb-6">Label generated and sent to printer.</p>
                </div>
                
                <div id="agent-quick-booking-label" className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md mx-auto relative overflow-hidden group print:shadow-none print:border-2 print:max-w-none print:p-4 print:w-full printable">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600 print:hidden"></div>
                   <div className="hidden print:block text-2xl font-bold mb-4 text-center border-b pb-4">SHIPFAST LOGISTICS</div>
                   <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Tracking ID</p>
                   <div className="text-4xl font-mono font-bold text-slate-900 tracking-widest mb-4 selection:bg-indigo-100">{trackingId}</div>
                   
                   <div className="mb-6 flex justify-center">
                      <BarcodeGenerator value={trackingId} />
                   </div>
                   
                   <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-sm">
                      <div className="text-left">
                         <p className="text-xs text-slate-400 font-semibold uppercase">Amount To Pay</p>
                         <p className="font-bold text-slate-800">₹{calculateRate(formData.weight, formData.type)}</p>
                         <span className="text-[10px] text-slate-500">(Includes COD Fee)</span>
                      </div>
                   </div>
                   
                   <div className="mt-8 pt-6 border-t border-slate-100 text-left text-sm text-slate-600">
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                             <span className="font-bold block mb-1">From:</span>
                             <p>{formData.sender.name}</p>
                             <p>{formData.sender.phone}</p>
                             <p>{formData.sender.city}</p>
                         </div>
                         <div>
                             <span className="font-bold block mb-1">To:</span>
                             <p>{formData.receiver.name}</p>
                             <p>{formData.receiver.phone}</p>
                             <p>{formData.receiver.city}</p>
                         </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                          <p><span className="font-bold">Service:</span> {formData.type}</p>
                          <p><span className="font-bold">Weight:</span> {formData.weight} kg</p>
                          <p><span className="font-bold">Payment Method:</span> COD</p>
                          <p><span className="font-bold">Payment Status:</span> PENDING</p>
                      </div>
                   </div>
                </div>

                <div className="flex justify-center gap-4 mt-8 print:hidden">
                    <button 
                      onClick={() => printElementById('agent-quick-booking-label', 'Quick Booking Label')}
                      className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                   >
                     <Printer className="w-5 h-5" />
                     Print Label
                   </button>
                   <button 
                      onClick={() => setIsSubmitted(false)} 
                      className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
                   >
                     Book Another
                   </button>
                </div>
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
                        <div className="text-2xl font-bold text-slate-900 text-right">₹{calculateRate(formData.weight || 0, formData.type)}</div>
                    </div>
                </div>
            </div>

            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                Confirm Booking & Print Label
            </button>
        </form>
    );
}

function RunSheetView({ todaysDeliveries, currentUser, agentIdentifier, refreshShipments }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [generatedSheet, setGeneratedSheet] = useState(null);

    const toggleSelection = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleAssign = async () => {
        if (selectedIds.length === 0) return toast.error("Select shipments to assign");

        const selectedShipments = todaysDeliveries.filter(s => selectedIds.includes(s.id));

        try {
            const response = await operationsService.createRunSheet({
                agentId: agentIdentifier || currentUser?.userId || currentUser?.id || currentUser?.email || 'AGENT-DEFAULT',
                hubId: 'HUB-DEFAULT',
                shipmentTrackingNumbers: selectedIds
            });

            const sheet = {
                id: response?.runSheetId || `RS-${Date.now()}`,
                date: response?.date ? new Date(response.date).toLocaleDateString() : new Date().toLocaleDateString(),
                items: selectedShipments,
                agent: response?.agentId || (agentIdentifier || currentUser?.name || 'Current Agent')
            };
            setGeneratedSheet(sheet);
            toast.success(`Run Sheet ${sheet.id} Generated`);
            await refreshShipments?.();
        } catch (error) {
            const sheet = {
                id: `RS-${Date.now()}`,
                date: new Date().toLocaleDateString(),
                items: selectedShipments,
                agent: currentUser?.name || 'Current Agent'
            };
            setGeneratedSheet(sheet);
            toast.warning(`Run sheet saved locally (${error.message || 'backend unavailable'})`);
        }
    };
    
    // Filtering for logic demo
    const eligibleForRunSheet = todaysDeliveries.filter(s => ['RECEIVED AT HUB', 'BOOKED', 'OUT FOR DELIVERY'].includes(normalizeStatus(s.status)));

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
                                       {generatedSheet.items.map(s => {
                                           const receiverDetails = getPartyDetails(s, 'receiver');
                                           return (
                                           <tr key={s.id}>
                                               <td className="p-3 border font-mono">{s.id}</td>
                                               <td className="p-3 border">
                                                   <div className="font-bold">{receiverDetails.name}</div>
                                                   <div className="text-slate-500">{receiverDetails.address}{receiverDetails.address && receiverDetails.city ? ', ' : ''}{receiverDetails.city}</div>
                                                   <div className="text-xs text-slate-400">Ph: {receiverDetails.phone}</div>
                                               </td>
                                               <td className="p-3 border">{s.type}</td>
                                               <td className="p-3 border text-right font-mono">
                                                   {isCodPayment(s) ? `₹${s.cost}` : '-'}
                                               </td>
                                               <td className="p-3 border"></td>
                                           </tr>
                                       )})}
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
                        {eligibleForRunSheet.length > 0 ? eligibleForRunSheet.map(s => {
                            const receiverDetails = getPartyDetails(s, 'receiver');
                            return (
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
                                    <div className="text-sm text-slate-500">{receiverDetails.city} • <span className="text-indigo-600">{s.type}</span></div>
                        </div>
                        <div className="text-right text-sm">
                           <div className="font-medium text-slate-900">COD: ₹{s.cost}</div>
                           <div className="text-slate-500">{s.weight} kg</div>
                        </div>
                     </div>
                        )}) : (
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
        .filter(s => normalizeStatus(s.status) === 'DELIVERED')
        .reduce((acc, s) => {
            const mode = isCodPayment(s) ? 'COD' : (s.paymentMode || s.paymentMethod || 'ONLINE');
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
    const [profile, setProfile] = useState(null);
    const [docs, setDocs] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const userKey = currentUser?.userId || currentUser?.id || currentUser?.email || 'default';
    const storageKeys = [`sf_agent_onboarding_${userKey}`, `agent_onboarding_${userKey}`];

    useEffect(() => {
        let cancelled = false;
        const loadProfile = async () => {
            setIsLoading(true);
            try {
                const fetched = await operationsService.getAgentProfile(userKey);
                if (!cancelled) setProfile(fetched || null);
            } catch {
                if (!cancelled) setProfile(null);
            }

            if (!cancelled) {
                let parsedDocs = {};
                for (const key of storageKeys) {
                    try {
                        const raw = localStorage.getItem(key);
                        if (raw) {
                            parsedDocs = JSON.parse(raw) || {};
                            break;
                        }
                    } catch {
                        parsedDocs = {};
                    }
                }
                setDocs(parsedDocs);
                setIsLoading(false);
            }
        };

        loadProfile();
        return () => {
            cancelled = true;
        };
    }, [userKey]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-600">
                Loading profile details...
            </div>
        );
    }

    const displayName = currentUser?.name || currentUser?.fullName || 'Agent';
    const profilePhoto = profile?.profileImage || docs?.profilePhoto || null;
    const averageRating = Number(profile?.averageRating || 0);
    const totalRatings = Number(profile?.totalRatings || 0);
    const joinedOn = profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'N/A';
    const verificationStatus = String(profile?.verificationStatus || 'PENDING').toUpperCase();

    return (
         <div className="animate-fade-in-up space-y-6">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                My Profile & Performance
            </h2>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
                    {profilePhoto ? (
                        <img src={profilePhoto} alt="Agent profile" className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 shadow-sm" />
                    ) : (
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600 border-2 border-indigo-100 shadow-sm">
                            {(displayName || 'A').charAt(0)}
                        </div>
                    )}
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{displayName}</h3>
                        <div className="text-slate-500">Agent | {currentUser?.email || currentUser?.userId || 'N/A'}</div>
                        <div className="flex items-center gap-2 mt-1">
                             <span className={`px-2 py-0.5 rounded text-xs font-bold ${verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' : verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                 {verificationStatus}
                             </span>
                             <span className="text-xs text-slate-400">ID: {profile?.agentId || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider border-b border-slate-100 pb-2">Personal Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-slate-500 mb-1">Email</div>
                                <div className="font-medium">{currentUser?.email || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-slate-500 mb-1">Phone</div>
                                <div className="font-medium">{currentUser?.phone || currentUser?.phoneNumber || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-slate-500 mb-1">Blood Group</div>
                                <div className="font-medium">{profile?.bloodType || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-slate-500 mb-1">Organ Donor</div>
                                <div className="font-medium">{profile?.organDonor ? 'Yes' : 'No'}</div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-slate-500 mb-1">Vehicle Details</div>
                                <div className="font-medium">Vehicle: {profile?.vehicleNumber || 'N/A'} | RC: {profile?.rcBookNumber || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider border-b border-slate-100 pb-2">Work & Performance</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                             <div>
                                <div className="text-slate-500 mb-1">Shift Timing</div>
                                <div className="font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">
                                    {profile?.shiftTiming || 'Flexible'}
                                </div>
                            </div>
                             <div>
                                <div className="text-slate-500 mb-1">Joining Date</div>
                                <div className="font-medium">{joinedOn}</div>
                            </div>
                             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="text-slate-500 mb-1">Customer Rating</div>
                                <div className="font-bold text-lg text-emerald-600 flex items-center gap-1">
                                    {averageRating.toFixed(1)} / 5.0
                                    <span className="text-xs font-normal text-slate-400">({totalRatings} ratings)</span>
                                </div>
                            </div>
                             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="text-slate-500 mb-1">Success Rate</div>
                                <div className="font-bold text-lg text-slate-900">
                                    {Number(profile?.successRate || 0).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200">
                     <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-4">Uploaded Documents</h4>
                     <div className="flex gap-4 flex-wrap">
                         {[
                            { label: 'Profile', key: 'profilePhoto', dbKey: 'profileImage' },
                            { label: 'Aadhaar', key: 'aadharCopy' },
                            { label: 'License', key: 'licenseCopy' },
                            { label: 'RC Book', key: 'rcBookCopy' }
                         ].map((doc) => {
                             const hasDoc = docs?.[doc.key] || (doc.dbKey ? profile?.[doc.dbKey] : null);
                             return (
                                 <div key={doc.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${hasDoc ? 'bg-white border-green-200 text-green-700' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                                     <FileText className="w-4 h-4" />
                                     <span className="text-sm font-medium">{doc.label}</span>
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
