import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockService } from '../mock/mockService';
import { authService, authStorage } from '../lib/authService';
import { adminService } from '../lib/adminService';
import { communicationService } from '../lib/communicationService';
import { shipmentService } from '../lib/shipmentService';
import { reportingService } from '../lib/reportingService';
import { operationsService } from '../lib/operationsService';

const ShipmentContext = createContext();
const ROLE_REQUESTS_KEY = 'sf_role_requests';
const ROLE_OVERRIDES_KEY = 'sf_role_overrides';
const USERS_DIRECTORY_KEY = 'sf_users_directory';
const PRICING_CONFIG_KEY = 'sf_pricing_config';
const DISMISSED_NOTIFICATIONS_KEY = 'sf_dismissed_notifications';
const MAX_ROLE_REQUESTS = 200;
const AGENT_ONBOARDING_KEY_PREFIX = 'sf_agent_onboarding_';
const LEGACY_AGENT_ONBOARDING_KEY_PREFIX = 'agent_onboarding_';

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
const normalizeRoleRequestStatus = (value) => String(value || 'PENDING').toUpperCase();
const isPendingRoleRequestStatus = (value) => ['PENDING', 'PENDING_VERIFICATION'].includes(normalizeRoleRequestStatus(value));
const getRoleRequestIdentityValues = (request = {}) => (
  [request?.userId, request?.email, request?.id]
    .map(toIdentityValue)
    .filter(Boolean)
);
const roleRequestMatchesAnyIdentity = (request = {}, identities = []) => {
  const requestIdentities = getRoleRequestIdentityValues(request);
  return requestIdentities.some((identity) => identities.includes(identity));
};
const buildIdentityCandidates = (...values) => (
  [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]
);
const toStorageSafeDocValue = (value) => {
  const text = String(value || '').trim();
  if (!text) return null;
  // Avoid persisting large inline base64 data in role-request index storage.
  if (text.startsWith('data:')) return null;
  return text;
};

const isQuotaExceededError = (error) => (
  error?.name === 'QuotaExceededError' ||
  error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
  error?.code === 22 ||
  error?.code === 1014
);

const safeSetLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (isQuotaExceededError(error)) {
      console.warn(`Storage quota exceeded while saving ${key}`);
    } else {
      console.warn(`Failed to save ${key} in localStorage`, error);
    }
    return false;
  }
};

const readRoleRequestDocuments = (request = {}) => ({
  profilePhoto: request?.documents?.profilePhoto || request?.agentDetails?.profilePhoto || null,
  aadharCopy: request?.documents?.aadharCopy || null,
  licenseCopy: request?.documents?.licenseCopy || null,
  rcBookCopy: request?.documents?.rcBookCopy || null
});

const prepareRoleRequestsForStorage = (requests = []) => (
  Array.isArray(requests)
    ? requests.slice(0, MAX_ROLE_REQUESTS).map((request = {}) => {
      const docs = readRoleRequestDocuments(request);
      const documentFlags = {
        profilePhoto: Boolean(docs.profilePhoto),
        aadharCopy: Boolean(docs.aadharCopy),
        licenseCopy: Boolean(docs.licenseCopy),
        rcBookCopy: Boolean(docs.rcBookCopy)
      };
      return {
        ...request,
        currentRole: normalizeRole(request?.currentRole || 'customer'),
        requestedRole: normalizeRole(request?.requestedRole || 'agent'),
        agentDetails: {
          ...(request?.agentDetails || {}),
          profilePhoto: null
        },
        documents: {
          profilePhoto: toStorageSafeDocValue(docs.profilePhoto),
          aadharCopy: toStorageSafeDocValue(docs.aadharCopy),
          licenseCopy: toStorageSafeDocValue(docs.licenseCopy),
          rcBookCopy: toStorageSafeDocValue(docs.rcBookCopy)
        },
        documentFlags
      };
    })
    : []
);

const clearLegacyOnboardingCopies = () => {
  try {
    const keysToRemove = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || !key.startsWith(LEGACY_AGENT_ONBOARDING_KEY_PREFIX)) continue;
      const identity = key.slice(LEGACY_AGENT_ONBOARDING_KEY_PREFIX.length);
      const primaryKey = `${AGENT_ONBOARDING_KEY_PREFIX}${identity}`;
      if (localStorage.getItem(primaryKey)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // non-blocking cleanup
      }
    });
  } catch {
    // non-blocking cleanup
  }
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
  const [pricingConfig, setPricingConfig] = useState(parseStored(PRICING_CONFIG_KEY, { profitPercentage: 20 }));
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

  const persistRoleRequestDocuments = (request = {}, fallbackIdentifiers = []) => {
    const docs = readRoleRequestDocuments(request);
    const hasAnyDoc = Object.values(docs).some(Boolean);
    if (!hasAnyDoc) return;

    const identities = [
      request?.userId,
      request?.email,
      ...fallbackIdentifiers
    ].map((value) => String(value || '').trim()).filter(Boolean);
    const unique = [...new Set(identities)];
    unique.forEach((identity) => {
      const primaryKey = `${AGENT_ONBOARDING_KEY_PREFIX}${identity}`;
      const legacyKey = `${LEGACY_AGENT_ONBOARDING_KEY_PREFIX}${identity}`;
      const payload = JSON.stringify(docs);
      const saved = safeSetLocalStorage(primaryKey, payload);
      if (saved) {
        try {
          localStorage.removeItem(legacyKey);
        } catch {
          // non-blocking cleanup
        }
      } else {
        safeSetLocalStorage(legacyKey, payload);
      }
    });
  };

  useEffect(() => {
    safeSetLocalStorage(USERS_DIRECTORY_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    safeSetLocalStorage(ROLE_REQUESTS_KEY, JSON.stringify(prepareRoleRequestsForStorage(roleRequests)));
  }, [roleRequests]);

  useEffect(() => {
    safeSetLocalStorage(ROLE_OVERRIDES_KEY, JSON.stringify(roleOverrides));
  }, [roleOverrides]);

  useEffect(() => {
    safeSetLocalStorage(PRICING_CONFIG_KEY, JSON.stringify(pricingConfig));
  }, [pricingConfig]);

  useEffect(() => {
    safeSetLocalStorage(DISMISSED_NOTIFICATIONS_KEY, JSON.stringify(dismissedNotificationIds));
  }, [dismissedNotificationIds]);

  useEffect(() => {
    clearLegacyOnboardingCopies();
  }, []);

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
      setIsRefreshing(true);
      const role = normalizeRole(currentUser.role);
      if (role === 'admin' || role === 'agent') {
        userShipments = await shipmentService.getAllShipments();
      } else {
        userShipments = await shipmentService.getShipments(currentUser.userId || currentUser.id || currentUser.email);
      }
    } catch (error) {
      console.warn('Failed to load shipments from backend, using empty fallback', error);
      userShipments = [];
    } finally {
      setIsRefreshing(false);
    }
    setShipments(userShipments || []);
    setLastDataSyncAt(new Date().toISOString());
    return userShipments;
  };

  const refreshOperationalData = async () => {
    setIsRefreshing(true);
    try {
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
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshUserNotifications = async (userId = null) => {
    const effectiveUserId = userId || currentUser?.userId || currentUser?.id;
    if (!effectiveUserId) return [];
    try {
      const latestNotifications = await communicationService.getUserNotifications(effectiveUserId);
      const dismissed = new Set(dismissedNotificationIds.map((value) => String(value).trim()));
      const filteredLatest = (latestNotifications || []).filter((item) => !dismissed.has(String(item?.id || '').trim()));
      setNotifications((prev) => mergeNotifications(filteredLatest, prev));
      return filteredLatest;
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
          syncUserDirectory(user);

          // Some auth providers return only registration confirmation without login tokens.
          if (baseUser?.requiresLogin) {
            addNotification('Registration successful. Please login to continue.', 'customer');
            return user;
          }

          setCurrentUser(user);
          authStorage.setCurrentUser(user);

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
          const idValue = String(id || '').trim();
          const targetShipment = shipments.find((shipment) => (
            [shipment.shipmentId, shipment.id, shipment.trackingId, shipment.trackingNumber]
              .filter(Boolean)
              .map((value) => String(value))
              .includes(idValue)
          ));
          const mutationId = targetShipment?.shipmentId || idValue;
          let updatedShipment;
          updatedShipment = await shipmentService.updateStatus(
            mutationId,
            status,
            currentUser?.userId || currentUser?.id || currentUser?.email,
            normalizedMeta
          );
          const mergedShipment = {
            ...(updatedShipment || {}),
            ...(normalizedMeta.paymentStatus ? { paymentStatus: normalizedMeta.paymentStatus } : {}),
            ...(normalizedMeta.paymentCollectedAt ? { paymentCollectedAt: normalizedMeta.paymentCollectedAt } : {}),
            ...(Object.prototype.hasOwnProperty.call(normalizedMeta, 'assignedAgentId') ? { assignedAgentId: normalizedMeta.assignedAgentId || null } : {}),
            ...(Object.prototype.hasOwnProperty.call(normalizedMeta, 'reassignedToAgentId') ? { assignedAgentId: normalizedMeta.reassignedToAgentId || null } : {})
          };
          setShipments(prev => prev.map(s => (
            s.shipmentId === idValue ||
            s.id === idValue ||
            s.trackingId === idValue ||
            s.trackingNumber === idValue ||
            s.shipmentId === updatedShipment?.shipmentId ||
            s.id === updatedShipment?.id
              ? mergedShipment
              : s
          )));
          return mergedShipment;
      } catch (error) {
          console.error("Update status failed", error);
          throw error;
      }
  };

  const deleteShipment = async (id) => {
      const requestedId = String(id || '').trim();
      if (!requestedId) {
        throw new Error('Shipment id is required');
      }

      const targetShipment = shipments.find((shipment) => (
        [shipment.shipmentId, shipment.id, shipment.trackingId, shipment.trackingNumber]
          .filter(Boolean)
          .map((value) => String(value))
          .includes(requestedId)
      ));

      const candidateIds = [...new Set([
        targetShipment?.shipmentId,
        requestedId,
        targetShipment?.id,
        targetShipment?.trackingId,
        targetShipment?.trackingNumber
      ].filter(Boolean).map((value) => String(value)))];

      let deleted = false;
      let lastError = null;
      for (const candidateId of candidateIds) {
        try {
          await shipmentService.deleteShipment(candidateId);
          deleted = true;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!deleted) {
        throw lastError || new Error('Failed to delete shipment from database');
      }

      const removedIds = new Set(candidateIds);
      setShipments((prev) => prev.filter((shipment) => {
        const identifiers = [shipment.shipmentId, shipment.id, shipment.trackingId, shipment.trackingNumber]
          .filter(Boolean)
          .map((value) => String(value));
        return !identifiers.some((value) => removedIds.has(value));
      }));
      addNotification('Shipment deleted.', 'customer');
      await refreshShipments();
      return true;
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

  const requestRoleUpgrade = async (requestedRole, reason = '', details = {}) => {
      if (!currentUser) throw new Error('Please login first');
      if (normalizeRole(currentUser.role) !== 'customer') {
        throw new Error('Only customers can request role upgrade');
      }

      const customerIdentities = [
        currentUser?.userId,
        currentUser?.id,
        currentUser?.email
      ].map(toIdentityValue).filter(Boolean);

      const existingPending = roleRequests.find(
        (request) => isPendingRoleRequestStatus(request?.status) && roleRequestMatchesAnyIdentity(request, customerIdentities)
      );

      if (existingPending) {
        throw new Error('You already have a pending request');
      }

      const existingApproved = roleRequests.find((request) => {
        if (normalizeRoleRequestStatus(request?.status) !== 'APPROVED') return false;
        return roleRequestMatchesAnyIdentity(request, customerIdentities);
      });
      if (existingApproved) {
        throw new Error('Your previous request was approved. Please login again.');
      }

      const customerIdentityCandidates = buildIdentityCandidates(
        currentUser?.userId,
        currentUser?.id,
        currentUser?.email
      );
      const primaryProfileUserId = customerIdentityCandidates[0] || '';

      const request = {
        id: `rr-${Date.now()}`,
        userId: primaryProfileUserId || currentUser.userId || currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        currentRole: normalizeRole(currentUser.role),
        requestedRole: normalizeRole(requestedRole || 'agent'),
        reason: String(reason || '').trim(),
        agentDetails: {
          licenseNumber: String(details?.licenseNumber || '').trim(),
          aadharNumber: String(details?.aadharNumber || '').trim(),
          vehicleNumber: String(details?.vehicleNumber || '').trim(),
          rcBookNumber: String(details?.rcBookNumber || '').trim(),
          bloodType: String(details?.bloodType || '').trim(),
          organDonor: Boolean(details?.organDonor),
          bankAccountHolder: String(details?.bankAccountHolder || '').trim(),
          bankAccountNumber: String(details?.bankAccountNumber || '').trim(),
          bankIfsc: String(details?.bankIfsc || '').trim().toUpperCase(),
          bankName: String(details?.bankName || '').trim(),
          shiftTiming: String(details?.shiftTiming || 'Day').trim(),
          profilePhoto: details?.profilePhoto || null
        },
        documents: {
          profilePhoto: details?.profilePhoto || null,
          aadharCopy: details?.aadharCopy || null,
          licenseCopy: details?.licenseCopy || null,
          rcBookCopy: details?.rcBookCopy || null
        },
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };

      const backendProfiles = [];
      for (const identity of customerIdentityCandidates) {
        const profile = await operationsService.getAgentProfile(identity);
        if (profile) {
          backendProfiles.push({ identity, profile });
        }
      }
      const backendStatuses = backendProfiles.map((item) => normalizeRoleRequestStatus(item.profile?.verificationStatus || 'PENDING'));
      if (backendStatuses.some((status) => ['VERIFIED', 'APPROVED'].includes(status))) {
        throw new Error('Your previous request was approved. Please login again.');
      }
      if (
        backendStatuses.some((status) => ['PENDING', 'PENDING_VERIFICATION'].includes(status)) &&
        !backendStatuses.some((status) => status === 'REJECTED')
      ) {
          throw new Error('You already have a pending request');
      }

      try {
        if (primaryProfileUserId) {
          await operationsService.upsertAgentProfile(primaryProfileUserId, {
            licenseNumber: request.agentDetails.licenseNumber || undefined,
            aadharNumber: request.agentDetails.aadharNumber || undefined,
            vehicleNumber: request.agentDetails.vehicleNumber || undefined,
            rcBookNumber: request.agentDetails.rcBookNumber || undefined,
            bloodType: request.agentDetails.bloodType || undefined,
            organDonor: request.agentDetails.organDonor ?? false,
            shiftTiming: request.agentDetails.shiftTiming || 'Day',
            profileImage: request.documents.profilePhoto || undefined,
            aadharCopy: request.documents.aadharCopy || undefined,
            licenseCopy: request.documents.licenseCopy || undefined,
            rcBookCopy: request.documents.rcBookCopy || undefined,
            bankAccountHolder: request.agentDetails.bankAccountHolder || undefined,
            bankAccountNumber: request.agentDetails.bankAccountNumber || undefined,
            bankIfsc: request.agentDetails.bankIfsc || undefined,
            bankName: request.agentDetails.bankName || undefined,
            salaryBalance: 0,
            totalSalaryCredited: 0,
            totalSalaryDebited: 0,
            verificationStatus: 'PENDING',
            verificationNotes: request.reason || 'Role upgrade request submitted by customer',
            availabilityStatus: 'OFFLINE',
            deliveredCount: 0,
            failedCount: 0,
            inTransitCount: 0
          });
        }
      } catch (error) {
        // Keep local role-request flow available even when operations service is down.
        console.warn('Failed to persist role request in operations profile store', error);
      }

      setRoleRequests(prev => [request, ...prev].slice(0, MAX_ROLE_REQUESTS));
      persistRoleRequestDocuments(request, [primaryProfileUserId]);
      addNotification('Role upgrade request submitted to admin.', 'customer');
      addNotification(`New agent access request from ${request.name || request.email}.`, 'admin');
      return request;
  };

  const markRoleRequestPending = async (requestInput) => {
      const inputRequest = typeof requestInput === 'object' ? requestInput : null;
      const inputId = typeof requestInput === 'string' ? requestInput : requestInput?.id;
      const inputIdentity = toIdentityValue(
        inputRequest?.userId ||
        inputRequest?.email ||
        inputId
      );
      const inputIdentitySet = [...new Set([
        ...getRoleRequestIdentityValues(inputRequest || {}),
        inputIdentity
      ].filter(Boolean))];

      const existingRequest = (roleRequests || []).find((request) => {
        if (inputId && request.id === inputId) return true;
        return inputIdentitySet.length > 0 && roleRequestMatchesAnyIdentity(request, inputIdentitySet);
      }) || null;

      const source = inputRequest || existingRequest;
      if (!source) {
        throw new Error('Role request not found');
      }

      const now = new Date().toISOString();
      const normalizedRequest = {
        id: source.id || `rr-${Date.now()}`,
        userId: source.userId || source.id || source.email || '',
        email: source.email || '',
        name: source.name || source.fullName || source.email || 'User',
        currentRole: normalizeRole(source.currentRole || 'customer'),
        requestedRole: normalizeRole(source.requestedRole || 'agent'),
        reason: source.reason || '',
        agentDetails: source.agentDetails || {},
        documents: source.documents || {},
        status: 'PENDING_VERIFICATION',
        createdAt: source.createdAt || now,
        reviewedAt: now,
        reviewedBy: currentUser?.email || currentUser?.userId || 'admin'
      };

      setRoleRequests((prev) => {
        const next = [...prev];
        const existingIndex = next.findIndex((request) => {
          if (normalizedRequest.id && request.id === normalizedRequest.id) return true;
          const requestIdentity = toIdentityValue(request.userId || request.email || request.id);
          const normalizedIdentity = toIdentityValue(
            normalizedRequest.userId ||
            normalizedRequest.email ||
            normalizedRequest.id
          );
          return Boolean(normalizedIdentity) && requestIdentity === normalizedIdentity;
        });

        if (existingIndex >= 0) {
          next[existingIndex] = { ...next[existingIndex], ...normalizedRequest };
        } else {
          next.unshift(normalizedRequest);
        }
        return next.slice(0, MAX_ROLE_REQUESTS);
      });

      const profileUserId = normalizedRequest.userId || normalizedRequest.email;
      if (profileUserId) {
        try {
          await operationsService.upsertAgentProfile(profileUserId, {
            licenseNumber: normalizedRequest.agentDetails?.licenseNumber || undefined,
            aadharNumber: normalizedRequest.agentDetails?.aadharNumber || undefined,
            vehicleNumber: normalizedRequest.agentDetails?.vehicleNumber || undefined,
            rcBookNumber: normalizedRequest.agentDetails?.rcBookNumber || undefined,
            bloodType: normalizedRequest.agentDetails?.bloodType || undefined,
            organDonor: normalizedRequest.agentDetails?.organDonor ?? false,
            profileImage: normalizedRequest.documents?.profilePhoto || undefined,
            aadharCopy: normalizedRequest.documents?.aadharCopy || undefined,
            licenseCopy: normalizedRequest.documents?.licenseCopy || undefined,
            rcBookCopy: normalizedRequest.documents?.rcBookCopy || undefined,
            verificationStatus: 'PENDING',
            verificationNotes: 'Moved to admin document verification queue'
          });
        } catch (error) {
          console.warn('Failed to persist pending verification state', error);
        }
      }

      addNotification('Agent request moved to verification queue.', 'admin');
      return normalizedRequest;
  };

    const approveRoleRequest = async (requestInput) => {
      const requestId = typeof requestInput === 'string' ? requestInput : requestInput?.id;
      const requestIdentity = toIdentityValue(
        requestInput?.userId ||
        requestInput?.email ||
        requestId
      );
      const requestIdentitySet = [...new Set([
        ...getRoleRequestIdentityValues(requestInput || {}),
        requestIdentity
      ].filter(Boolean))];
      const requestRecord = typeof requestInput === 'object'
        ? requestInput
        : (roleRequests || []).find((request) => {
          const sameId = requestId && String(request?.id || '') === String(requestId);
          const sameIdentity = requestIdentitySet.length > 0 && roleRequestMatchesAnyIdentity(request, requestIdentitySet);
          return sameId || sameIdentity;
        });

      if (!requestRecord) {
        throw new Error("Invalid request object provided.");
      }

      // Use the user ID from the request, fallback to email if not present
      const userIdentifier = requestRecord.userId || requestRecord.email;
      if (!userIdentifier) {
          throw new Error("No user identifier found in the request.");
      }
      
      const roleToAssign = requestRecord.requestedRole || 'agent';

      const fallbackUser = users.find((user) => {
        const requestIdentities = [
          requestRecord.userId,
          requestRecord.email
        ].map(toIdentityValue).filter(Boolean);
        const userIdentities = [
          user.userId,
          user.id,
          user.email
        ].map(toIdentityValue).filter(Boolean);
        return requestIdentities.some((identity) => userIdentities.includes(identity));
      }) || null;

      const profileUserId =
        fallbackUser?.userId ||
        fallbackUser?.id ||
        requestRecord.userId ||
        requestRecord.email;

      const requestedAgentDetails = requestRecord.agentDetails || {};
      const requestedDocs = readRoleRequestDocuments(requestRecord);

      if (roleToAssign === 'agent') {
        try {
          await operationsService.upsertAgentProfile(profileUserId, {
            licenseNumber: requestedAgentDetails.licenseNumber || undefined,
            aadharNumber: requestedAgentDetails.aadharNumber || undefined,
            vehicleNumber: requestedAgentDetails.vehicleNumber || undefined,
            rcBookNumber: requestedAgentDetails.rcBookNumber || undefined,
            bloodType: requestedAgentDetails.bloodType || undefined,
            organDonor: requestedAgentDetails.organDonor ?? false,
            shiftTiming: requestedAgentDetails.shiftTiming || 'Day',
            profileImage: requestedDocs.profilePhoto || undefined,
            aadharCopy: requestedDocs.aadharCopy || undefined,
            licenseCopy: requestedDocs.licenseCopy || undefined,
            rcBookCopy: requestedDocs.rcBookCopy || undefined,
            bankAccountHolder: requestedAgentDetails.bankAccountHolder || undefined,
            bankAccountNumber: requestedAgentDetails.bankAccountNumber || undefined,
            bankIfsc: requestedAgentDetails.bankIfsc || undefined,
            bankName: requestedAgentDetails.bankName || undefined,
            salaryBalance: 0,
            totalSalaryCredited: 0,
            totalSalaryDebited: 0,
            verificationStatus: 'VERIFIED',
            verifiedBy: currentUser?.name || currentUser?.email || 'Admin',
            verificationNotes: requestRecord.reason ? `Approved request: ${requestRecord.reason}` : 'Approved role request',
            availabilityStatus: 'AVAILABLE',
            deliveredCount: 0,
            failedCount: 0,
            inTransitCount: 0
          });
        } catch (error) {
          console.warn('Failed to save agent profile during approval. Proceeding with role update.', error);
        }
      }

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
      const reviewedAt = new Date().toISOString();
      const reviewedBy = currentUser?.email || currentUser?.userId || 'admin';
      setRoleRequests((prev) => {
        let matched = false;
        const next = prev.map((item) => {
          const sameId = requestId && String(item?.id || '') === String(requestId);
          const sameIdentity = requestIdentitySet.length > 0 && roleRequestMatchesAnyIdentity(item, requestIdentitySet);
          if (!sameId && !sameIdentity) return item;
          matched = true;
          return {
            ...item,
            status: 'APPROVED',
            reviewedAt,
            reviewedBy
          };
        });
        if (matched) return next;
        return [{
          ...requestRecord,
          id: requestRecord.id || requestId || `rr-${Date.now()}`,
          status: 'APPROVED',
          reviewedAt,
          reviewedBy
        }, ...next].slice(0, MAX_ROLE_REQUESTS);
      });

      if (roleToAssign === 'agent') {
        persistRoleRequestDocuments(requestRecord, [profileUserId]);
      }

      await loadUsersFromDb();

      const targetUserId = requestRecord.userId || requestRecord.email;
      if (targetUserId) {
        try {
          await communicationService.sendNotification(targetUserId, 'IN_APP', 'Your agent access request was approved by admin.');
        } catch {
          // non-blocking notification
        }
      }
      addNotification('Agent request approved successfully.', 'admin');

      // If the approved user is the one currently logged in, refresh their session data.
      if (toIdentityValue(currentUser?.email || currentUser?.userId || currentUser?.id) === toIdentityValue(targetUserId)) {
        try {
          const baseUser = await authService.getProfile();
          const user = applyRoleOverride(baseUser);
          setCurrentUser(user);
          authStorage.setCurrentUser(user);
        } catch {
          // best-effort session refresh
        }
      }
  };

  const rejectRoleRequest = async (requestInput) => {
      const requestId = typeof requestInput === 'string' ? requestInput : requestInput?.id;
      const requestIdentity = toIdentityValue(
        requestInput?.userId ||
        requestInput?.email ||
        requestId
      );
      const requestIdentitySet = [...new Set([
        ...getRoleRequestIdentityValues(requestInput || {}),
        requestIdentity
      ].filter(Boolean))];
      const requestRecord = typeof requestInput === 'object'
        ? requestInput
        : (roleRequests || []).find((request) => {
          const sameId = requestId && String(request?.id || '') === String(requestId);
          const sameIdentity = requestIdentitySet.length > 0 && roleRequestMatchesAnyIdentity(request, requestIdentitySet);
          return sameId || sameIdentity;
        });
      if (!requestRecord) {
        throw new Error('Role request not found');
      }

      const matchedUser = (users || []).find((user) => {
        const requestIdentities = getRoleRequestIdentityValues(requestRecord);
        const userIdentities = [user?.userId, user?.id, user?.email].map(toIdentityValue).filter(Boolean);
        return requestIdentities.some((identity) => userIdentities.includes(identity));
      }) || null;
      const targetIdentityCandidates = buildIdentityCandidates(
        requestRecord?.userId,
        requestRecord?.email,
        requestRecord?.id,
        matchedUser?.userId,
        matchedUser?.id,
        matchedUser?.email
      );

      for (const identity of targetIdentityCandidates) {
        try {
          await authService.updateUserRole(identity, 'customer');
          break;
        } catch {
          // try next identity
        }
      }

      for (const identity of targetIdentityCandidates) {
        try {
          await operationsService.verifyAgentProfile(identity, {
            verified: false,
            verifiedBy: currentUser?.name || currentUser?.email || 'Admin',
            verificationNotes: 'Rejected by admin'
          });
        } catch {
          // non-blocking backend verification update
        }
      }

      const reviewedAt = new Date().toISOString();
      const reviewedBy = currentUser?.email || currentUser?.userId || 'admin';
      setRoleRequests((prev) => {
        let matched = false;
        const next = prev.map((request) => {
          const sameId = requestId && String(request?.id || '') === String(requestId);
          const sameIdentity = requestIdentitySet.length > 0 && roleRequestMatchesAnyIdentity(request, requestIdentitySet);
          if (!sameId && !sameIdentity) return request;
          matched = true;
          return {
            ...request,
            status: 'REJECTED',
            reviewedAt,
            reviewedBy
          };
        });
        if (matched) return next;
        if (!requestRecord) return next;
        return [{
          ...requestRecord,
          id: requestRecord.id || requestId || `rr-${Date.now()}`,
          status: 'REJECTED',
          reviewedAt,
          reviewedBy
        }, ...next].slice(0, MAX_ROLE_REQUESTS);
      });

      const targetUserId = targetIdentityCandidates[0] || requestRecord?.userId || requestRecord?.email;
      if (targetUserId) {
        try {
          await communicationService.sendNotification(targetUserId, 'IN_APP', 'Your agent access request was rejected by admin.');
        } catch {
          // non-blocking notification
        }
      }
      addNotification('Agent request rejected. User remains customer.', 'admin');
  };

  const updatePricingConfig = (nextConfig = {}) => {
      setPricingConfig((prev) => {
        const profitCandidate = Number(nextConfig?.profitPercentage ?? prev?.profitPercentage ?? 20);
        const normalizedProfit = Number.isFinite(profitCandidate)
          ? Math.min(100, Math.max(0, profitCandidate))
          : 20;
        return {
          ...prev,
          ...nextConfig,
          profitPercentage: normalizedProfit
        };
      });
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

      try {
        await authService.updateUserRole(target.userId || target.id || target.email, nextRole);
      } catch (error) {
        if (String(error.message).includes('found') || String(error.message).includes('Failed to update') || String(error.message).includes('404')) {
          console.warn("Backend update failed (likely mock user). Applying locally:", error.message);
        } else {
          throw error;
        }
      }

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

  const removeVehicle = async (vehicleId) => {
      await adminService.deleteVehicle(vehicleId);
      setVehicles(prev => prev.filter(v => v.id !== vehicleId && v.vehicleId !== vehicleId));
      addNotification('Vehicle removed successfully.', 'admin');
      setLastDataSyncAt(new Date().toISOString());
  };

  const updateBranchStatus = async (branchId, status) => {
      const existing = branches.find((b) => b.id === branchId || b.branchId === branchId);
      if (!existing) {
        throw new Error('Branch not found');
      }
      const savedBranch = await adminService.updateBranch(branchId, {
        ...existing,
        status
      });
      setBranches(prev => prev.map(b => (b.id === savedBranch.id || b.branchId === savedBranch.branchId) ? savedBranch : b));
      setLastDataSyncAt(new Date().toISOString());
      return savedBranch;
  };

  const updateVehicleStatus = async (vehicleId, status) => {
      const existing = vehicles.find((v) => v.id === vehicleId || v.vehicleId === vehicleId);
      if (!existing) {
        throw new Error('Vehicle not found');
      }
      const savedVehicle = await adminService.updateVehicle(vehicleId, {
        ...existing,
        status
      });
      setVehicles(prev => prev.map(v => (v.id === savedVehicle.id || v.vehicleId === savedVehicle.vehicleId) ? savedVehicle : v));
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
  };

  const getRoleNotifications = (role) => {
      const dismissed = new Set(dismissedNotificationIds.map((value) => String(value).trim()));
      return notifications.filter((n) => {
        const roleName = String(n?.role || 'all').toLowerCase();
        const notificationId = String(n?.id || '').trim();
        if (notificationId && dismissed.has(notificationId)) return false;
        return !roleName || roleName === String(role || '').toLowerCase() || roleName === 'all';
      });
  };

  const dismissNotification = (notificationId) => {
    const normalizedId = String(notificationId || '').trim();
    if (!normalizedId) return;
    setDismissedNotificationIds((prev) => (
      prev.includes(normalizedId) ? prev : [normalizedId, ...prev].slice(0, 500)
    ));
    setNotifications((prev) => prev.filter((item) => String(item?.id || '').trim() !== normalizedId));
  };

  const notifyAdminFromAgent = async (message) => {
      const text = String(message || '').trim();
      if (!text) throw new Error('Message is required');

      const senderName = currentUser?.name || currentUser?.email || currentUser?.userId || 'Agent';
      const senderId = currentUser?.userId || currentUser?.id || currentUser?.email || senderName;
      const composed = `Agent message from ${senderName}: ${text}`;

      const ticket = await communicationService.createTicket({
        userId: senderId,
        subject: `Agent Operational Message - ${senderName}`,
        category: 'Operations',
        priority: 'Medium',
        message: text,
        senderName,
        senderRole: 'agent'
      });

      try {
        await communicationService.sendNotification('ADMIN', 'IN_APP', composed);
      } catch {
        // Non-blocking: fallback to in-app notification state
      }

      addNotification(composed, 'admin', 'INFO');
      return ticket;
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
      const actorName = currentUser?.name || currentUser?.email || 'User';
      const ticketRef = created?.id || 'Ticket';
      addNotification(`${ticketRef} created by ${actorName}: ${created?.subject || ticketData?.subject || 'Support Ticket'}`, 'all', 'INFO');
      try {
        await Promise.allSettled([
          communicationService.sendNotification(effectiveUserId, 'IN_APP', `Ticket created: ${created.subject}`),
          communicationService.sendNotification('ADMIN', 'IN_APP', `Ticket ${ticketRef} created by ${actorName}`)
        ]);
      } catch {
        // Non-blocking notification call
      }
      return created;
    };

    const replySupportTicket = async (ticketId, message) => {
      const updated = await communicationService.replyTicket(ticketId, {
        senderId: currentUser?.userId || currentUser?.id || currentUser?.email,
        senderName: currentUser?.name || currentUser?.email || 'Support',
        senderRole: currentUser?.role || 'customer',
        message
      });
      const actorName = currentUser?.name || currentUser?.email || 'User';
      const ticketRef = updated?.id || ticketId;
      addNotification(`${ticketRef} replied by ${actorName}`, 'all', 'INFO');
      try {
        if (updated?.userId) {
          await communicationService.sendNotification(updated.userId, 'IN_APP', `New reply on ${ticketRef}`);
        }
      } catch {
        // Non-blocking notification call
      }
      return updated;
    };

    const updateSupportTicketStatus = async (ticketId, status, assignment = {}) => {
      const updated = await communicationService.updateTicketStatus(ticketId, {
        status,
        assignedToRole: assignment.assignedToRole,
        assignedToUserId: assignment.assignedToUserId
      });
      const readableStatus = String(updated?.status || status || '').replace(/_/g, ' ').trim();
      const ticketRef = updated?.id || ticketId;
      addNotification(`${ticketRef} status updated to ${readableStatus}`, 'all', 'INFO');
      try {
        if (updated?.userId) {
          await communicationService.sendNotification(updated.userId, 'IN_APP', `${ticketRef} status: ${readableStatus}`);
        }
      } catch {
        // Non-blocking notification call
      }
      return updated;
    };

    const closeSupportTicket = async (ticketId) => {
      return communicationService.closeTicket(ticketId);
    };

    const deleteSupportTicket = async (ticketId) => {
      const deleted = await communicationService.deleteTicket(ticketId);
      addNotification(`${ticketId} was deleted`, 'all', 'INFO');
      return deleted;
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
    setDismissedNotificationIds([]);
  };

  useEffect(() => {
    if (!currentUser) return;

    refreshUserNotifications(currentUser.userId || currentUser.id);
    const interval = setInterval(() => {
      refreshUserNotifications(currentUser.userId || currentUser.id);
    }, 20000);

    return () => clearInterval(interval);
  }, [currentUser?.userId, currentUser?.id, dismissedNotificationIds]);

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
      pricingConfig,
      lastDataSyncAt,
      isLoading,
      isRefreshing,
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
      removeVehicle,
      updateBranchStatus,
      updateVehicleStatus,
      addStaff,
      removeStaff,
      updateStaff,
      updateProfile,
      requestRoleUpgrade,
      markRoleRequestPending,
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
      dismissNotification,
      notifyAdminFromAgent,
      updatePricingConfig,
      calculateRate,
      clearAllData
    }}>
      {children}
    </ShipmentContext.Provider>
  );
}
