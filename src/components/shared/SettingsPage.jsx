import { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, Shield, Camera } from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';

export function SettingsPage() {
  const { currentUser, updateProfile } = useShipment();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    role: currentUser?.role || 'customer'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API Call
    setTimeout(() => {
        updateProfile(formData);
        setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Profile Settings</h1>
           <p className="text-slate-600">Manage your account preferences and personal details</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
         {/* Profile Card */}
         <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center space-y-4">
               <div className="relative inline-block group cursor-pointer">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 mx-auto shadow-lg">
                     <img src={currentUser?.profilePic} alt="Profile" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Camera className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
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
               <div className="p-6 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-900">Personal Information</h3>
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
                              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
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
                           className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
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
                           rows="3"
                           className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                           placeholder="Enter your full address"
                        ></textarea>
                     </div>

                     <div className="pt-4 border-t border-slate-100 flex justify-end">
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
                  </form>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
