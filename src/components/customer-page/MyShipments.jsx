import React, { useState } from 'react';
import { Package, Calendar, MoreHorizontal, Search, Filter, Ban, ThumbsUp, FileText, ChevronRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShipment } from '../../context/ShipmentContext';
import { RateShipmentModal } from './RateShipmentModal';
import { CancelShipmentModal } from './CancelShipmentModal';
import { toast } from 'sonner';

export function MyShipments() {
  const navigate = useNavigate();
  const { shipments, cancelShipment, deleteShipment } = useShipment();
  const [activeModal, setActiveModal] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [filter, setFilter] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Transit': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Delivered': return 'bg-green-50 text-green-700 border-green-200';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleAction = (type, shipment) => {
    setSelectedShipment(shipment);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedShipment(null);
  };

  const handleCancel = (reason) => {
      cancelShipment(selectedShipment.id, reason);
      toast.success('Shipment request cancelled.');
      closeModal();
  };
  
  const handleDelete = (shipment) => {
      if(confirm('Are you sure you want to delete this shipment from your history?')) {
          deleteShipment(shipment.id);
          toast.success('Shipment removed from history.');
      }
  };

  const handleRate = (rating) => {
      toast.success(`Thank you! You rated shipment ${selectedShipment.id} with ${rating} stars.`);
      closeModal();
  };

  const handleTrack = (id) => {
    navigate(`/track?id=${id}`);
  };

  const filteredShipments = shipments.filter(s => 
      (s.id && s.id.toLowerCase().includes(filter.toLowerCase())) || 
      (s.receiver?.city && s.receiver.city.toLowerCase().includes(filter.toLowerCase())) ||
      (s.sender?.city && s.sender.city.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Shipment History</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search shipments..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tracking ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleTrack(shipment.id)}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-purple-600 group-hover:text-purple-700 transition-colors underline decoration-purple-200 underline-offset-2">{shipment.id}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-slate-900">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        {shipment.sender.city}
                      </div>
                      <div className="h-4 border-l border-dashed border-slate-300 ml-1"></div>
                      <div className="flex items-center gap-2 text-sm text-slate-900">
                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                        {shipment.receiver.city}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {shipment.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">
                      <div>{shipment.type}</div>
                      <div className="text-xs text-slate-400">{shipment.weight} kg</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">₹{shipment.cost}</div>
                    <div className="text-xs text-slate-400">Paid</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {shipment.status === 'Delivered' && (
                         <>
                           <button 
                              onClick={() => handleAction('rate', shipment)}
                              className="p-2 text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Rate Shipment"
                            >
                             <ThumbsUp className="w-4 h-4" />
                           </button>
                           <button 
                              onClick={() => navigate(`/dashboard/invoice/${shipment.id}`)}
                              className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="View Invoice"
                           >
                             <FileText className="w-4 h-4" />
                           </button>
                         </>
                       )}
                       {(shipment.status === 'Pending' || shipment.status === 'Booked') && (
                          <button 
                            onClick={() => handleAction('cancel', shipment)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel Shipment"
                          >
                           <Ban className="w-4 h-4" />
                          </button>
                       )}
                       
                       {(shipment.status === 'Cancelled' || shipment.status === 'Delivered') && (
                           <button 
                              onClick={() => handleDelete(shipment)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete from History"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredShipments.length === 0 && (
                  <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                          No shipments found matching your search.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RateShipmentModal 
        isOpen={activeModal === 'rate'}
        onClose={closeModal}
        shipmentId={selectedShipment?.id}
        onSubmit={handleRate}
      />

      <CancelShipmentModal 
        isOpen={activeModal === 'cancel'}
        onClose={closeModal}
        shipmentId={selectedShipment?.id}
        onConfirm={handleCancel}
      />
    </div>
  );
}
