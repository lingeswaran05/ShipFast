import { useState } from 'react';
import { Building2, Briefcase, MapPin, DollarSign, Truck, TrendingUp, Users, Package, Activity, X, Plus, Edit, FileText, Upload, Download, Eye, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useShipment } from '../../context/ShipmentContext';
import { SectionDownloader } from '../shared/SectionDownloader';

export function AdminDashboard({ view }) {
  
  const { shipments, branches: contextBranches, vehicles: contextVehicles, staff: contextStaff, addBranch, addVehicle, updateBranch, updateVehicle, updateStaff } = useShipment();
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  
  const [newBranch, setNewBranch] = useState({ name: '', type: 'Branch', state: '' });
  const [newVehicle, setNewVehicle] = useState({ number: '', type: 'Van', driver: 'N/A' });
  const [newStaff, setNewStaff] = useState({ name: '', role: 'Agent', branch: '', status: 'Active' });
  const [isEditing, setIsEditing] = useState(false);

  const activeShipmentsCount = shipments.filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled').length;
  const totalRevenue = shipments.reduce((acc, s) => acc + (parseFloat(s.cost) || 0), 0);
  
  const handleBranchSubmit = (e) => {
      e.preventDefault();
      if (isEditing) {
          updateBranch(newBranch);
      } else {
          addBranch(newBranch);
      }
      setNewBranch({ name: '', type: 'Branch', state: '' });
      setIsEditing(false);
      setShowBranchModal(false);
  };

  const handleVehicleSubmit = (e) => {
      e.preventDefault();
      if (isEditing) {
          updateVehicle(newVehicle);
      } else {
          addVehicle(newVehicle);
      }
      setNewVehicle({ number: '', type: 'Van', driver: 'N/A' });
      setIsEditing(false);
      setShowVehicleModal(false);
  };

  const openBranchModal = (branch = null) => {
      if (branch) {
          setNewBranch(branch);
          setIsEditing(true);
      } else {
          setNewBranch({ name: '', type: 'Branch', state: '' });
          setIsEditing(false);
      }
      setShowBranchModal(true);
  };

  const openVehicleModal = (vehicle = null) => {
      if (vehicle) {
          setNewVehicle(vehicle);
          setIsEditing(true);
      } else {
          setNewVehicle({ number: '', type: 'Van', driver: 'N/A' });
          setIsEditing(false);
      }
      setShowVehicleModal(true);
  };
  
  const handleStaffSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
        updateStaff(newStaff);
    } 
    setIsEditing(false);
    setShowStaffModal(false);
  };

  const openStaffModal = (staffMember) => {
      setNewStaff(staffMember);
      setIsEditing(true);
      setShowStaffModal(true);
  };
  
  const revenueData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  const volumeData = [
      { name: 'Mon', volume: 240 },
      { name: 'Tue', volume: 138 },
      { name: 'Wed', volume: 980 },
      { name: 'Thu', volume: 390 },
      { name: 'Fri', volume: 480 },
      { name: 'Sat', volume: 380 },
      { name: 'Sun', volume: 430 },
  ];



  return (
      <div className="space-y-6 animate-fade-in-up relative">
        {showBranchModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-slate-900">{isEditing ? 'Edit Branch' : 'Add New Branch'}</h3>
                        <button onClick={() => setShowBranchModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
                    </div>
                    <form onSubmit={handleBranchSubmit} className="space-y-4">
                        <input className="w-full p-3 border rounded-lg" placeholder="Branch Name" value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} required />
                        <select className="w-full p-3 border rounded-lg" value={newBranch.type} onChange={e => setNewBranch({...newBranch, type: e.target.value})}>
                            <option>Branch</option>
                            <option>Hub</option>
                        </select>
                        <input className="w-full p-3 border rounded-lg" placeholder="State/City" value={newBranch.state} onChange={e => setNewBranch({...newBranch, state: e.target.value})} required />
                        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">{isEditing ? 'Save Changes' : 'Add Branch'}</button>
                    </form>
                </div>
            </div>
        )}

        {showVehicleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-slate-900">{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                        <button onClick={() => setShowVehicleModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
                    </div>
                    <form onSubmit={handleVehicleSubmit} className="space-y-4">
                        <input className="w-full p-3 border rounded-lg" placeholder="Vehicle Number (e.g. MH-04-AB-1234)" value={newVehicle.number} onChange={e => setNewVehicle({...newVehicle, number: e.target.value})} required />
                        <select className="w-full p-3 border rounded-lg" value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}>
                            <option>Van</option>
                            <option>Truck</option>
                            <option>Scooter</option>
                        </select>
                        {isEditing && (
                            <select className="w-full p-3 border rounded-lg" value={newVehicle.status} onChange={e => setNewVehicle({...newVehicle, status: e.target.value})}>
                                <option>Available</option>
                                <option>In Transit</option>
                                <option>Delivering</option>
                            </select>
                        )}
                        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">{isEditing ? 'Save Changes' : 'Add Vehicle'}</button>
                    </form>
                </div>
            </div>
        )}

        {showStaffModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">
                            {isEditing ? 'Staff Details & Documents' : 'Add New Staff'}
                        </h3>
                        <button onClick={() => setShowStaffModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
                    </div>

                    <form onSubmit={handleStaffSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Details */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Personal Information
                                </h4>
                                <input className="w-full p-3 border rounded-lg" placeholder="Name" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} required />
                                <input className="w-full p-3 border rounded-lg" type="email" placeholder="Email" value={newStaff.email || ''} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                                <input className="w-full p-3 border rounded-lg" placeholder="Phone" value={newStaff.phone || ''} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input className="w-full p-3 border rounded-lg" type="date" placeholder="DOB" value={newStaff.personalDetails?.dob || ''} onChange={e => setNewStaff({...newStaff, personalDetails: {...newStaff.personalDetails, dob: e.target.value}})} />
                                    <input className="w-full p-3 border rounded-lg" placeholder="Blood Group" value={newStaff.personalDetails?.bloodGroup || ''} onChange={e => setNewStaff({...newStaff, personalDetails: {...newStaff.personalDetails, bloodGroup: e.target.value}})} />
                                </div>
                                <textarea className="w-full p-3 border rounded-lg" placeholder="Address" rows="2" value={newStaff.personalDetails?.address || ''} onChange={e => setNewStaff({...newStaff, personalDetails: {...newStaff.personalDetails, address: e.target.value}})}></textarea>
                            </div>

                            {/* Job & Documents */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> Job Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <select className="w-full p-3 border rounded-lg" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}>
                                        <option>Manager</option>
                                        <option>Driver</option>
                                        <option>Agent</option>
                                        <option>Sorter</option>
                                    </select>
                                    <select className="w-full p-3 border rounded-lg" value={newStaff.status} onChange={e => setNewStaff({...newStaff, status: e.target.value})}>
                                        <option>Active</option>
                                        <option>Leave</option>
                                        <option>Inactive</option>
                                    </select>
                                </div>
                                <input className="w-full p-3 border rounded-lg" placeholder="Branch" value={newStaff.branch} onChange={e => setNewStaff({...newStaff, branch: e.target.value})} required />

                                <div className="pt-4 border-t border-slate-100">
                                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Documents
                                    </h4>
                                    <div className="space-y-3">
                                        {['Aadhar Card', 'Driving License', 'PAN Card'].map((doc) => {
                                            const docKey = doc.toLowerCase().split(' ')[0]; // aadhar, license, pan
                                            const isUploaded = newStaff.documents?.[docKey];
                                            const fileName = newStaff.documents?.[`${docKey}File`];

                                            return (
                                                <div key={doc} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-full ${isUploaded ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900">{doc}</div>
                                                            <div className="text-xs text-slate-500">{isUploaded ? fileName || 'Uploaded' : 'Pending'}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {isUploaded ? (
                                                            <button type="button" className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-indigo-600 transition-all" title="View">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button type="button" className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-600 transition-all" title="Upload">
                                                                <Upload className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-slate-100">
                            <button type="button" onClick={() => setShowStaffModal(false)} className="flex-1 py-3 border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                            <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">Save Staff Details</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {view === 'overview' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Network Overview</h1>
              <p className="text-slate-600">System-wide performance and operations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg shadow-indigo-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="opacity-80">Active Shipments</span>
                  <Package className="w-5 h-5 opacity-80" />
                </div>
                <div className="text-3xl font-bold">{activeShipmentsCount}</div>
                <div className="text-indigo-100 text-sm mt-1">+8.2% from last week</div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg shadow-emerald-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="opacity-80">Revenue</span>
                  <DollarSign className="w-5 h-5 opacity-80" />
                </div>


                <div className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                <div className="text-emerald-100 text-sm mt-1">Total Lifetime</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg shadow-orange-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="opacity-80">Active Branches</span>
                  <Building2 className="w-5 h-5 opacity-80" />
                </div>
                <div className="text-3xl font-bold">{contextBranches?.length || 0}</div>
                <div className="text-orange-100 text-sm mt-1">Across 12 states</div>
              </div>

              <div className="bg-gradient-to-br from-violet-500 to-violet-600 text-white p-6 rounded-xl shadow-lg shadow-violet-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="opacity-80">Fleet Vehicles</span>
                  <Truck className="w-5 h-5 opacity-80" />
                </div>
                <div className="text-3xl font-bold">{contextVehicles?.length || 0}</div>
                <div className="text-violet-100 text-sm mt-1">98% operational</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      Weekly Revenue
                  </h3>
                  <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueData}>
                              <defs>
                                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                              <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                              />
                              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      Shipment Volume
                  </h3>
                  <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={volumeData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
               </div>
            </div>

            <SectionDownloader title="Download Analytics Report" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6 mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-600" />
                    Detailed Performance Report
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Metric</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Count/Value</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Growth</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Target</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">Total Revenue</td>
                                <td className="px-6 py-4 text-emerald-600 font-bold">₹{totalRevenue.toLocaleString()}</td>
                                <td className="px-6 py-4 text-green-600">+12.5%</td>
                                <td className="px-6 py-4 text-slate-600">₹{(totalRevenue * 1.2).toLocaleString()}</td>
                                <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">On Track</span></td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">Shipment Volume</td>
                                <td className="px-6 py-4 font-bold">{activeShipmentsCount + 1542}</td>
                                <td className="px-6 py-4 text-green-600">+8.2%</td>
                                <td className="px-6 py-4 text-slate-600">2,000</td>
                                <td className="px-6 py-4"><span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">Exceeding</span></td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">Active Agents</td>
                                <td className="px-6 py-4 font-bold">{contextStaff?.filter(s => s.status === 'Active').length || 0}</td>
                                <td className="px-6 py-4 text-slate-500">0%</td>
                                <td className="px-6 py-4 text-slate-600">50</td>
                                <td className="px-6 py-4"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">Needs Attention</span></td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">Avg. Delivery Time</td>
                                <td className="px-6 py-4 font-bold">2.4 Days</td>
                                <td className="px-6 py-4 text-red-500">-5%</td>
                                <td className="px-6 py-4 text-slate-600">2.0 Days</td>
                                <td className="px-6 py-4"><span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Lagging</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </SectionDownloader>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Top Performing Branches</h2>
              <div className="space-y-3">
                {[
                  { name: 'Mumbai Central', shipments: 2456, revenue: '₹2.4L', growth: '+12%' },
                  { name: 'Delhi Hub', shipments: 2134, revenue: '₹2.1L', growth: '+8%' },
                  { name: 'Bangalore Tech Park', shipments: 1876, revenue: '₹1.9L', growth: '+15%' },
                ].map((branch, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{branch.name}</div>
                        <div className="text-sm text-slate-500">{branch.shipments} shipments</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{branch.revenue}</div>
                      <div className="text-sm text-green-600 font-medium">{branch.growth}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'branches' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Branch & Hub Management</h1>
                <p className="text-slate-600">Manage branch locations and hub hierarchy</p>
              </div>
              <button 
                onClick={() => openBranchModal()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Branch
              </button>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">State</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Capacity</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {contextBranches && contextBranches.map(branch => (
                                <tr key={branch.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{branch.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${branch.type === 'Hub' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {branch.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{branch.state}</td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1 text-sm font-medium ${branch.status === 'Active' ? 'text-green-600' : 'text-amber-600'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${branch.status === 'Active' ? 'bg-green-600' : 'bg-amber-600'}`}></span>
                                            {branch.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-24 bg-slate-100 rounded-full h-1.5">
                                            <div className="bg-indigo-600 h-1.5 rounded-full" style={{width: branch.capacity}}></div>
                                        </div>
                                        <span className="text-xs text-slate-500 mt-1 block">{branch.capacity}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openBranchModal(branch)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center gap-1 justify-end">
                                            <Edit className="w-4 h-4" /> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        )}

        {view === 'pricing' && (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">Pricing Configuration</h1>
                    <p className="text-slate-600">Base rates and zone adjustments</p>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                    Save Changes
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                           <tr>
                              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Weight Slab</th>
                              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Zone A (Metro)</th>
                              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Zone B (Tier 1)</th>
                              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Zone C (Remote)</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { slab: '0 - 500g', zoneA: 40, zoneB: 50, zoneC: 65 },
                            { slab: '500g - 1kg', zoneA: 75, zoneB: 90, zoneC: 110 },
                            { slab: '1kg - 2kg', zoneA: 130, zoneB: 150, zoneC: 180 },
                            { slab: 'Additional 1kg', zoneA: 50, zoneB: 60, zoneC: 80 },
                          ].map((row, index) => (                           <tr key={index} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{row.slab}</td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-1">
                                      <span className="text-slate-400">₹</span>
                                      <input type="number" defaultValue={row.zoneA} className="w-20 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-1">
                                      <span className="text-slate-400">₹</span>
                                      <input type="number" defaultValue={row.zoneB} className="w-20 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-1">
                                      <span className="text-slate-400">₹</span>
                                      <input type="number" defaultValue={row.zoneC} className="w-20 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                                   </div>
                                </td>
                             </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </div>
             </div>
        )}
        
        {view === 'fleet' && (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">Fleet Management</h1>
                    <p className="text-slate-600">Vehicle tracking and driver assignment</p>
                  </div>
                  <button 
                     onClick={() => openVehicleModal()}
                     className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Vehicle
                  </button>
                </div>
                
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-200">
                             <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle Number</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {contextVehicles && contextVehicles.map((vehicle, index) => (
                               <tr key={index} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4 font-medium text-slate-900">{vehicle.id}</td>
                                  <td className="px-6 py-4 text-slate-600">{vehicle.type}</td>
                                  <td className="px-6 py-4">
                                     {vehicle.driver !== 'N/A' ? (
                                        <div className="flex items-center gap-2">
                                           <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                              {vehicle.driver.charAt(0)}
                                           </div>
                                           <span className="text-slate-900">{vehicle.driver}</span>
                                        </div>
                                     ) : (
                                        <button className="text-xs text-indigo-600 font-medium hover:underline">Assign Driver</button>
                                     )}
                                  </td>
                                  <td className="px-6 py-4">
                                     <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                        vehicle.status === 'Available' ? 'bg-green-50 text-green-700' : 
                                        vehicle.status === 'In Transit' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'
                                     }`}>
                                        {vehicle.status}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <button onClick={() => openVehicleModal(vehicle)} className="text-indigo-600 hover:text-indigo-900 transition-colors flex items-center gap-1 justify-end ml-auto">
                                        <Edit className="w-4 h-4" /> Edit
                                     </button>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
             </div>
        )}

        {view === 'staff' && (
             <div className="space-y-6">
                <div>
                   <h1 className="text-2xl font-bold text-slate-800">Staff Directory</h1>
                   <p className="text-slate-600">Manage employee access and roles</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {contextStaff && contextStaff.map(s => (
                      <div key={s.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
                         <div className="flex gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">{s.name.charAt(0)}</div>
                            <div>
                               <div className="font-bold text-slate-900">{s.name}</div>
                               <div className="text-sm text-slate-500">{s.role}</div>
                               <div className="text-xs text-indigo-600 mt-1">{s.branch}</div>
                            </div>
                         </div>
                         <button onClick={() => openStaffModal(s)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium">
                              <Edit className="w-4 h-4" /> Edit
                          </button>
                      </div>
                   ))}
                </div>
             </div>
        )}

        {view === 'performance' && (
             <div className="space-y-6">
                 <div>
                    <h1 className="text-2xl font-bold text-slate-800">Performance Analytics & Reports</h1>
                    <p className="text-slate-600">Deep dive into operational metrics and shipment data</p>
                 </div>

                 <SectionDownloader title="Download Full Report" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 bg-slate-50">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                             <FileText className="w-5 h-5 text-indigo-600" />
                             Master Shipment Report
                        </h3>
                    </div>

                    {/* Service Breakdown Summary */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-100">
                        <div>
                             <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-4">Service Type Breakdown</h4>
                             <table className="w-full text-sm text-left">
                                 <thead className="bg-slate-50 text-slate-500">
                                     <tr>
                                         <th className="px-3 py-2">Service</th>
                                         <th className="px-3 py-2">Volume</th>
                                         <th className="px-3 py-2">Revenue</th>
                                         <th className="px-3 py-2">Avg. Cost</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100">
                                     {['Standard', 'Express'].map(type => {
                                         const typeShipments = shipments.filter(s => s.type === type);
                                         const volume = typeShipments.length;
                                         const revenue = typeShipments.reduce((sum, s) => sum + (parseFloat(s.cost) || 0), 0);
                                         return (
                                             <tr key={type}>
                                                 <td className="px-3 py-2 font-medium">{type}</td>
                                                 <td className="px-3 py-2">{volume}</td>
                                                 <td className="px-3 py-2">₹{revenue.toLocaleString()}</td>
                                                 <td className="px-3 py-2">₹{volume ? Math.round(revenue / volume) : 0}</td>
                                             </tr>
                                         )
                                     })}
                                 </tbody>
                             </table>
                        </div>
                         
                        <div>
                             <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-4">Status Distribution</h4>
                             <div className="space-y-3">
                                 {['Delivered', 'In Transit', 'Pending', 'Booked', 'Cancelled'].map(status => {
                                      const count = shipments.filter(s => s.status === status).length;
                                      const percentage = shipments.length ? Math.round((count / shipments.length) * 100) : 0;
                                      return (
                                          <div key={status}>
                                              <div className="flex justify-between text-sm mb-1">
                                                  <span className="text-slate-600">{status}</span>
                                                  <span className="font-medium">{count} ({percentage}%)</span>
                                              </div>
                                              <div className="w-full bg-slate-100 rounded-full h-2">
                                                  <div 
                                                      className={`h-2 rounded-full ${status === 'Delivered' ? 'bg-green-500' : status === 'In Transit' ? 'bg-indigo-500' : 'bg-slate-400'}`} 
                                                      style={{ width: `${percentage}%` }}
                                                  ></div>
                                              </div>
                                          </div>
                                      )
                                 })}
                             </div>
                        </div>
                    </div>

                    {/* Detailed Master Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Shipment ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Route</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Input</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Service</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {shipments.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-indigo-600">{s.id}</td>
                                        <td className="px-6 py-4 text-slate-600">{s.date}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{s.sender.name}</div>
                                            <div className="text-xs text-slate-500">{s.sender.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-slate-600">
                                                <span>{s.sender.city}</span>
                                                <ChevronRight className="w-3 h-3 text-slate-400" />
                                                <span>{s.receiver.city}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{s.weight} kg</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${s.type === 'Express' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                                                {s.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                             <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                s.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                                s.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                             }`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-800">₹{s.cost}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </SectionDownloader>
             </div>
        )}
      </div>
  );
}
