import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ShipmentProvider, useShipment } from './context/ShipmentContext';
import { ContactPage } from './components/customer-page/ContactPage';
import { Homepage } from './components/other/Homepage';
import { LoginPage } from './components/other/LoginPage';
import { RegistrationPage } from './components/other/RegistrationPage';
import { ForgotPasswordPage } from './components/other/ForgotPasswordPage';
import { TrackingPortal } from './components/other/TrackingPortal';
import { PlaceholderPage } from './components/shared/PlaceholderPage';

import { DashboardLayout } from './components/layout/DashboardLayout';

import { CustomerDashboard } from './components/customer-page/CustomerDashboard';
import { AdminDashboard } from './components/admin-page/AdminDashboard';
import { AgentDashboard } from './components/agent-page/AgentDashboard';

import { BookingForm } from './components/customer-page/BookingForm';
import { MyShipments } from './components/customer-page/MyShipments';
import { Payments } from './components/customer-page/Payments';
import { InvoicePage } from './components/customer-page/InvoicePage';
import { SupportPage } from './components/customer-page/SupportPage';
import { SettingsPage } from './components/shared/SettingsPage';

import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Users, 
  Truck, 
  DollarSign, 
  Building2, 
  TrendingUp,
  Package,
  PlusCircle,
  CreditCard,
  Scan,
  FileText,
  Printer,
  LifeBuoy
} from 'lucide-react';

function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, isLoading } = useShipment();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && currentUser.role !== allowedRole) {
    if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;
    if (currentUser.role === 'agent') return <Navigate to="/agent" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  const { currentUser, logout } = useShipment();

  const customerSidebar = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/book', label: 'Book Shipment', icon: PlusCircle },
    { path: '/dashboard/shipments', label: 'My Shipments', icon: Package },
    { path: '/dashboard/payments', label: 'Payments', icon: CreditCard },
    { path: '/dashboard/support', label: 'Support', icon: LifeBuoy },
  ];

  const adminSidebar = [
    { path: '/admin', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/branches', label: 'Branches', icon: Building2 },
    { path: '/admin/fleet', label: 'Fleet', icon: Truck },
    { path: '/admin/staff', label: 'Staff', icon: Users },
    { path: '/admin/pricing', label: 'Pricing', icon: DollarSign },
    { path: '/admin/performance', label: 'Analytics', icon: TrendingUp },
  ];

  const agentSidebar = [
    { path: '/agent', label: 'Overview', icon: LayoutDashboard },
    { path: '/agent/quick-book', label: 'Quick Book', icon: Package },
    { path: '/agent/scan', label: 'Scan Parcels', icon: Scan },
    { path: '/agent/runsheets', label: 'Run Sheets', icon: FileText },
    { path: '/agent/cash', label: 'Cash Collection', icon: DollarSign },
  ];

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/track" element={<TrackingPortal />} />
      
      {/* Placeholder Routes */}
      <Route path="/privacy" element={<PlaceholderPage />} />
      <Route path="/terms" element={<PlaceholderPage />} />
      <Route path="/contact" element={<ContactPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute allowedRole="customer">
          <DashboardLayout user={currentUser} onLogout={logout} sidebarItems={customerSidebar} />
        </ProtectedRoute>
      }>
        <Route index element={<CustomerDashboard />} />
        <Route path="book" element={<BookingForm />} />
        <Route path="shipments" element={<MyShipments />} />
        <Route path="payments" element={<Payments />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="invoice/:id" element={<InvoicePage />} />
      </Route>

      <Route path="/admin" element={
        <ProtectedRoute allowedRole="admin">
          <DashboardLayout user={currentUser} onLogout={logout} sidebarItems={adminSidebar} />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard view="overview" />} />
        <Route path="branches" element={<AdminDashboard view="branches" />} />
        <Route path="fleet" element={<AdminDashboard view="fleet" />} />
        <Route path="staff" element={<AdminDashboard view="staff" />} />
        <Route path="pricing" element={<AdminDashboard view="pricing" />} />
        <Route path="performance" element={<AdminDashboard view="performance" />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/agent" element={
        <ProtectedRoute allowedRole="agent">
          <DashboardLayout user={currentUser} onLogout={logout} sidebarItems={agentSidebar} />
        </ProtectedRoute>
      }>
        <Route index element={<AgentDashboard view="overview" />} />
        <Route path="quick-book" element={<AgentDashboard view="quick-book" />} />
        <Route path="scan" element={<AgentDashboard view="scan" />} />
        <Route path="runsheets" element={<AgentDashboard view="runsheets" />} />
        <Route path="cash" element={<AgentDashboard view="cash" />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ShipmentProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ShipmentProvider>
  );
}

export default App;
