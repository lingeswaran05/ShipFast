import { Routes, Route } from "react-router-dom";
import CreateAccount from "./pages/CreateAccount";
import NewBooking from "./pages/NewBooking";
import AgentDashboard from "./pages/AgentDashboard";
import Pricing from "./pages/Pricing";
import CustomerDashboard from "./customer/Customer";
import QuickBook from "./pages/QuickBook"
import ScanParcels from "./pages/Scanparcels";
import Fleet from "./pages/Fleet";
import CashCollection from "./pages/CashCollection";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HeroBottom from "./components/HeroBottom";
import Features from "./components/Features";
import Stats from "./components/Stats";
import BranchesHubs from "./pages/BranchesHubs";
import RunSheets from "./pages/RunSheets";
import FinalCTA from "./components/FinalCTA";
import Staff from "./pages/Staff";
import Performance from "./pages/Performance";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import TrackShipment from "./pages/TrackShipment";
import Home1 from './home/Home'
export default function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
            <Navbar />

               <Hero />
              <HeroBottom />
              <Features />
              <Stats />
              <FinalCTA />
              <Footer />
            </>
          }
        />

      <Route path="/login" element={<Login />} />
      <Route path="/shipment" element={<TrackShipment />} />
      <Route path="/customer/*" element={<CustomerDashboard />} />
      <Route path="/agent" element={<AgentDashboard />} />
      <Route path="/quick-book" element={<QuickBook/>} />
      <Route path="/scan-parcels" element={<ScanParcels/>} />
      <Route path="/run-sheets" element={<RunSheets />} />
      <Route path="/cash-collection" element={<CashCollection />} />
      <Route path="/fleet" element={<Fleet />} />
      <Route path="/staff" element={<Staff />} />
      <Route path="/performance" element={<Performance />} />
      <Route path="/branches-hubs" element ={<BranchesHubs /> } />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/customer/new-booking" element={<NewBooking />} />
      <Route path="/create-account" element={<CreateAccount />} />
      </Routes>
    </>
  );
}
