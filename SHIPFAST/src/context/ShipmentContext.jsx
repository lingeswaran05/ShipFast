import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockService } from '../mock/mockService';
import { authService, authStorage } from '../lib/authService';
import { adminService } from '../lib/adminService';
import { communicationService } from '../lib/communicationService';
import { shipmentService } from '../lib/shipmentService';
import { reportingService } from '../lib/reportingService';

const ShipmentContext = createContext();
const ROLE_REQUESTS_KEY = 'sf_role_requests';
const ROLE_OVERRIDES_KEY = 'sf_role_overrides';
const USERS_DIRECTORY_KEY = 'sf_users_directory';

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

const isProtectedAdmin = (user) => normalizeRole(user?.role) === 'admin';

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
  const [reportSummary, setReportSummary] = useState(null);
  const [lastDataSyncAt, setLastDataSyncAt] = useState(null);
  const [roleRequests, setRoleRequests] = useState(parseStored(ROLE_REQUESTS_KEY, []));
  const [roleOverrides, setRoleOverrides] = useState(parseStored(ROLE_OVERRIDES_KEY, []));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem(USERS_DIRECTORY_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(ROLE_REQUESTS_KEY, JSON.stringify(roleRequests));
  }, [roleRequests]);

  useEffect(() => {
    localStorage.setItem(ROLE_OVERRIDES_KEY, JSON.stringify(roleOverrides));
  }, [roleOverrides]);

  const syncUserDirectory = (user) => {
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
  };

  const getUserOverride = (user) => {
    if (!user) return null;
    return roleOverrides.find(
      override =>
        (override.userId && override.userId === user.userId) ||
        (override.email && user.email && override.email === user.email)
    ) || null;
  };

  const applyRoleOverride = (user) => {
    const override = getUserOverride(user);
    if (!override) return user;
    return {
      ...user,
      role: normalizeRole(override.role),
      blocked: Boolean(override.blocked),
      agentType: override.agentType || user.agentType || null
    };
  };

  const loadUsersFromDb = async () => {
    try {
      const dbUsers = await authService.getAllUsers();
      setUsers(dbUsers);
      return dbUsers;
    } catch (error) {
      console.error('Failed to fetch users from DB', error);
      return users;
    }
  };

  const loadAdminOperationalData = async () => {
    try {
      const [branchesData, vehiclesData] = await Promise.all([
        adminService.getBranches(),
        adminService.getVehicles()
      ]);
      setBranches(branchesData);
      setVehicles(vehiclesData);
      return { branchesData, vehiclesData };
    } catch (error) {
      console.error('Failed to fetch admin operational data from backend', error);
      const [branchesData, fleetData] = await Promise.all([
        mockService.getBranches(),
        mockService.getFleet()
      ]);
      setBranches(branchesData);
      setVehicles(fleetData);
      return { branchesData, vehiclesData: fleetData };
    }
  };

  const refreshShipments = async () => {
    if (!currentUser) return [];
    let userShipments = [];
    try {
      const role = normalizeRole(currentUser.role);
      if (role === 'admin' || role === 'agent') {
        userShipments = await shipmentService.getAllShipments();
      } else {
        userShipments = await shipmentService.getShipments(currentUser.userId || currentUser.id || currentUser.email);
      }
    } catch (error) {
      console.warn('Failed to load shipments from backend, using empty fallback', error);
      userShipments = [];
    }
    setShipments(userShipments || []);
    setLastDataSyncAt(new Date().toISOString());
    return userShipments;
  };

  const refreshOperationalData = async () => {
    if (currentUser?.role === 'admin') {
      await loadAdminOperationalData();
      await loadUsersFromDb();
      try {
        const summary = await reportingService.getSummary();
        setReportSummary(summary);
      } catch {
        // non-blocking
      }
    }
    await refreshShipments();
  };

  const refreshUserNotifications = async (userId = null) => {
    const effectiveUserId = userId || currentUser?.userId || currentUser?.id;
    if (!effectiveUserId) return [];
    try {
      const latestNotifications = await communicationService.getUserNotifications(effectiveUserId);
      setNotifications(latestNotifications);
      return latestNotifications;
    } catch (error) {
      console.error('Failed to fetch notifications from backend', error);
      return notifications;
    }
  };

  // Initial Data Fetch & Auth Persistence
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const hasAccessToken = Boolean(authStorage.getAccessToken());
        if (hasAccessToken) {
            try {
              const baseUser = await authService.getProfile();
              const user = applyRoleOverride(baseUser);

              if (user.blocked) {
                await authService.logout();
                setCurrentUser(null);
                setShipments([]);
              } else {
                setCurrentUser(user);
                syncUserDirectory(user);
              let userShipments = [];
              try {
                  const role = normalizeRole(user.role);
                  if (role === 'admin' || role === 'agent') {
                    userShipments = await shipmentService.getAllShipments();
                  } else {
                    userShipments = await shipmentService.getShipments(user.userId || user.id || user.email);
                  }
              } catch {
                  userShipments = [];
              }
                setShipments(userShipments);
                if (user.role === 'admin') {
                  await loadUsersFromDb();
                  await loadAdminOperationalData();
                }
              }
            } catch {
              await authService.logout();
              setCurrentUser(null);
              setShipments([]);
            }
        } else {
            const localUser = authStorage.getCurrentUser();
            if (localUser) {
              const user = applyRoleOverride(localUser);
              if (!user.blocked) {
                setCurrentUser(user);
                syncUserDirectory(user);
              }
            }
        }

        const isAdminSession = (authStorage.getCurrentUser()?.role || '').toLowerCase() === 'admin';
        if (isAdminSession) {
          await loadAdminOperationalData();
        } else {
          const [branchesData, fleetData] = await Promise.all([
            mockService.getBranches(),
            mockService.getFleet()
          ]);
          setBranches(branchesData);
          setVehicles(fleetData);
        }

        const staffData = await mockService.getStaff();
        setStaff(staffData);
        setLastDataSyncAt(new Date().toISOString());
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
      const baseUser = await authService.login(email, password);
      const user = applyRoleOverride(baseUser);

      if (user.blocked) {
        await authService.logout();
        throw new Error('Access removed by admin. Please contact support.');
      }

      setCurrentUser(user);
      authStorage.setCurrentUser(user);
      syncUserDirectory(user);

      if (user.role === 'admin') {
        await loadUsersFromDb();
        await loadAdminOperationalData();
      }

      let userShipments = [];
      try {
        const role = normalizeRole(user.role);
        if (role === 'admin' || role === 'agent') {
          userShipments = await shipmentService.getAllShipments();
        } else {
          userShipments = await shipmentService.getShipments(user.userId || user.id || user.email);
        }
      } catch {
        userShipments = [];
      }
      setShipments(userShipments);
      setLastDataSyncAt(new Date().toISOString());

      await refreshUserNotifications(user.userId || user.id);

      addNotification(`Welcome back, ${user.name}!`, user.role);
      return user;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const register = async (userData) => {
      try {
          const baseUser = await authService.register({
            fullName: userData.name,
            email: userData.email,
            password: userData.password,
            phoneNumber: userData.phone,
            address: userData.address,
            city: userData.city,
            state: userData.state,
            pincode: userData.pincode
          });

          const user = applyRoleOverride(baseUser);
          setCurrentUser(user);
          authStorage.setCurrentUser(user);
          syncUserDirectory(user);

          let userShipments = [];
          try {
            userShipments = await shipmentService.getShipments(user.userId || user.id || user.email);
          } catch {
            userShipments = [];
          }
          setShipments(userShipments);
          addNotification(`Welcome to ShipFast, ${user.name}!`, 'customer');
          return user;
      } catch (error) {
          console.error("Registration failed", error);
          throw error;
      }
  };

  const logout = async () => {
      await authService.logout();
      setCurrentUser(null);
      setShipments([]);
      setNotifications([]);
  };

  const forgotPassword = async (email) => {
      return authService.forgotPassword(email);
  };

  const verifyOtp = async (email, otp) => {
      return authService.verifyOtp(email, otp);
  };

  const resetPassword = async (email, newPassword) => {
      return authService.resetPassword(email, newPassword);
  };

  const addShipment = async (shipmentData) => {
      try {
        let newShipment;
        try {
          newShipment = await shipmentService.createShipment(shipmentData, currentUser?.userId || currentUser?.id || currentUser?.email);
        } catch {
          newShipment = await mockService.createShipment(shipmentData);
        }
        setShipments(prev => [newShipment, ...prev]);
        return newShipment;
      } catch (error) {
          console.error("Create shipment failed", error);
          throw error;
      }
  };

  const updateShipmentStatus = async (id, status, metadata = {}) => {
      try {
          const normalizedMeta = typeof metadata === 'string' ? { remarks: metadata } : (metadata || {});
          let updatedShipment;
          try {
            updatedShipment = await shipmentService.updateStatus(
              id,
              status,
              currentUser?.userId || currentUser?.id || currentUser?.email,
              normalizedMeta
            );
          } catch {
            updatedShipment = await mockService.updateShipmentStatus(id, status);
          }
          setShipments(prev => prev.map(s => (
            s.id === id || s.trackingId === id || s.trackingNumber === id || s.id === updatedShipment?.id
              ? updatedShipment
              : s
          )));
          return updatedShipment;
      } catch (error) {
          console.error("Update status failed", error);
          throw error;
      }
  };

  const deleteShipment = async (id) => {
      try {
        await shipmentService.deleteShipment(id);
      } catch {
        // fallback to local delete if backend unavailable
      }
      setShipments(prev => prev.filter(s => s.id !== id));
      addNotification('Shipment deleted.', 'customer');
  };

  const rateShipment = async (id, rating, comment = '') => {
      try {
        const updatedShipment = await shipmentService.addShipmentRating(id, rating, comment);
        setShipments(prev => prev.map(s => (
          s.id === id || s.trackingId === id || s.trackingNumber === id || s.id === updatedShipment?.id
            ? updatedShipment
            : s
        )));
        addNotification(`Thanks for rating shipment ${updatedShipment?.trackingNumber || id}.`, 'customer');
        return updatedShipment;
      } catch (error) {
        console.error('Rate shipment failed', error);
        throw error;
      }
  };

  const cancelShipment = (id) => {
      updateShipmentStatus(id, 'Cancelled');
  };

  const getShipment = (id) => {
      return shipments.find(s => s.id === id || s.trackingId === id || s.trackingNumber === id);
  };

  const requestRoleUpgrade = (requestedRole, reason = '') => {
      if (!currentUser) throw new Error('Please login first');
      if (normalizeRole(currentUser.role) !== 'customer') {
        throw new Error('Only customers can request role upgrade');
      }

      const existingPending = roleRequests.find(
        request => request.email === currentUser.email && request.status === 'PENDING'
      );

      if (existingPending) {
        throw new Error('You already have a pending request');
      }

      const request = {
        id: `rr-${Date.now()}`,
        userId: currentUser.userId || currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        currentRole: normalizeRole(currentUser.role),
        requestedRole: normalizeRole(requestedRole || 'agent'),
        reason,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };

      setRoleRequests(prev => [request, ...prev]);
      addNotification('Role upgrade request submitted to admin.', 'customer');
      return request;
  };

    const approveRoleRequest = async (request) => {
      if (!request || !request.id) {
          throw new Error("Invalid request object provided.");
      }

      // Use the user ID from the request, fallback to email if not present
      const userIdentifier = request.userId || request.email;
      if (!userIdentifier) {
          throw new Error("No user identifier found in the request.");
      }
      
      const roleToAssign = request.requestedRole || 'agent';

      // Call the backend service to update the user's role
      try {
          await authService.updateUserRole(userIdentifier, roleToAssign);
      } catch (error) {
          if (String(error.message).includes('found') || String(error.message).includes('Failed to update')) {
              console.warn("Backend update failed (likely mock user). Applying locally:", error.message);
          } else {
              throw error;
          }
      }

      // Update the local state for role requests
      setRoleRequests(prev => prev.map(r =>
        r.id === request.id ? { ...r, status: 'APPROVED', reviewedAt: new Date().toISOString() } : r
      ));

      // This part seems overly complex and might be redundant if the backend is the source of truth.
      // Let's simplify it to just reload the user list from the DB.
      await loadUsersFromDb();

      // If the approved user is the one currently logged in, refresh their session data.
      if (currentUser?.email === request.email) {
        const baseUser = await authService.getProfile();
        const user = applyRoleOverride(baseUser);
        setCurrentUser(user);
        authStorage.setCurrentUser(user);
      }
  };

  const rejectRoleRequest = (requestId) => {
      setRoleRequests(prev => prev.map(r =>
        r.id === requestId ? { ...r, status: 'REJECTED', reviewedAt: new Date().toISOString() } : r
      ));
  };

  const updateUserRole = async (targetUser, role) => {
      const target = typeof targetUser === 'string'
        ? users.find(u => u.email === targetUser || u.userId === targetUser || u.id === targetUser)
        : targetUser;
      if (!target) return;

      if (isProtectedAdmin(target) && normalizeRole(role) !== 'admin') {
        throw new Error('Default admin role cannot be changed.');
      }

      const nextRole = normalizeRole(role);

      await authService.updateUserRole(target.userId || target.id || target.email, nextRole);

      setRoleOverrides(prev => {
        const next = prev.filter(o => !(o.email === target.email || (o.userId && o.userId === target.userId)));
        next.push({
          userId: target.userId || target.id,
          email: target.email,
          role: nextRole,
          blocked: false,
          updatedAt: new Date().toISOString()
        });
        return next;
      });

      await loadUsersFromDb();

      if (currentUser?.email === target.email) {
        const updatedUser = { ...currentUser, role: nextRole, blocked: false };
        setCurrentUser(updatedUser);
        authStorage.setCurrentUser(updatedUser);
      }
  };

  const removeUserAccess = async (targetUser) => {
      const target = typeof targetUser === 'string'
        ? users.find(u => u.email === targetUser || u.userId === targetUser || u.id === targetUser)
        : targetUser;
      if (!target) return;

      if (isProtectedAdmin(target)) {
        throw new Error('Default admin access cannot be removed.');
      }

      await authService.removeUserAccess(target.userId || target.id || target.email);

      setRoleOverrides(prev => {
        const next = prev.filter(o => !(o.email === target.email || (o.userId && o.userId === target.userId)));
        next.push({
          userId: target.userId || target.id,
          email: target.email,
          role: 'customer',
          blocked: true,
          updatedAt: new Date().toISOString()
        });
        return next;
      });

      await loadUsersFromDb();

      if (currentUser?.email === target.email) {
        await logout();
      }
  };

  // Helper for admin/agent actions
    const addBranch = async (branchData) => {
      const newBranch = await adminService.createBranch(branchData);
      setBranches(prev => [newBranch, ...prev]);
      addNotification(`Branch "${branchData.name}" added successfully.`, 'admin');
      setLastDataSyncAt(new Date().toISOString());
      return newBranch;
  };
  
    const removeBranch = async (branchId) => {
      await adminService.deleteBranch(branchId);
      setBranches(prev => prev.filter(b => b.id !== branchId && b.branchId !== branchId));
      addNotification('Branch removed successfully.', 'admin');
      setLastDataSyncAt(new Date().toISOString());
  };

    const updateBranch = async (updatedBranch) => {
      const savedBranch = await adminService.updateBranch(updatedBranch.id || updatedBranch.branchId, updatedBranch);
      setBranches(prev => prev.map(b => (b.id === savedBranch.id || b.branchId === savedBranch.branchId) ? savedBranch : b));
      addNotification(`Branch "${updatedBranch.name}" updated successfully.`, 'admin');
      setLastDataSyncAt(new Date().toISOString());
      return savedBranch;
  };

    const addVehicle = async (vehicleData) => {
      const newVehicle = await adminService.createVehicle(vehicleData);
      setVehicles(prev => [newVehicle, ...prev]);
      addNotification(`Vehicle ${vehicleData.number || vehicleData.vehicleNumber} added to fleet.`, 'admin');
      setLastDataSyncAt(new Date().toISOString());
      return newVehicle;
  };

    const updateVehicle = async (updatedVehicle) => {
      const savedVehicle = await adminService.updateVehicle(updatedVehicle.id || updatedVehicle.vehicleId || updatedVehicle.number, updatedVehicle);
      setVehicles(prev => prev.map(v => (v.id === savedVehicle.id || v.vehicleId === savedVehicle.vehicleId) ? savedVehicle : v));
      addNotification(`Vehicle ${savedVehicle.number || savedVehicle.id} updated successfully.`, 'admin');
      setLastDataSyncAt(new Date().toISOString());
      return savedVehicle;
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
  
    const updateProfile = async (updatedData) => {
      if (!currentUser) return;

      const onlyPictureUpdate = Object.keys(updatedData).every(key => key === 'profilePic');
      const hasExtendedData = Boolean(updatedData.documents || updatedData.agentDetails);
      const hasCoreProfileUpdates = ['name', 'fullName', 'phone', 'phoneNumber', 'address', 'city', 'state', 'pincode']
        .some((key) => Object.prototype.hasOwnProperty.call(updatedData, key));

      if (onlyPictureUpdate) {
        const userWithPicture = { ...currentUser, profilePic: updatedData.profilePic ?? null };
        setCurrentUser(userWithPicture);
        authStorage.setCurrentUser(userWithPicture);
          syncUserDirectory(userWithPicture);
        return userWithPicture;
      }

      // Keep agent onboarding/documents usable even if backend profile API does not support those fields.
      if (hasExtendedData && !hasCoreProfileUpdates) {
        const mergedLocalUser = {
          ...currentUser,
          ...updatedData,
          name: updatedData.name ?? updatedData.fullName ?? currentUser.name,
          fullName: updatedData.fullName ?? updatedData.name ?? currentUser.fullName
        };
        setCurrentUser(mergedLocalUser);
        authStorage.setCurrentUser(mergedLocalUser);
        syncUserDirectory(mergedLocalUser);
        addNotification('Agent verification details saved locally.', 'agent', 'SUCCESS');
        return mergedLocalUser;
      }

      const profilePayload = {
        fullName: updatedData.name ?? updatedData.fullName ?? currentUser.name,
        phoneNumber: updatedData.phone ?? updatedData.phoneNumber ?? currentUser.phone,
        address: updatedData.address ?? currentUser.address,
        city: updatedData.city ?? currentUser.city,
        state: updatedData.state ?? currentUser.state,
        pincode: updatedData.pincode ?? currentUser.pincode
      };

      const updatedUser = await authService.updateProfile(profilePayload);
      const mergedUser = {
        ...updatedUser,
        profilePic: currentUser.profilePic || null,
        ...(hasExtendedData ? { documents: updatedData.documents, agentDetails: updatedData.agentDetails } : {})
      };
      setCurrentUser(mergedUser);
      authStorage.setCurrentUser(mergedUser);
        syncUserDirectory(mergedUser);
      addNotification('Profile updated successfully.', 'all');
      return mergedUser;
  };

  const addNotification = (message, role = 'all', status = 'INFO') => {
      const id = Date.now();
      setNotifications(prev => {
        const next = [{ id, message, role, status, timestamp: new Date().toLocaleTimeString() }, ...prev];
        return next.slice(0, 100);
      });
  };

  const getRoleNotifications = (role) => {
      return notifications.filter(n => !n.role || n.role === role || n.role === 'all');
  };

    const getSupportTickets = async (userId = null) => {
      const effectiveUserId = userId || currentUser?.userId || currentUser?.id;
      return communicationService.getUserTickets(effectiveUserId);
    };

    const getAllSupportTickets = async (status = '') => {
      return communicationService.getAllTickets(status);
    };

    const createSupportTicket = async (ticketData) => {
      const effectiveUserId = ticketData.userId || currentUser?.userId || currentUser?.id;
      const created = await communicationService.createTicket({
        ...ticketData,
        userId: effectiveUserId,
        senderName: currentUser?.name || ticketData.senderName || 'Customer',
        senderRole: currentUser?.role || ticketData.senderRole || 'customer'
      });
      try {
      await communicationService.sendNotification(effectiveUserId, 'EMAIL', `Ticket created: ${created.subject}`);
      } catch {
      // Non-blocking notification call
      }
      return created;
    };

    const replySupportTicket = async (ticketId, message) => {
      return communicationService.replyTicket(ticketId, {
        senderId: currentUser?.userId || currentUser?.id || currentUser?.email,
        senderName: currentUser?.name || currentUser?.email || 'Support',
        senderRole: currentUser?.role || 'customer',
        message
      });
    };

    const updateSupportTicketStatus = async (ticketId, status, assignment = {}) => {
      return communicationService.updateTicketStatus(ticketId, {
        status,
        assignedToRole: assignment.assignedToRole,
        assignedToUserId: assignment.assignedToUserId
      });
    };

    const closeSupportTicket = async (ticketId) => {
      return communicationService.closeTicket(ticketId);
    };

    const deleteSupportTicket = async (ticketId) => {
      return communicationService.deleteTicket(ticketId);
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

  useEffect(() => {
    if (!currentUser) return;

    refreshUserNotifications(currentUser.userId || currentUser.id);
    const interval = setInterval(() => {
      refreshUserNotifications(currentUser.userId || currentUser.id);
    }, 20000);

    return () => clearInterval(interval);
  }, [currentUser?.userId, currentUser?.id]);

  useEffect(() => {
    if (!currentUser) return;

    refreshShipments();
    const interval = setInterval(() => {
      refreshShipments();
    }, 10000);

    const onFocus = () => {
      refreshShipments();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [currentUser?.userId, currentUser?.id, currentUser?.role]);

  return (
    <ShipmentContext.Provider value={{
      shipments,
      currentUser,
      users,
      roleRequests,
      roleOverrides,
      branches,
      vehicles,
      staff,
      notifications,
      reportSummary,
      lastDataSyncAt,
      isLoading,
      login,
      logout,
      register,
      addShipment,
      updateShipmentStatus,
      deleteShipment,
      rateShipment,
      cancelShipment,
      getShipment,
      refreshShipments,
      refreshOperationalData,
      addBranch,
      removeBranch,
      updateBranch,
      addVehicle,
      updateVehicle,
      addStaff,
      removeStaff,
      updateStaff,
      updateProfile,
      requestRoleUpgrade,
      approveRoleRequest,
      rejectRoleRequest,
      updateUserRole,
      removeUserAccess,
      forgotPassword,
      verifyOtp,
      resetPassword,
      getSupportTickets,
      getAllSupportTickets,
      createSupportTicket,
      replySupportTicket,
      updateSupportTicketStatus,
      closeSupportTicket,
      deleteSupportTicket,
      refreshUserNotifications,
      getRoleNotifications,
      calculateRate,
      clearAllData
    }}>
      {children}
    </ShipmentContext.Provider>
  );
}


