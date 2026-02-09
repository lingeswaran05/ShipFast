import React, { createContext, useContext, useState, useEffect } from 'react';

const ShipmentContext = createContext();

export function useShipment() {
  return useContext(ShipmentContext);
}

export function ShipmentProvider({ children }) {
  // Helper to load from localStorage or use default
  const loadState = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error(`Error loading ${key} from localStorage`, e);
      return defaultValue;
    }
  };

  // Helper to save to localStorage
  const saveState = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to localStorage`, e);
    }
  };

  const defaultShipments = [
    {
      id: 'SF123456789',
      sender: { name: 'Rahul Sharma', phone: '9876543210', city: 'Mumbai', pincode: '400001' },
      receiver: { name: 'Priya Singh', phone: '9123456780', city: 'Delhi', pincode: '110001' },
      status: 'In Transit',
      type: 'Standard',
      weight: '2.5',
      cost: '250',
      date: new Date().toISOString().split('T')[0],
      paymentMode: 'UPI',
      history: [
        { status: 'Booked', location: 'Mumbai', timestamp: new Date(Date.now() - 7200000).toLocaleString() },
        { status: 'Received at Hub', location: 'Mumbai Central', timestamp: new Date(Date.now() - 3600000).toLocaleString() },
        { status: 'In Transit', location: 'Mumbai - Delhi Highway', timestamp: new Date().toLocaleString() }
      ]
    },
    {
      id: 'SF987654321',
      sender: { name: 'Amit Kumar', phone: '8877665544', city: 'Bangalore', pincode: '560001' },
      receiver: { name: 'Sneha Gupta', phone: '7766554433', city: 'Chennai', pincode: '600001' },
      status: 'Delivered',
      type: 'Express',
      weight: '1.2',
      cost: '450',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      paymentMode: 'Card',
      history: [
        { status: 'Booked', location: 'Bangalore', timestamp: new Date(Date.now() - 90000000).toLocaleString() },
        { status: 'Delivered', location: 'Chennai', timestamp: new Date(Date.now() - 86400000).toLocaleString() }
      ]
    }
  ];

  const defaultBranches = [
    { id: 1, name: 'Mumbai Central Hub', type: 'Hub', state: 'Maharashtra', status: 'Active', capacity: '85%', manager: 'Arun Singh', contact: '022-12345678', staffCount: 15, location: 'Mumbai Central', description: 'Main hub for western region logistics.' },
    { id: 2, name: 'Delhi North Gate', type: 'Branch', state: 'Delhi', status: 'Active', capacity: '60%', manager: 'Vikram Malhotra', contact: '011-87654321', staffCount: 8, location: 'North Delhi', description: 'Handling northern distributions.' },
    { id: 3, name: 'Bangalore Tech Park', type: 'Hub', state: 'Karnataka', status: 'Active', capacity: '92%', manager: 'Sneha Reddy', contact: '080-11223344', staffCount: 20, location: 'Electronic City', description: 'Tech corridor logistics center.' },
    { id: 4, name: 'Chennai Port', type: 'Hub', state: 'Tamil Nadu', status: 'Maintenance', capacity: '45%', manager: 'Karthik Raja', contact: '044-55667788', staffCount: 12, location: 'Chennai Port Trust', description: 'Sea freight handling unit.' },
    { id: 5, name: 'Kolkata East', type: 'Branch', state: 'West Bengal', status: 'Active', capacity: '78%', manager: 'Anjali Das', contact: '033-99887766', staffCount: 6, location: 'Salt Lake', description: 'Eastern zone branch.' },
  ];

  const defaultVehicles = [
    { id: 'MH-01-AB-1234', type: 'Van', driver: 'Rajesh Kumar', status: 'In Transit', location: 'Mumbai', seats: 2, rcBook: 'RC123456', photo: null },
    { id: 'MH-02-CD-5678', type: 'Truck', driver: 'N/A', status: 'Available', location: 'Pune', seats: 3, rcBook: 'RC789012', photo: null },
    { id: 'DL-01-EF-9012', type: 'Scooter', driver: 'Amit Singh', status: 'Delivering', location: 'Delhi', seats: 1, rcBook: 'RC345678', photo: null },
    { id: 'KA-01-GH-3456', type: 'Van', driver: 'Suresh Patil', status: 'In Transit', location: 'Bangalore', seats: 2, rcBook: 'RC901234', photo: null },
  ];

  const defaultStaff = [
      { id: 1, name: 'Arun Singh', role: 'Manager', branch: 'Mumbai Central Hub', status: 'Active', phone: '9876543210', email: 'arun.singh@shipfast.com', performance: { deliveries: 0, rating: 4.8, shift: 'Day' } },
      { id: 2, name: 'Vijay Kumar', role: 'Driver', branch: 'Delhi North Gate', status: 'Active', phone: '9123456789', email: 'vijay.kumar@shipfast.com', performance: { deliveries: 1250, rating: 4.5, shift: 'Night' } },
      { id: 3, name: 'Sita Verma', role: 'Agent', branch: 'Bangalore Tech Park', status: 'Active', phone: '9988776655', email: 'sita.verma@shipfast.com', performance: { deliveries: 3400, rating: 4.9, shift: 'Day' } },
  ];

  const [shipments, setShipments] = useState(() => loadState('shipfast_shipments', defaultShipments));
  const [currentUser, setCurrentUser] = useState(() => loadState('shipfast_currentUser', null));
  const [users, setUsers] = useState(() => loadState('shipfast_users', []));
  const [branches, setBranches] = useState(() => loadState('shipfast_branches', defaultBranches));
  const [vehicles, setVehicles] = useState(() => loadState('shipfast_vehicles', defaultVehicles));
  const [staff, setStaff] = useState(() => loadState('shipfast_staff', defaultStaff));
  const [notifications, setNotifications] = useState(() => loadState('shipfast_notifications', []));

  // Persist effects
  useEffect(() => saveState('shipfast_shipments', shipments), [shipments]);
  useEffect(() => saveState('shipfast_currentUser', currentUser), [currentUser]);
  useEffect(() => saveState('shipfast_users', users), [users]);
  useEffect(() => saveState('shipfast_branches', branches), [branches]);
  useEffect(() => saveState('shipfast_vehicles', vehicles), [vehicles]);
  useEffect(() => saveState('shipfast_staff', staff), [staff]);
  useEffect(() => saveState('shipfast_notifications', notifications), [notifications]);


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

    // Try to find existing user first
    let user = users.find(u => u.email === email);
    
    if (!user) {
        user = { 
            id: Math.random().toString(36).substr(2, 9),
            name: derivedName, 
            email, 
            role, 
            profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' 
        };
        setUsers(prev => [...prev, user]);
    } else {
        // Ensure role is correct if logic changed (optional)
        user = { ...user, role }; 
    }
    
    setCurrentUser(user);
    addNotification(`Welcome back, ${user.name}!`, role);
    return user;
  };

  const register = (userData) => {
    // Check if user already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const newUser = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      role: 'customer',
      profilePic: null // Will trigger fallback
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
  
  const removeBranch = (branchId) => {
      setBranches(prev => prev.filter(b => b.id !== branchId));
      addNotification('Branch removed successfully.', 'admin');
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

  const addStaff = (staffData) => {
      const newStaff = { ...staffData, id: Date.now(), status: 'Active', performance: { deliveries: 0, rating: 5.0, shift: 'Day' } };
      setStaff(prev => [...prev, newStaff]);
      
      // Also add to users list so they can login
      const newUser = {
          id: newStaff.id,
          name: newStaff.name,
          email: newStaff.email,
          role: staffData.role.toLowerCase() === 'manager' ? 'admin' : (staffData.role.toLowerCase() === 'agent' ? 'agent' : 'driver'),
          profilePic: null
      };
      
      // Check if user exists first to avoid duplicates (by email)
      if (!users.find(u => u.email === newUser.email)) {
          setUsers(prev => [...prev, newUser]);
      }
      
      addNotification(`Staff member "${staffData.name}" added successfully.`, 'admin');
  };

  const removeStaff = (staffId) => {
      const staffMember = staff.find(s => s.id === staffId);
      if (staffMember) {
           setStaff(prev => prev.filter(s => s.id !== staffId));
           // Optionally remove from users or disable them
           // setUsers(prev => prev.filter(u => u.email !== staffMember.email)); 
           addNotification(`Staff member "${staffMember.name}" removed.`, 'admin');
      }
  };

  const updateStaff = (updatedStaff) => {
      setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
      addNotification(`Staff member "${updatedStaff.name}" updated successfully.`, 'admin');
  };
  
  const updateProfile = (updatedData) => {
      // Immediate state update for responsiveness
      setCurrentUser(prev => {
          const newUser = { ...prev, ...updatedData };
          // Also update in the users array immediately
          setUsers(currentUsers => currentUsers.map(u => u.id === prev.id ? newUser : u));
          return newUser;
      });
      addNotification('Profile updated successfully.', 'all');
  };

  const logout = () => {
      setCurrentUser(null);
  };

  const calculateRate = (weight, serviceType) => {
      const w = parseFloat(weight) || 1;
      const baseRate = serviceType === 'Express' ? 100 : 50;
      return (w * 50) + baseRate;
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

  const updateShipmentStatus = (id, status, location = 'Hub') => {
      setShipments(prev => prev.map(s => s.id === id ? { 
          ...s, 
          status, 
          history: [...s.history, { status, location, timestamp: new Date().toLocaleString() }] 
      } : s));
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

  const addNotification = (message, role) => {
      setNotifications(prev => [{ id: Date.now(), message, role, timestamp: new Date().toLocaleTimeString() }, ...prev]);
  };

  const getRoleNotifications = (role) => {
      return notifications.filter(n => n.role === role || n.role === 'all');
  };

  const clearAllData = () => {
    // Development helper to reset
    localStorage.clear();
    setShipments(defaultShipments);
    setUsers([]);
    setBranches(defaultBranches);
    setVehicles(defaultVehicles);
    setStaff(defaultStaff);
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
      addVehicle,
      updateBranch,
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
