import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockService } from '../mock/mockService';

const ShipmentContext = createContext();

export function useShipment() {
  return useContext(ShipmentContext);
}

export function ShipmentProvider({ children }) {
  const [shipments, setShipments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Fetch & Auth Persistence
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // data.json persistence
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            // Load shipments for this user
            const userShipments = await mockService.getShipments(user.id);
            setShipments(userShipments);
        }

        const [branchesData, fleetData, staffData] = await Promise.all([
             mockService.getBranches(),
             mockService.getFleet(),
             mockService.getStaff()
        ]);
        
        setBranches(branchesData);
        setVehicles(fleetData);
        setStaff(staffData);
      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const login = async (email, password) => {
    try {
      const user = await mockService.login(email, password);
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      const userShipments = await mockService.getShipments(user.id);
      setShipments(userShipments);
      
      addNotification(`Welcome back, ${user.name}!`, user.role);
      return user;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const register = async (userData) => {
      try {
          const user = await mockService.register(userData);
          setCurrentUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          addNotification(`Welcome to ShipFast, ${user.name}!`, 'customer');
          return user;
      } catch (error) {
          console.error("Registration failed", error);
          throw error;
      }
  };

  const logout = () => {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      setShipments([]);
  };

  const addShipment = async (shipmentData) => {
      try {
        const newShipment = await mockService.createShipment(shipmentData);
        setShipments(prev => [newShipment, ...prev]);
        return newShipment;
      } catch (error) {
          console.error("Create shipment failed", error);
          throw error;
      }
  };

  const updateShipmentStatus = async (id, status) => {
      try {
          const updatedShipment = await mockService.updateShipmentStatus(id, status);
          setShipments(prev => prev.map(s => s.id === id ? updatedShipment : s));
          return updatedShipment;
      } catch (error) {
          console.error("Update status failed", error);
          throw error;
      }
  };

  const deleteShipment = (id) => {
      setShipments(prev => prev.filter(s => s.id !== id));
      addNotification('Shipment deleted.', 'customer');
  };

  const cancelShipment = (id) => {
      updateShipmentStatus(id, 'Cancelled');
  };

  const getShipment = (id) => {
      return shipments.find(s => s.id === id);
  };

  // Helper for admin/agent actions
  const addBranch = (branchData) => {
      const newBranch = { ...branchData, id: Date.now(), status: 'Active', capacity: '0%' };
      setBranches(prev => [...prev, newBranch]);
      addNotification(`Branch "${branchData.name}" added successfully.`, 'admin');
  };
  
  const removeBranch = (branchId) => {
      setBranches(prev => prev.filter(b => b.id !== branchId));
      addNotification('Branch removed successfully.', 'admin');
  };

  const updateBranch = (updatedBranch) => {
      setBranches(prev => prev.map(b => b.id === updatedBranch.id ? updatedBranch : b));
      addNotification(`Branch "${updatedBranch.name}" updated successfully.`, 'admin');
  };

  const addVehicle = (vehicleData) => {
      const newVehicle = { id: vehicleData.number, ...vehicleData, status: 'Available' };
      setVehicles(prev => [...prev, newVehicle]);
      addNotification(`Vehicle ${vehicleData.number} added to fleet.`, 'admin');
  };

  const updateVehicle = (updatedVehicle) => {
      setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
      addNotification(`Vehicle ${updatedVehicle.number || updatedVehicle.id} updated successfully.`, 'admin');
  };

  const addStaff = (staffData) => {
      const newStaff = { ...staffData, id: Date.now(), status: 'Active', performance: { deliveries: 0, rating: 5.0, shift: 'Day' } };
      setStaff(prev => [...prev, newStaff]);
      addNotification(`Staff member "${staffData.name}" added successfully.`, 'admin');
  };

  const removeStaff = (staffId) => {
      setStaff(prev => prev.filter(s => s.id !== staffId));
      addNotification('Staff member removed.', 'admin');
  };

  const updateStaff = (updatedStaff) => {
      setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
      addNotification(`Staff member "${updatedStaff.name}" updated successfully.`, 'admin');
  };
  
  const updateProfile = (updatedData) => {
      setCurrentUser(prev => {
          const newUser = { ...prev, ...updatedData };
          setUsers(currentUsers => currentUsers.map(u => u.id === prev.id ? newUser : u));
          return newUser;
      });
      addNotification('Profile updated successfully.', 'all');
  };

  const addNotification = (message, role) => {
      setNotifications(prev => [{ id: Date.now(), message, role, timestamp: new Date().toLocaleTimeString() }, ...prev]);
  };

  const getRoleNotifications = (role) => {
      return notifications.filter(n => n.role === role || n.role === 'all');
  };
  
  const calculateRate = (weight, serviceType) => {
      const w = parseFloat(weight) || 1;
      const baseRate = serviceType === 'Express' ? 100 : 50;
      return (w * 50) + baseRate;
  };

  const clearAllData = () => {
    setShipments([]);
    setUsers([]);
    setBranches([]);
    setVehicles([]);
    setStaff([]);
    setNotifications([]);
  };

  return (
    <ShipmentContext.Provider value={{
      shipments,
      currentUser,
      users,
      branches,
      vehicles,
      staff,
      notifications,
      isLoading,
      login,
      logout,
      register,
      addShipment,
      updateShipmentStatus,
      deleteShipment,
      cancelShipment,
      getShipment,
      addBranch,
      removeBranch,
      updateBranch,
      addVehicle,
      updateVehicle,
      addStaff,
      removeStaff,
      updateStaff,
      updateProfile,
      getRoleNotifications,
      calculateRate,
      clearAllData
    }}>
      {children}
    </ShipmentContext.Provider>
  );
}
