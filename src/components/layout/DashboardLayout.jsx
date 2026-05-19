import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export function DashboardLayout({ user, onLogout, sidebarItems }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="print:hidden">
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          sidebarItems={sidebarItems} 
          onLogout={onLogout} 
        />
      </div>

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64 print:ml-0' : 'ml-20 print:ml-0'}`}>
        <div className="print:hidden">
          <TopNavbar user={user} isSidebarOpen={isSidebarOpen} />
        </div>

        <div className="p-8 max-w-7xl mx-auto print:p-0 print:max-w-none">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
