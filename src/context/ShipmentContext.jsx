import React, { createContext, useContext, useState, useEffect } from 'react';

const ShipmentContext = createContext();

export function useShipment() {
  return useContext(ShipmentContext);
}

export function ShipmentProvider({ children }) {
  const [shipments, setShipments] = useState([
    {
      id: 'SF123456789',
      sender: { name: 'Rahul Sharma', phone: '9876543210', city: 'Mumbai' },
      receiver: { name: 'Priya Singh', phone: '9123456780', city: 'Delhi' },
      status: 'In Transit',
      type: 'Standard',
      weight: '2.5',
      cost: '250',
      date: '2025-01-30',
      history: [
        { status: 'Booked', location: 'Mumbai', timestamp: '2025-01-30 09:00 AM' },
        { status: 'Received at Hub', location: 'Mumbai Central', timestamp: '2025-01-30 11:00 AM' },
        { status: 'In Transit', location: 'Mumbai - Delhi Highway', timestamp: '2025-01-30 04:00 PM' }
      ]
    },
    {
      id: 'SF987654321',
      sender: { name: 'Amit Kumar', phone: '8877665544', city: 'Bangalore' },
      receiver: { name: 'Sneha Gupta', phone: '7766554433', city: 'Chennai' },
      status: 'Delivered',
      type: 'Express',
      weight: '1.2',
      cost: '450',
      date: '2025-01-28',
      history: [
        { status: 'Booked', location: 'Bangalore', timestamp: '2025-01-28 10:00 AM' },
        { status: 'Delivered', location: 'Chennai', timestamp: '2025-01-29 02:00 PM' }
      ]
    },
    {
       id: 'SF112233445',
       sender: { name: 'John Doe', phone: '9988776655', city: 'Kolkata' },
       receiver: { name: 'Jane Smith', phone: '1122334455', city: 'Hyderabad' },
       status: 'Pending',
       type: 'Standard',
       weight: '5.0',
       cost: '600',
       date: '2025-01-31',
       history: [
           { status: 'Booked', location: 'Kolkata', timestamp: '2025-01-31 08:30 AM' }
       ]
    }
  ]);

  const [currentUser, setCurrentUser] = useState(null);

  const [users, setUsers] = useState([]); 
  const [branches, setBranches] = useState([
    { id: 1, name: 'Mumbai Central Hub', type: 'Hub', state: 'Maharashtra', status: 'Active', capacity: '85%' },
    { id: 2, name: 'Delhi North Gate', type: 'Branch', state: 'Delhi', status: 'Active', capacity: '60%' },
    { id: 3, name: 'Bangalore Tech Park', type: 'Hub', state: 'Karnataka', status: 'Active', capacity: '92%' },
    { id: 4, name: 'Chennai Port', type: 'Hub', state: 'Tamil Nadu', status: 'Maintenance', capacity: '45%' },
    { id: 5, name: 'Kolkata East', type: 'Branch', state: 'West Bengal', status: 'Active', capacity: '78%' },
  ]);
  const [vehicles, setVehicles] = useState([
      { id: 'MH-01-AB-1234', type: 'Van', driver: 'Rajesh Kumar', status: 'In Transit', location: 'Mumbai' },
      { id: 'MH-02-CD-5678', type: 'Truck', driver: 'N/A', status: 'Available', location: 'Pune' },
      { id: 'DL-01-EF-9012', type: 'Scooter', driver: 'Amit Singh', status: 'Delivering', location: 'Delhi' },
      { id: 'KA-01-GH-3456', type: 'Van', driver: 'Suresh Patil', status: 'In Transit', location: 'Bangalore' },
  ]);
  const [staff, setStaff] = useState([
      { id: 1, name: 'Arun Singh', role: 'Manager', branch: 'Mumbai Central Hub', status: 'Active', phone: '9876543210' },
      { id: 2, name: 'Vijay Kumar', role: 'Driver', branch: 'Delhi North Gate', status: 'Active', phone: '9123456789' },
      { id: 3, name: 'Sita Verma', role: 'Agent', branch: 'Bangalore Tech Park', status: 'Active', phone: '9988776655' },
      { id: 4, name: 'Rohan Gupta', role: 'Sorter', branch: 'Chennai Port', status: 'Leave', phone: '8877665544' },
      { id: 5, name: 'Kavita Mishra', role: 'Manager', branch: 'Kolkata East', status: 'Active', phone: '7766554433' },
  ]);
  const [notifications, setNotifications] = useState([]);

  const deriveUsername = (email) => {
      if (!email) return 'Guest';
      return email.split('@')[0];
  };

  const login = (email, password) => {
    const derivedName = deriveUsername(email);
    let role = 'customer';
    
    if (email.includes('admin') || email === '717823s132@kce.ac.in') {
      role = 'admin';
    } else if (email.includes('agent')) {
      role = 'agent';
    }

    const user = { 
        id: Math.random().toString(36).substr(2, 9),
        name: derivedName, 
        email, 
        role, 
        profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' 
    };
    
    setCurrentUser(user);
    if (!users.find(u => u.email === email)) {
        setUsers(prev => [...prev, user]);
    }
    
    addNotification(`Welcome back, ${derivedName}!`, role);
    return user;
  };

  const register = (userData) => {
    const newUser = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      role: 'customer',
      profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
    };
    setCurrentUser(newUser);
    setUsers(prev => [...prev, newUser]);
    addNotification(`Welcome to NewShipFast, ${newUser.name}!`, 'customer');
    return newUser;
  };

  const addBranch = (branchData) => {
      setBranches(prev => [...prev, { id: Date.now(), ...branchData, status: 'Active', capacity: '0%' }]);
      addNotification(`New Branch "${branchData.name}" added successfully.`, 'admin');
  };

  const addVehicle = (vehicleData) => {
      setVehicles(prev => [...prev, { id: vehicleData.number, ...vehicleData, status: 'Available' }]);
      addNotification(`Vehicle ${vehicleData.number} added to fleet.`, 'admin');
  };

  const updateBranch = (updatedBranch) => {
      setBranches(prev => prev.map(b => b.id === updatedBranch.id ? updatedBranch : b));
      addNotification(`Branch "${updatedBranch.name}" updated successfully.`, 'admin');
  };

  const updateVehicle = (updatedVehicle) => {
      setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
      addNotification(`Vehicle ${updatedVehicle.number || updatedVehicle.id} updated successfully.`, 'admin');
  };

  const updateStaff = (updatedStaff) => {
      setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
      addNotification(`Staff member "${updatedStaff.name}" updated successfully.`, 'admin');
  };
  
  const updateProfile = (updatedData) => {
      setCurrentUser(prev => ({ ...prev, ...updatedData }));
      setUsers(prev => prev.map(u => u.email === currentUser.email ? { ...u, ...updatedData } : u));
      addNotification('Profile updated successfully.', currentUser.role);
  };

  const logout = () => {
      setCurrentUser(null);
  };

  const addShipment = (shipment) => {
      const newShipment = {
        ...shipment,
        id: 'SF' + Math.floor(100000000 + Math.random() * 900000000).toString(),
        date: new Date().toISOString().split('T')[0],
        status: 'Booked',
        paymentStatus: 'Pending',
        paymentMode: shipment.paymentMode || 'Cash',
        assignedTo: null, 
        history: [
          { status: 'Booked', location: shipment.sender.city, timestamp: new Date().toLocaleString() }
        ]
      };
      setShipments(prev => [newShipment, ...prev]);
      return newShipment;
  };

  const updateShipmentStatus = (id, status) => {
      setShipments(prev => prev.map(s => s.id === id ? { ...s, status, history: [...s.history, { status, location: 'Updated', timestamp: new Date().toLocaleString() }] } : s));
  };

  const cancelShipment = (id) => {
      updateShipmentStatus(id, 'Cancelled');
  };

  const getShipment = (id) => {
      return shipments.find(s => s.id === id);
  };

  const addNotification = (message, role) => {
      setNotifications(prev => [{ id: Date.now(), message, role, timestamp: new Date().toLocaleTimeString() }, ...prev]);
  };

  const getRoleNotifications = (role) => {
      return notifications.filter(n => n.role === role || n.role === 'all');
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
      login,
      logout,
      register,
      addShipment,
      updateShipmentStatus,
      cancelShipment,
      getShipment,
      addBranch,
      addVehicle,
      addVehicle,
      updateBranch,
      updateVehicle,
      updateStaff,
      updateProfile,
      getRoleNotifications
    }}>
      {children}
    </ShipmentContext.Provider>
  );
}
