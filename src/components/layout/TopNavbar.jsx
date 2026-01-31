import { Bell } from 'lucide-react';
import { useState } from 'react';
import { useShipment } from '../../context/ShipmentContext';
import { useNavigate } from 'react-router-dom';

export function TopNavbar({ user }) {
  const { getRoleNotifications } = useShipment();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = getRoleNotifications(user?.role);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (user?.role === 'admin') navigate('/admin/settings');
    else if (user?.role === 'agent') navigate('/agent/settings');
    else navigate('/dashboard/settings');
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between">
       <div className="text-sm font-medium text-slate-500">
         {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
       </div>
       <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
            </button>
            
            {showNotifications && (
               <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in-up z-50">
                  <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-slate-700">Notifications</div>
                  <div className="max-h-64 overflow-y-auto">
                     {notifications.length > 0 ? notifications.map(n => (
                        <div key={n.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                           <p className="text-sm text-slate-800">{n.message}</p>
                           <span className="text-xs text-slate-400 mt-1 block">{n.timestamp}</span>
                        </div>
                     )) : (
                        <div className="p-8 text-center text-slate-500 text-sm">No new notifications</div>
                     )}
                  </div>
               </div>
            )}
          </div>

          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          <div 
            onClick={handleProfileClick}
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors"
          >
             <div className="text-right hidden sm:block">
               <div className="text-sm font-bold text-slate-900 leading-tight">{user?.name}</div>
               <div className="text-xs text-purple-600 font-medium capitalize">{user?.role}</div>
             </div>
             <img
               src={user?.profilePic || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
               alt={user?.name}
               className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 shadow-sm"
             />
          </div>
       </div>
    </header>
  );
}
