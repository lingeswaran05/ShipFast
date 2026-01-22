import { Routes, Route } from "react-router-dom";
import CreateAccount from "./pages/CreateAccount";
import CustomerDashboard from "./pages/CustomerDashboard";
import NewBooking from "./pages/NewBooking";
import AgentDashboard from "./pages/AgentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HeroBottom from "./components/HeroBottom";
import Features from "./components/Features";
import Stats from "./components/Stats";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import TrackShipment from "./pages/TrackShipment";
import Home1 from './home/Home'
export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            <> 
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
      <Route path="/customer" element={<CustomerDashboard />} />
      <Route path="/agent" element={<AgentDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/customer/new-booking" element={<NewBooking />} />
      <Route path="/create-account" element={<CreateAccount />} />
      </Routes>
    </>
  );
}
