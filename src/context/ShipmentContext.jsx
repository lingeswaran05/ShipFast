import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockService } from '../mock/mockService';
import { authService, authStorage } from '../lib/authService'; // Assuming these exist from earlier analysis
import { adminService } from '../lib/adminService'; // Assuming these exist from earlier analysis
import { communicationService } from '../lib/communicationService'; // Assuming these exist from earlier analysis
import { shipmentService } from '../lib/shipmentService'; // Assuming these exist from earlier analysis
import { operationsService } from '../lib/operationsService'; // Assuming these exist from earlier analysis
import { roleService } from '../lib/roleService'; // Assuming these exist from earlier analysis

const ShipmentContext = createContext();

const ROLE_REQUESTS_KEY = 'sf_role_requests';
const ROLE_OVERRIDES_KEY = 'sf_role_overrides';
const USERS_DIRECTORY_KEY = 'sf_users_directory';
const PRICING_CONFIG_KEY = 'sf_pricing_config';
const DISMISSED_NOTIFICATIONS_KEY = 'sf_dismissed_notifications';
const MAX_ROLE_REQUESTS = 200;
const AGENT_ONBOARDING_KEY_PREFIX = 'sf_agent_onboarding_';
const LEGACY_AGENT_ONBOARDING_KEY_PREFIX = 'agent_onboarding_';
const DEFAULT_PRICING_CONFIG = {
  profitPercentage: 20,
  standardRatePerKg: 80,
  expressMultiplier: 1.75,
  sameDayMultiplier: 2,
  distanceSurcharge: 40,
  fuelSurchargePct: 9,
  gstPct: 5,
  codHandlingFee: 50
};

const parseStored = (key, fallback = []) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeRole = (value) => {
  const normalized = String(value || 'customer').toLowerCase();
  if (['driver', 'manager', 'sorter'].includes(normalized)) return 'agent';
  return normalized;
};

const toIdentityValue = (value) => String(value || '').trim().toLowerCase();
const getShipmentOwnerIdentifiers = (user = {}) => {
  const stableIds = [user?.userId, user?.id].filter(Boolean);
  if (stableIds.length > 0) return stableIds;
  return [user?.email].filter(Boolean);
};
const filterCustomerShipments = (shipments = [], user = {}) => {
  const allowedStableIds = new Set(getShipmentOwnerIdentifiers(user).map((value) => String(value || '').trim().toLowerCase()).filter(Boolean));
  const fallbackEmail = String(user?.email || '').trim().toLowerCase();

  return (shipments || []).filter((shipment) => {
    const customerIdIdentity = String(shipment?.customerId || shipment?.userId || shipment?.ownerId || '').trim().toLowerCase();
    if (allowedStableIds.size > 0) {
      return customerIdIdentity ? allowedStableIds.has(customerIdIdentity) : false;
    }

    const emailIdentity = String(shipment?.customerEmail || shipment?.email || '').trim().toLowerCase();
    return Boolean(fallbackEmail) && emailIdentity === fallbackEmail;
  });
};

const shallowCompareArraysOfObjects = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    const obj1 = arr1[i];
    const obj2 = arr2[i];
    if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;
    for (const key in obj1) {
      if (obj1[key] !== obj2[key]) return false;
    }
  }
  return true;
};

export function useShipment() {
  return useContext(ShipmentContext);
}

export function ShipmentProvider({ children }) {
  const [shipments, setShipments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(parseStored(USERS_DIRECTORY_KEY, []));
  const [branches, setBranches] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState(
    parseStored(DISMISSED_NOTIFICATIONS_KEY, []).map((value) => String(value).trim()).filter(Boolean)
  );
  const [reportSummary, setReportSummary] = useState(null);
  const [lastDataSyncAt, setLastDataSyncAt] = useState(null);
  const [roleRequests, setRoleRequests] = useState(() => {
    const stored = parseStored(ROLE_REQUESTS_KEY, []);
    return Array.isArray(stored) ? stored.slice(0, MAX_ROLE_REQUESTS) : [];
  });
  const [roleOverrides, setRoleOverrides] = useState(parseStored(ROLE_OVERRIDES_KEY, []));
  const [activeRole, setActiveRole] = useState(null);
  const [pricingConfig, setPricingConfig] = useState(DEFAULT_PRICING_CONFIG); // Simplified for now
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const normalizeNotification = (notification = {}) => {
    const id = String(notification?.id ?? `${Date.now()}-${Math.random()}`).trim();
    const createdAt = notification?.createdAt || new Date().toISOString();
    const role = String(notification?.role || 'all').toLowerCase();
    return {
      ...notification,
      id,
      role,
      createdAt,
      timestamp: notification?.timestamp || new Date(createdAt).toLocaleString()
    };
  };

  const mergeNotifications = (...collections) => {
    const seen = new Set();
    const merged = [];
    collections.flat().forEach((item) => {
      if (!item) return;
      const normalized = normalizeNotification(item);
      const dedupeKey = normalized.id || `${normalized.message}|${normalized.timestamp}|${normalized.role}`;
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);
      merged.push(normalized);
    });
    return merged
      .sort((a, b) => new Date(b.createdAt || b.timestamp || 0).getTime() - new Date(a.createdAt || a.timestamp || 0).getTime())
      .slice(0, 200);
  };

  const syncUserDirectory = useCallback((user) => {
    if (!user?.email) return;
    setUsers(prev => {
      const existingIndex = prev.findIndex(u => u.email === user.email);
      const mergedUser = {
        id: user.id || user.userId || user.email,
        userId: user.userId || user.id,
        name: user.name || user.fullName || '',
        email: user.email,
        phone: user.phone || user.phoneNumber || '',
        role: normalizeRole(user.role),
        status: user.status || 'active',
        updatedAt: new Date().toISOString()
      };

      if (existingIndex === -1) return [...prev, mergedUser];
      const next = [...prev];
      next[existingIndex] = { ...next[existingIndex], ...mergedUser };
      return next;
    });
  }, []);

  const getUserOverride = useCallback((user) => {
    if (!user) return null;
    const stableUserIdentities = [user?.userId, user?.id].filter(Boolean).map(toIdentityValue);
    const userEmailIdentity = toIdentityValue(user?.email);

    if (stableUserIdentities.length > 0) {
      return roleOverrides.find((override) => {
        const overrideStableIdentities = [override?.userId, override?.id]
          .map(toIdentityValue)
          .filter(Boolean);
        return overrideStableIdentities.some((identity) => stableUserIdentities.includes(identity));
      }) || null;
    }

    if (!userEmailIdentity) return null;
    return roleOverrides.find((override) => (
      toIdentityValue(override?.email) === userEmailIdentity
    )) || null;
  }, [roleOverrides]);

  const applyRoleOverride = useCallback((user) => {
    const override = getUserOverride(user);
    if (!override) return user;
    return {
      ...user,
      role: normalizeRole(override.role),
      blocked: Boolean(override.blocked),
      agentType: override.agentType || user.agentType || null
    };
  }, [getUserOverride]);

  const loadUsersFromDb = useCallback(async () => {
    try {
      const dbUsers = await mockService.getAllUsers(); // Using mockService for now
      const nextUsers = (dbUsers || []).map((user) => applyRoleOverride(user));
      setUsers(nextUsers);
      return nextUsers;
    } catch (error) {
      console.error('Failed to fetch users from DB', error);
      return users;
    }
  }, [applyRoleOverride, users]);

  const refreshShipments = useCallback(async () => {
    if (!currentUser) return [];
    let userShipments = [];
    try {
      setIsRefreshing(true);
      const role = normalizeRole(currentUser.role);
      if (role === 'admin' || role === 'agent') {
        userShipments = await mockService.getAllShipments(); // Using mockService
      } else {
        const ownerIdentifiers = getShipmentOwnerIdentifiers(currentUser);
        userShipments = ownerIdentifiers.length > 0 ? await mockService.getShipments(ownerIdentifiers[0]) : []; // Using mockService
        userShipments = filterCustomerShipments(userShipments, currentUser);
      }
    } catch (error) {
      console.warn('Failed to load shipments from backend, using empty fallback', error);
      userShipments = [];
    } finally {
      setIsRefreshing(false);
    }

    // Only update if shipments have actually changed to prevent unnecessary re-renders
    setShipments(prevShipments => {
      if (shallowCompareArraysOfObjects(prevShipments, userShipments)) {
        return prevShipments;
      }
      return userShipments;
    });
    setLastDataSyncAt(new Date().toISOString());
    return userShipments;
  }, [currentUser]);

  const addNotification = useCallback((message, role = 'all', status = 'INFO') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = new Date().toISOString();
    setNotifications(prev => {
      const next = mergeNotifications([
        {
          id,
          message,
          role: String(role || 'all').toLowerCase(),
          status,
          createdAt,
          timestamp: new Date(createdAt).toLocaleString()
        }
      ], prev);
      return next.slice(0, 100);
    });
  }, []);

  const getRoleNotifications = useCallback((role) => {
    const dismissed = new Set(dismissedNotificationIds.map((value) => String(value).trim()));
    return notifications.filter((n) => {
      const roleName = String(n?.role || 'all').toLowerCase();
      const notificationId = String(n?.id || '').trim();
      if (notificationId && dismissed.has(notificationId)) return false;
      return !roleName || roleName === String(role || '').toLowerCase() || roleName === 'all';
    });
  }, [dismissedNotificationIds, notifications]);

  // Initial Data Fetch & Auth Persistence
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const baseUser = JSON.parse(storedUser);
            const user = applyRoleOverride(baseUser);
            setCurrentUser(user);
            syncUserDirectory(user);
            await refreshShipments();
            if (user.role === 'admin') {
              await loadUsersFromDb();
            }
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
  }, [applyRoleOverride, refreshShipments, syncUserDirectory, loadUsersFromDb]);

  const login = async (email, password) => {
    try {
      const baseUser = await mockService.login(email, password); // Using mockService
      const user = applyRoleOverride(baseUser);

      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      syncUserDirectory(user);
      
      await refreshShipments();
      if (user.role === 'admin') {
        await loadUsersFromDb();
      }
      
      addNotification(`Welcome back, ${user.name}!`, user.role);
      return user;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const register = async (userData) => {
      try {
          const baseUser = await mockService.register({ ...userData, role: 'customer' }); // Using mockService
          const user = applyRoleOverride(baseUser);
          syncUserDirectory(user);
          
          // Registration should always redirect to login and start a fresh session.
          setCurrentUser(null);
          setShipments([]);
          addNotification('Registration successful. Please login to continue.', 'customer');
          return { ...user, requiresLogin: true };
      } catch (error) {
          console.error("Registration failed", error);
          throw error;
      }
  };

  const logout = () => {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      setShipments([]);
      setNotifications([]);
      setActiveRole(null);
  };

  const addShipment = async (shipmentData) => {
      try {
        const newShipment = await mockService.createShipment(shipmentData); // Using mockService
        setShipments(prev => [newShipment, ...prev]);
        return newShipment;
      } catch (error) {
          console.error("Create shipment failed", error);
          throw error;
      }
  };

  const updateShipmentStatus = async (id, status, metadata = {}) => {
      try {
          const updatedShipment = await mockService.updateShipmentStatus(id, status, metadata); // Using mockService
          setShipments(prev => prev.map(s => s.id === id ? updatedShipment : s));
          return updatedShipment;
      } catch (error) {
          console.error("Update status failed", error);
          throw error;
      }
  };

  const assignShipmentToAgent = async (id, agentId, runSheetId = null) => {
    try {
      const assignedShipment = await mockService.assignShipment(id, agentId, runSheetId); // Using mockService
      setShipments(prev => prev.map(s => s.id === id ? assignedShipment : s));
      addNotification(`Shipment ${id} assigned to agent ${agentId}.`, 'admin');
      return assignedShipment;
    } catch (error) {
      console.error("Assign shipment failed", error);
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
          syncUserDirectory(newUser);
          return newUser;
      });
      addNotification('Profile updated successfully.', 'all');
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
      isRefreshing,
      login,
      logout,
      register,
      addShipment,
      updateShipmentStatus,
      assignShipmentToAgent,
      deleteShipment,
      cancelShipment,
      getShipment,
      refreshShipments,
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
