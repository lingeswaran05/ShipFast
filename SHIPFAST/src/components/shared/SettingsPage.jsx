import { useState, useRef, useCallback, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, Shield, Camera, X, Edit2, Upload, Trash2 } from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';
import Webcam from 'react-webcam';
import { toast } from 'sonner';
import { operationsService } from '../../lib/operationsService';

export function SettingsPage() {
   const { currentUser, shipments, updateProfile, requestRoleUpgrade, roleRequests } = useShipment();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
   const [requestedRole, setRequestedRole] = useState('agent');
   const [requestReason, setRequestReason] = useState('');
   const [isRequestingRole, setIsRequestingRole] = useState(false);
  const [agentProfile, setAgentProfile] = useState({
    licenseNumber: '',
    vehicleNumber: '',
    rcBookNumber: '',
    bloodType: '',
    organDonor: false
  });
  const [agentInsights, setAgentInsights] = useState({
    agentId: '',
    availabilityStatus: 'AVAILABLE',
    deliveredCount: 0,
    failedCount: 0,
    inTransitCount: 0,
    averageRating: 0,
    totalRatings: 0,
    successRate: 0
  });
  const [agentDocs, setAgentDocs] = useState({});
  
  // Profile Picture State
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    role: currentUser?.role || 'customer'
  });

  useEffect(() => {
    if (currentUser?.role !== 'agent') return;
    const userId = currentUser?.userId || currentUser?.id || currentUser?.email;
    operationsService.getAgentProfile(userId).then((profile) => {
      if (!profile) return;
      setAgentProfile({
        licenseNumber: profile.licenseNumber || '',
        vehicleNumber: profile.vehicleNumber || '',
        rcBookNumber: profile.rcBookNumber || '',
        bloodType: profile.bloodType || '',
        organDonor: Boolean(profile.organDonor)
      });
      setAgentInsights({
        agentId: profile.agentId || '',
        availabilityStatus: String(profile.availabilityStatus || 'AVAILABLE').toUpperCase(),
        deliveredCount: Number(profile.deliveredCount || 0),
        failedCount: Number(profile.failedCount || 0),
        inTransitCount: Number(profile.inTransitCount || 0),
        averageRating: Number(profile.averageRating || 0),
        totalRatings: Number(profile.totalRatings || 0),
        successRate: Number(profile.successRate || 0)
      });
    });
  }, [currentUser?.role, currentUser?.userId, currentUser?.id, currentUser?.email]);

  useEffect(() => {
    if (currentUser?.role !== 'agent') return;
    const userKey = currentUser?.userId || currentUser?.id || currentUser?.email || 'default';
    const possibleKeys = [`sf_agent_onboarding_${userKey}`, `agent_onboarding_${userKey}`];
    let docs = {};
    for (const key of possibleKeys) {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || '{}');
        if (parsed && Object.keys(parsed).length > 0) {
          docs = parsed;
          break;
        }
      } catch {
        docs = {};
      }
    }
    setAgentDocs(docs);
  }, [currentUser?.role, currentUser?.userId, currentUser?.id, currentUser?.email]);

  useEffect(() => {
    if (currentUser?.role !== 'agent') return;
    const normalize = (value) => String(value || '').toUpperCase().replace(/_/g, ' ');
    const identityValues = new Set([
      currentUser?.userId,
      currentUser?.id,
      currentUser?.email,
      agentInsights.agentId
    ].filter(Boolean).map((value) => String(value).toLowerCase()));

    const myShipments = (shipments || []).filter((shipment) => {
      const candidates = [
        shipment.assignedAgentId,
        shipment.assignedToAgentId,
        shipment.deliveredByAgentId,
        shipment.agentId
      ].filter(Boolean).map((value) => String(value).toLowerCase());
      return candidates.some((candidate) => identityValues.has(candidate));
    });

    const deliveredCount = myShipments.filter((shipment) => normalize(shipment.status) === 'DELIVERED').length;
    const failedCount = myShipments.filter((shipment) => ['FAILED', 'FAILED ATTEMPT', 'CANCELLED'].includes(normalize(shipment.status))).length;
    const inTransitCount = myShipments.filter((shipment) => ['IN TRANSIT', 'OUT FOR DELIVERY'].includes(normalize(shipment.status))).length;
    const totalClosed = deliveredCount + failedCount;
    const successRate = totalClosed > 0 ? (deliveredCount / totalClosed) * 100 : 0;

    setAgentInsights((prev) => ({
      ...prev,
      deliveredCount: Math.max(prev.deliveredCount || 0, deliveredCount),
      failedCount: Math.max(prev.failedCount || 0, failedCount),
      inTransitCount: Math.max(prev.inTransitCount || 0, inTransitCount),
      successRate: prev.successRate > 0 ? prev.successRate : successRate
    }));
  }, [currentUser?.role, currentUser?.userId, currentUser?.id, currentUser?.email, agentInsights.agentId, shipments]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Cancelled
      setFormData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        address: currentUser?.address || '',
        role: currentUser?.role || 'customer'
      });
    }
    setIsEditing(!isEditing);
  };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

      try {
         await updateProfile({
            name: formData.name,
            phone: formData.phone,
            address: formData.address
         });
         if (currentUser?.role === 'agent') {
           const userId = currentUser?.userId || currentUser?.id || currentUser?.email;
           await operationsService.upsertAgentProfile(userId, {
             ...agentProfile,
             availabilityStatus: agentInsights.availabilityStatus,
             deliveredCount: agentInsights.deliveredCount,
             failedCount: agentInsights.failedCount,
             inTransitCount: agentInsights.inTransitCount
           });
         }
         setIsEditing(false);
         toast.success("Details updated successfully");
      } catch (error) {
         toast.error(error.message || 'Failed to update profile');
      } finally {
         setIsLoading(false);
      }
  };

  // Profile Picture Handlers
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ profilePic: reader.result });
        toast.success("Profile photo updated");
        setShowPhotoOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    updateProfile({ profilePic: imageSrc });
    toast.success("Profile photo updated");
    setShowWebcam(false);
    setShowPhotoOptions(false);
  }, [webcamRef]);

  const removePhoto = () => {
    updateProfile({ profilePic: null });
    toast.success("Profile photo removed");
    setShowPhotoOptions(false);
  };

   const myPendingRoleRequest = roleRequests.find(
      request => request.email === currentUser?.email && request.status === 'PENDING'
   );

   const handleRoleRequest = async () => {
      setIsRequestingRole(true);
      try {
         await requestRoleUpgrade(requestedRole, requestReason);
         toast.success('Agent role request submitted to admin');
         setRequestReason('');
      } catch (error) {
         toast.error(error.message || 'Failed to submit request');
      } finally {
         setIsRequestingRole(false);
      }
   };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up pb-10">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Profile Settings</h1>
           <p className="text-slate-600">Manage your account preferences and personal details</p>
        </div>
        <button 
          onClick={toggleEdit}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${isEditing ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'}`}
        >
          {isEditing ? <><X className="w-4 h-4" /> Cancel</> : <><Edit2 className="w-4 h-4" /> Edit Profile</>}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
         {/* Profile Card */}
         <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center space-y-4 relative">
               <div className="relative inline-block group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 mx-auto shadow-lg bg-slate-100 flex items-center justify-center">
                     {currentUser?.profilePic ? (
                       <img src={currentUser.profilePic} alt="Profile" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                     ) : (
                       <span className="text-4xl font-bold text-slate-400">{currentUser?.name?.charAt(0).toUpperCase()}</span>
                     )}
                  </div>
                  
                  {/* Edit Overlay */}
                  <button 
                    onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                    className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md hover:bg-slate-50 border border-slate-100 transition-transform hover:scale-105"
                  >
                     <Camera className="w-5 h-5 text-indigo-600" />
                  </button>

                  {/* Photo Options Menu */}
                  {showPhotoOptions && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
                      <button onClick={() => setShowWebcam(true)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors">
                        <Camera className="w-4 h-4" /> Take Photo
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors">
                        <Upload className="w-4 h-4" /> Upload from Gallery
                      </button>
                      <button onClick={removePhoto} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 text-red-600 text-sm font-medium transition-colors border-t border-slate-50">
                        <Trash2 className="w-4 h-4" /> Remove Photo
                      </button>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
               </div>

               <div>
                  <h3 className="font-bold text-lg text-slate-900">{currentUser?.name}</h3>
                  <p className="text-slate-500 text-sm capitalize">{currentUser?.role}</p>
               </div>
               <div className="pt-4 border-t border-slate-100 flex justify-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                     <Shield className="w-3 h-3" />
                     Verified Account
                  </span>
               </div>
            </div>
         </div>

         {/* Edit Form */}
         <div className="md:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">Personal Information</h3>
                  {!isEditing && <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Read Only Mode</span>}
               </div>
               <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" />
                              Full Name
                           </label>
                           <input 
                              type="text" 
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              disabled={!isEditing}
                              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 ${!isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'border-slate-200 bg-white'}`}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Mail className="w-4 h-4 text-slate-400" />
                              Email Address
                           </label>
                           <input 
                              type="email" 
                              name="email"
                              value={formData.email}
                              disabled
                              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed font-medium"
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                           <Phone className="w-4 h-4 text-slate-400" />
                           Phone Number
                        </label>
                        <input 
                           type="tel" 
                           name="phone"
                           value={formData.phone}
                           onChange={handleChange}
                           disabled={!isEditing}
                           className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 ${!isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'border-slate-200 bg-white'}`}
                           placeholder="+91"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                           <MapPin className="w-4 h-4 text-slate-400" />
                           Address
                        </label>
                        <textarea 
                           name="address"
                           value={formData.address}
                           onChange={handleChange}
                           disabled={!isEditing}
                           rows="3"
                           className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 ${!isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'border-slate-200 bg-white'}`}
                           placeholder="Enter your full address"
                        ></textarea>
                     </div>

                     {isEditing && (
                       <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                          <button 
                             type="button"
                             onClick={toggleEdit}
                             className="px-6 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                             Cancel
                          </button>
                          <button 
                             type="submit"
                             disabled={isLoading}
                             className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-70"
                          >
                             {isLoading ? (
                                <>
                                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                   Saving...
                                </>
                             ) : (
                                <>
                                   <Save className="w-4 h-4" />
                                   Save Changes
                                </>
                             )}
                          </button>
                       </div>
                     )}
                  </form>
               </div>
            </div>
         </div>
      </div>

      {currentUser?.role === 'agent' && (
        <>
        <div className="grid md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-xs uppercase text-slate-500 font-semibold">Agent ID</div>
            <div className="text-lg font-bold text-slate-900 mt-1">{agentInsights.agentId || 'N/A'}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-xs uppercase text-slate-500 font-semibold">Availability</div>
            <div className="text-lg font-bold text-indigo-600 mt-1">{String(agentInsights.availabilityStatus || 'AVAILABLE').replace(/_/g, ' ')}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-xs uppercase text-slate-500 font-semibold">Rating</div>
            <div className="text-lg font-bold text-emerald-600 mt-1">{agentInsights.averageRating.toFixed(1)} / 5.0</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-xs uppercase text-slate-500 font-semibold">Delivered / Failed</div>
            <div className="text-lg font-bold text-slate-900 mt-1">{agentInsights.deliveredCount} / {agentInsights.failedCount}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-xs uppercase text-slate-500 font-semibold">In Transit</div>
            <div className="text-lg font-bold text-amber-600 mt-1">{agentInsights.inTransitCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-900">Agent Verification Details</h3>
            <p className="text-sm text-slate-500 mt-1">License and medical details used for dispatch operations.</p>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">License Number</label>
              <input
                value={agentProfile.licenseNumber}
                onChange={(e) => setAgentProfile(prev => ({ ...prev, licenseNumber: e.target.value }))}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Vehicle Number</label>
              <input
                value={agentProfile.vehicleNumber}
                onChange={(e) => setAgentProfile(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">RC Book Number</label>
              <input
                value={agentProfile.rcBookNumber}
                onChange={(e) => setAgentProfile(prev => ({ ...prev, rcBookNumber: e.target.value }))}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Blood Type</label>
              <select
                value={agentProfile.bloodType}
                onChange={(e) => setAgentProfile(prev => ({ ...prev, bloodType: e.target.value }))}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
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
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Willing to Donate Organs</label>
              <select
                value={agentProfile.organDonor ? 'yes' : 'no'}
                onChange={(e) => setAgentProfile(prev => ({ ...prev, organDonor: e.target.value === 'yes' }))}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900">Uploaded Verification Documents</h3>
              <p className="text-sm text-slate-500 mt-1">Stored in browser local storage for admin verification.</p>
            </div>
            <div className="p-6 grid md:grid-cols-4 gap-4">
              {[
                { label: 'Profile', key: 'profilePhoto' },
                { label: 'Aadhaar', key: 'aadharCopy' },
                { label: 'License', key: 'licenseCopy' },
                { label: 'RC Book', key: 'rcBookCopy' }
              ].map((doc) => (
                <div key={doc.key} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-600 border-b border-slate-200">{doc.label}</div>
                  {agentDocs?.[doc.key] ? (
                    <img src={agentDocs[doc.key]} alt={doc.label} className="w-full h-28 object-cover" />
                  ) : (
                    <div className="h-28 flex items-center justify-center text-xs text-slate-400">Not uploaded</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

         {currentUser?.role === 'customer' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-900">Request Agent Access</h3>
                  <p className="text-sm text-slate-500 mt-1">Request admin approval to work as an agent (driver/manager).</p>
               </div>
               <div className="p-6 space-y-4">
                  {myPendingRoleRequest ? (
                     <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm">
                        Your request is pending admin approval.
                     </div>
                  ) : (
                     <>
                        <div className="grid md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">Requested Role</label>
                              <select
                                 value={requestedRole}
                                 onChange={(e) => setRequestedRole(e.target.value)}
                                 className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                 <option value="agent">Agent</option>
                                 <option value="driver">Driver</option>
                                 <option value="manager">Manager</option>
                              </select>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-700">Reason (Optional)</label>
                           <textarea
                              rows="3"
                              value={requestReason}
                              onChange={(e) => setRequestReason(e.target.value)}
                              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Tell admin why you are requesting agent access"
                           />
                        </div>

                        <button
                           type="button"
                           onClick={handleRoleRequest}
                           disabled={isRequestingRole}
                           className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-70"
                        >
                           {isRequestingRole ? 'Submitting...' : 'Request Agent Access'}
                        </button>
                     </>
                  )}
               </div>
            </div>
         )}

      {/* Webcam Modal */}
      {showWebcam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800">Take Photo</h3>
                 <button onClick={() => setShowWebcam(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <div className="relative bg-black aspect-square">
                 <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                    videoConstraints={{ facingMode: "user" }}
                 />
              </div>
              <div className="p-4 flex justify-center bg-slate-50">
                 <button 
                   onClick={capturePhoto}
                   className="w-16 h-16 rounded-full border-4 border-indigo-600 bg-white flex items-center justify-center shadow-lg hover:bg-indigo-50 transition-colors"
                 >
                    <div className="w-12 h-12 rounded-full bg-indigo-600"></div>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}


