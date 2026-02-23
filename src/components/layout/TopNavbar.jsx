import { Bell } from 'lucide-react';
import { useState } from 'react';
import { useShipment } from '../../context/ShipmentContext';
import { useNavigate } from 'react-router-dom';

import logoImage from '../../assets/logo.png';

export function TopNavbar({ user, isSidebarOpen }) {
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
      {/* Left side - Logo (Only visible when sidebar is closed) */}
      <div 
        onClick={() => navigate('/')} 
        className={`flex items-center gap-3 cursor-pointer group ${isSidebarOpen ? 'hidden' : 'flex'}`}
      >
        <img src={logoImage} alt="ShipFast" className="h-8 w-auto transition-transform group-hover:scale-110 duration-300" />
        <span className="font-heading font-bold text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-500 transition-all duration-300">
          ShipFast
        </span>
      </div>

      {/* Right side - Notifications & Profile */}
       <div className="flex items-center gap-4 ml-auto">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all relative"
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
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 pr-3 rounded-full border border-transparent hover:border-slate-100 transition-all duration-300"
          >
             <div className="text-right hidden sm:block">
               <div className="text-sm font-bold text-slate-900 leading-tight group-hover:text-purple-600 transition-colors">{user?.name}</div>
               <div className="text-xs text-slate-500 font-medium capitalize">{user?.role}</div>
             </div>
             {user?.profilePic ? (
               <img
                 src={user.profilePic}
                 alt={user?.name}
                 className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-md"
               />
             ) : (
               <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm">
                 {user?.name?.charAt(0).toUpperCase()}
               </div>
             )}
          </div>
       </div>
    </header>
  );
}
