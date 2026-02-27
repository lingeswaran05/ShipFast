import axios from 'axios';
import { authStorage } from './authService';
import { resolveServiceBaseUrls, toServiceBaseUrl, shouldRetryWithFallback } from './apiConfig';

const SHIPMENT_BASE_CANDIDATES = resolveServiceBaseUrls(import.meta.env.VITE_SHIPMENT_BASE_URL, {
  localDirectBase: 'http://localhost:8088'
});
const SHIPMENT_BASE_URLS = SHIPMENT_BASE_CANDIDATES
  .map((base) => toServiceBaseUrl(base, '/api/v1/shipments'))
  .filter((value, index, list) => list.indexOf(value) === index);
const api = axios.create({
  baseURL: SHIPMENT_BASE_URLS[0],
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let activeShipmentBaseIndex = 0;
const setActiveShipmentBase = (index) => {
  activeShipmentBaseIndex = index;
  api.defaults.baseURL = SHIPMENT_BASE_URLS[index] || SHIPMENT_BASE_URLS[0];
};

const withShipmentBaseFallback = async (requestFactory, options = {}) => {
  const { retryOnFailure = true } = options;
  let lastError;
  for (let offset = 0; offset < SHIPMENT_BASE_URLS.length; offset += 1) {
    const index = (activeShipmentBaseIndex + offset) % SHIPMENT_BASE_URLS.length;
    setActiveShipmentBase(index);
    try {
      return await requestFactory(api);
    } catch (error) {
      lastError = error;
      const shouldRetry = retryOnFailure && shouldRetryWithFallback(error) && offset < SHIPMENT_BASE_URLS.length - 1;
      if (!shouldRetry) throw error;
    }
  }
  throw lastError;
};

const endpointAvailability = {
  list: true,
  mine: true,
  create: true,
  update: true,
  rate: true
};

api.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const splitAddress = (value = '') => {
  const parts = String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
  if (parts.length === 0) return { address: '', city: '', pincode: '' };
  if (parts.length === 1) return { address: parts[0], city: parts[0], pincode: '' };
  if (parts.length === 2) {
    const secondLooksLikePincode = /^[0-9]{4,8}$/.test(parts[1]);
    if (secondLooksLikePincode) {
      return { address: parts[0], city: parts[0], pincode: parts[1] };
    }
    return { address: parts[0], city: parts[1], pincode: '' };
  }
  return {
    address: parts.slice(0, parts.length - 2).join(', ') || parts[0],
    city: parts[parts.length - 2] || '',
    pincode: parts[parts.length - 1] || ''
  };
};

const composeAddress = (address, city, pincode) => {
  return [address, city, pincode].map((item) => String(item || '').trim()).filter(Boolean).join(', ');
};

const normalizeServiceType = (value) => {
  const input = String(value || 'Standard').toLowerCase().replace(/[_-]/g, ' ').trim();
  if (input === 'express') return 'Express';
  if (input === 'same day' || input === 'sameday') return 'Same Day';
  return 'Standard';
};

const normalizePaymentMethod = (value) => {
  const input = String(value || '').toLowerCase().trim();
  if (input === 'cash' || input === 'cod') return 'COD';
  if (input === 'upi') return 'UPI';
  if (input === 'card') return 'CARD';
  return 'ONLINE';
};

const normalizeShipmentStatus = (status) => {
  const raw = String(status || 'Booked').replace(/_/g, ' ').trim().toLowerCase();
  if (!raw) return 'Booked';
  return raw.split(/\s+/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const resolveUserIdentifier = (userId) => {
  if (userId) return userId;
  const current = authStorage.getCurrentUser() || {};
  return current.userId || current.id || current.email || '';
};

const toIdentityValue = (value) => String(value || '').trim().toLowerCase();

const mapShipment = (shipment = {}) => {
  const sender = shipment.sender || {};
  const receiver = shipment.recipient || shipment.receiver || {};
  const senderParsed = splitAddress(sender.addressLine || sender.address || '');
  const receiverParsed = splitAddress(receiver.addressLine || receiver.address || '');
  const createdAt = shipment.createdAt ? new Date(shipment.createdAt) : new Date();
  const deliveredAt = shipment.deliveredAt ? new Date(shipment.deliveredAt) : null;
  const paymentMode = shipment.paymentMethod || shipment.paymentMode || 'ONLINE';
  const normalizedStatus = normalizeShipmentStatus(shipment.status);
  const hasCollectedAt = Boolean(shipment.paymentCollectedAt);
  const inferredPaymentStatus = String(paymentMode).toUpperCase() === 'COD'
    ? (hasCollectedAt ? 'SUCCESS' : 'PENDING')
    : 'SUCCESS';
  const paymentStatus = shipment.paymentStatus || inferredPaymentStatus;
  const originCity = sender.city || senderParsed.city || shipment.originCity || '';
  const destinationCity = receiver.city || receiverParsed.city || shipment.destinationCity || '';
  const senderAddress = senderParsed.address || sender.address || sender.addressLine || '';
  const receiverAddress = receiverParsed.address || receiver.address || receiver.addressLine || '';
  const mappedHistory = Array.isArray(shipment.history)
    ? shipment.history.map((event) => ({
      status: normalizeShipmentStatus(event.status),
      location: event.location || '',
      remarks: event.remarks || '',
      timestamp: event.timestamp || null
    }))
    : [];
  const originValue = shipment.origin || [senderAddress, originCity].filter(Boolean).join(', ');
  const destinationValue = shipment.destination || [receiverAddress, destinationCity].filter(Boolean).join(', ');
  const databaseId = shipment.id || shipment.shipmentId || null;
  const trackingValue = shipment.trackingNumber || shipment.trackingId || databaseId;
  const runSheetId = shipment.runSheetId || shipment.runsheetId || shipment.runSheetNumber || shipment.sheetId || null;

  return {
    id: trackingValue,
    shipmentId: databaseId || trackingValue,
    trackingId: trackingValue,
    trackingNumber: trackingValue,
    customerId: shipment.customerId || shipment.userId || null,
    userId: shipment.userId || shipment.customerId || null,
    customerEmail: shipment.customerEmail || shipment.email || shipment.customer?.email || '',
    customerName: shipment.customerName || shipment.customer?.name || '',
    createdBy: shipment.createdBy || '',
    ownerId: shipment.ownerId || '',
    email: shipment.email || '',
    status: normalizedStatus,
    service: shipment.serviceType || 'Standard',
    type: shipment.serviceType || 'Standard',
    paymentMode,
    paymentStatus,
    paymentCollectedAt: shipment.paymentCollectedAt || null,
    cost: Number(shipment.cost ?? shipment.totalCost ?? 0) || 0,
    date: createdAt.toISOString().split('T')[0],
    createdAt: shipment.createdAt || createdAt.toISOString(),
    updatedAt: shipment.updatedAt || shipment.createdAt || createdAt.toISOString(),
    origin: originValue,
    destination: destinationValue,
    runSheetId,
    assignedAgentId: shipment.assignedAgentId || null,
    proofOfDeliveryImage: shipment.proofOfDeliveryImage || shipment.podImage || null,
    deliveredBy: shipment.deliveredBy || null,
    deliveredByAgentId: shipment.deliveredByAgentId || null,
    rating: shipment.rating ?? null,
    ratingComment: shipment.ratingComment || '',
    deliveryDate: deliveredAt ? deliveredAt.toISOString().split('T')[0] : null,
    history: mappedHistory,
    sender: {
      name: sender.name || '',
      phone: sender.phone || '',
      address: senderAddress,
      city: originCity,
      pincode: senderParsed.pincode
    },
    receiver: {
      name: receiver.name || '',
      phone: receiver.phone || '',
      address: receiverAddress,
      city: destinationCity,
      pincode: receiverParsed.pincode
    },
    weight: shipment.packageDetails?.weight || shipment.weight || 0
  };
};

const getErrorMessage = (error, fallback) => (
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback
);

const getStatusCode = (error) => Number(error?.response?.status || 0);
const isUnavailableError = (error) => {
  const status = getStatusCode(error);
  return status === 404 || error?.message === 'Network Error';
};

const fallbackRate = ({ weight = 0, serviceType = 'Standard' } = {}) => {
  const normalizedWeight = Number(weight || 0);
  const base = String(serviceType || '').toLowerCase() === 'express' ? 100 : 50;
  const totalCost = Math.max(0, (normalizedWeight * 50) + base);
  return { totalCost };
};

export const shipmentService = {
  async getAllShipments(filters = {}) {
    if (!endpointAvailability.list) return [];
    try {
      const response = await withShipmentBaseFallback((client) => client.get('', {
        params: {
          status: filters.status,
          branchId: filters.branchId,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          page: filters.page,
          limit: filters.limit
        }
      }));
      const payload = response?.data;
      const list = Array.isArray(payload) ? payload : payload?.data || payload?.content || [];
      return list.map(mapShipment);
    } catch (error) {
      if (isUnavailableError(error)) {
        endpointAvailability.list = false;
        return [];
      }
      throw new Error(getErrorMessage(error, 'Failed to load all shipments'));
    }
  },

  async getShipments(userId) {
    if (!endpointAvailability.mine) return [];
    try {
      const identifier = resolveUserIdentifier(userId);
      if (!identifier) return [];
      const response = await withShipmentBaseFallback((client) => client.get('/mine', {
        params: { userId: identifier }
      }));
      const payload = response?.data;
      const list = Array.isArray(payload) ? payload : payload?.data || [];
      return list.map(mapShipment);
    } catch (error) {
      const identifier = resolveUserIdentifier(userId);

      if (identifier) {
        try {
          const all = await this.getAllShipments();
          const current = authStorage.getCurrentUser() || {};
          const identities = [
            identifier,
            current.userId,
            current.id,
            current.email
          ].map(toIdentityValue).filter(Boolean);
          return all.filter((item) => {
            const candidates = [
              item.customerId,
              item.userId,
              item.createdBy,
              item.ownerId,
              item.customerEmail,
              item.email,
              item.customerName
            ].map(toIdentityValue);
            return identities.some((identity) => candidates.includes(identity));
          });
        } catch {
          // Continue to error handling below
        }
      }

      if (isUnavailableError(error)) {
        endpointAvailability.mine = false;
        return [];
      }
      throw new Error(getErrorMessage(error, 'Failed to load shipments'));
    }
  },

  async getShipmentByTracking(id) {
    try {
      const response = await withShipmentBaseFallback((client) => client.get(`/track/${encodeURIComponent(id)}`));
      return mapShipment(response?.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to load shipment'));
    }
  },

  async getShipmentByIdentifier(id) {
    if (!id) throw new Error('Shipment identifier is required');
    try {
      return await this.getShipmentByTracking(id);
    } catch {
      try {
        const response = await withShipmentBaseFallback((client) => client.get(`/${encodeURIComponent(id)}`));
        return mapShipment(response?.data);
      } catch (error) {
        throw new Error(getErrorMessage(error, 'Failed to load shipment'));
      }
    }
  },

  async createShipment(payload, userId) {
    if (!endpointAvailability.create) {
      throw new Error('Shipment create endpoint is unavailable');
    }
    const identifier = resolveUserIdentifier(userId);
    const request = {
      customerId: identifier || undefined,
      serviceType: normalizeServiceType(payload.type || payload.service),
      paymentMethod: normalizePaymentMethod(payload.paymentMode),
      sender: {
        name: payload.sender?.name,
        phone: payload.sender?.phone,
        address: composeAddress(payload.sender?.address, payload.sender?.city, payload.sender?.pincode)
      },
      recipient: {
        name: payload.receiver?.name,
        phone: payload.receiver?.phone,
        address: composeAddress(payload.receiver?.address, payload.receiver?.city, payload.receiver?.pincode)
      },
      packageDetails: {
        weight: Number(payload.weight || payload.package?.weight || 0),
        type: payload.package?.type || 'Standard',
        description: payload.package?.description || ''
      },
      quotedCost: (() => {
        const value = Number(payload.cost ?? payload.totalCost ?? payload.quote);
        return Number.isFinite(value) && value > 0 ? value : undefined;
      })()
    };

    try {
      const response = await withShipmentBaseFallback((client) => client.post('', request, {
        params: identifier ? { userId: identifier } : undefined
      }));
      return mapShipment(response?.data);
    } catch (error) {
      if (isUnavailableError(error)) {
        endpointAvailability.create = false;
      }
      throw new Error(getErrorMessage(error, 'Failed to create shipment'));
    }
  },

  async updateStatus(id, status, userId, metadata = {}) {
    if (!endpointAvailability.update) {
      throw new Error('Shipment update endpoint is unavailable');
    }
    const requestBody = {
      status: String(status || '').toUpperCase().replace(/ /g, '_')
    };
    if (metadata?.location) requestBody.location = metadata.location;
    if (metadata?.remarks) requestBody.remarks = metadata.remarks;
    if (metadata?.proofOfDeliveryImage) requestBody.proofOfDeliveryImage = metadata.proofOfDeliveryImage;
    if (metadata?.deliveredBy) requestBody.deliveredBy = metadata.deliveredBy;
    if (metadata?.deliveredByAgentId) requestBody.deliveredByAgentId = metadata.deliveredByAgentId;
    if (metadata?.paymentStatus) requestBody.paymentStatus = metadata.paymentStatus;
    if (metadata?.paymentCollectedAt) requestBody.paymentCollectedAt = metadata.paymentCollectedAt;

    try {
      const response = await withShipmentBaseFallback((client) => client.patch(`/${encodeURIComponent(id)}/status`, requestBody, {
        params: userId ? { userId } : undefined
      }));
      return mapShipment(response?.data);
    } catch (error) {
      if (isUnavailableError(error)) {
        endpointAvailability.update = false;
      }
      throw new Error(getErrorMessage(error, 'Failed to update shipment status'));
    }
  },

  async assignShipment(idOrTracking, agentId, runSheetId = null) {
    try {
      const response = await withShipmentBaseFallback((client) => client.patch(`/${encodeURIComponent(idOrTracking)}/assign`, {
        agentId,
        ...(runSheetId ? { runSheetId } : {})
      }));
      return mapShipment(response?.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to assign shipment'));
    }
  },

  async addShipmentRating(idOrTracking, rating, comment = '') {
    try {
      const response = await withShipmentBaseFallback((client) => client.post(`/${encodeURIComponent(idOrTracking)}/rating`, {
        rating: Number(rating),
        comment
      }));
      return mapShipment(response?.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to submit shipment rating'));
    }
  },

  async deleteShipment(id) {
    try {
      await withShipmentBaseFallback((client) => client.delete(`/${encodeURIComponent(id)}`));
      return true;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to delete shipment'));
    }
  },

  async calculateRate(request) {
    if (!endpointAvailability.rate) {
      return fallbackRate(request);
    }
    try {
      const response = await withShipmentBaseFallback((client) => client.post('/calculate-rate', {
        weight: Number(request.weight || 0),
        serviceType: normalizeServiceType(request.serviceType),
        originPincode: request.originPincode,
        destinationPincode: request.destinationPincode
      }));
      return response?.data;
    } catch (error) {
      if (isUnavailableError(error)) {
        endpointAvailability.rate = false;
        return fallbackRate(request);
      }
      throw new Error(getErrorMessage(error, 'Failed to calculate shipment rate'));
    }
  }
};
